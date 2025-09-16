import * as THREE from 'three';
import { createCaravanTexture } from './textures.js';

export class CaravanManager {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.caravans = [];
        this.spawnTimer = 0;
        this.moveSpeed = 2.4;
        this.spawnInterval = 10;
        this.textures = {
            merchant: createCaravanTexture('merchant'),
            imperial_supply: createCaravanTexture('imperial_supply')
        };
        this.materials = {
            merchant: new THREE.MeshStandardMaterial({ map: this.textures.merchant, roughness: 0.75, metalness: 0.05 }),
            imperial_supply: new THREE.MeshStandardMaterial({ map: this.textures.imperial_supply, roughness: 0.5, metalness: 0.2 })
        };
        this.roadHalfLength = world.halfSize - 60;
        this.roadWidth = 70;
    }

    spawnCaravan() {
        const type = Math.random() > 0.5 ? 'merchant' : 'imperial_supply';
        const geometry = new THREE.BoxGeometry(1.2, 1.2, 2.2);
        const mesh = new THREE.Mesh(geometry, this.materials[type]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const roadZ = (Math.random() * 2 - 1) * (this.roadWidth * 0.5);
        const startX = -this.roadHalfLength;
        const startHeight = this.world.getHeightAt(startX, roadZ);
        mesh.position.set(startX, startHeight + 0.65, roadZ);
        const caravan = {
            mesh,
            type,
            targetX: this.roadHalfLength,
            roadZ,
            elapsed: 0,
            bobOffset: Math.random() * Math.PI * 2,
            speed: this.moveSpeed * (0.8 + Math.random() * 0.4)
        };
        this.scene.add(mesh);
        this.caravans.push(caravan);
    }

    update(delta) {
        this.spawnTimer += delta;
        if (this.spawnTimer > this.spawnInterval) {
            this.spawnCaravan();
            this.spawnTimer = 0;
        }
        this.caravans.forEach(c => {
            c.elapsed += delta;
            c.mesh.position.x += c.speed * delta;
            c.mesh.position.z = c.roadZ + Math.sin(c.elapsed * 0.7 + c.bobOffset) * 1.8;
            const ground = this.world.getHeightAt(c.mesh.position.x, c.mesh.position.z);
            c.mesh.position.y = ground + 0.65 + Math.sin(c.elapsed * 2.5 + c.bobOffset) * 0.04;
            c.mesh.rotation.y = Math.sin(c.elapsed * 1.1 + c.bobOffset) * 0.08;
        });
        this.caravans = this.caravans.filter(c => {
            if (c.mesh.position.x >= c.targetX) {
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
