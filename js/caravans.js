import * as THREE from 'three';
import { createCaravanTexture } from './textures.js';

export class CaravanManager {
    constructor(scene) {
        this.scene = scene;
        this.caravans = [];
        this.spawnTimer = 0;
        this.moveSpeed = 2.2;
        this.textures = {
            merchant: createCaravanTexture('merchant'),
            imperial_supply: createCaravanTexture('imperial_supply')
        };
        this.materials = {
            merchant: new THREE.MeshStandardMaterial({ map: this.textures.merchant, roughness: 0.75, metalness: 0.05 }),
            imperial_supply: new THREE.MeshStandardMaterial({ map: this.textures.imperial_supply, roughness: 0.5, metalness: 0.2 })
        };
    }

    spawnCaravan() {
        const type = Math.random() > 0.5 ? 'merchant' : 'imperial_supply';
        const geometry = new THREE.BoxGeometry(1.2, 1.2, 2.2);
        const mesh = new THREE.Mesh(geometry, this.materials[type]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const startX = -25 + Math.random() * 50;
        mesh.position.set(startX, 0.6, -28);
        const caravan = {
            mesh,
            type,
            targetZ: 28,
            elapsed: 0,
            bobOffset: Math.random() * Math.PI * 2,
            speed: this.moveSpeed * (0.8 + Math.random() * 0.4)
        };
        this.scene.add(mesh);
        this.caravans.push(caravan);
    }

    update(delta) {
        this.spawnTimer += delta;
        if (this.spawnTimer > 8) {
            this.spawnCaravan();
            this.spawnTimer = 0;
        }
        this.caravans.forEach(c => {
            c.elapsed += delta;
            c.mesh.position.z += c.speed * delta;
            c.mesh.position.y = 0.6 + Math.sin(c.elapsed * 2.5 + c.bobOffset) * 0.05;
            c.mesh.rotation.y = Math.sin(c.elapsed * 1.2 + c.bobOffset) * 0.1;
        });
        this.caravans = this.caravans.filter(c => {
            if (c.mesh.position.z >= c.targetZ) {
                this.scene.remove(c.mesh);
                return false;
            }
            return true;
        });
    }

    removeCaravan(caravan) {
        this.scene.remove(caravan.mesh);
        this.caravans = this.caravans.filter(c => c !== caravan);
    }
}
