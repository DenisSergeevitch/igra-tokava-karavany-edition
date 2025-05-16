import * as THREE from 'three';

export class CaravanManager {
    constructor(scene) {
        this.scene = scene;
        this.caravans = [];
        this.spawnTimer = 0;
    }

    spawnCaravan() {
        const type = Math.random() > 0.5 ? 'merchant' : 'imperial_supply';
        const geometry = new THREE.BoxGeometry(1, 1, 2);
        const material = new THREE.MeshLambertMaterial({ color: type === 'merchant' ? 0x8b4513 : 0xaaaaaa });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.position.set(-25 + Math.random() * 50, 0.5, -25);
        const targetZ = 25;
        const caravan = { mesh, type, targetZ };
        this.scene.add(mesh);
        this.caravans.push(caravan);
    }

    update(delta) {
        this.spawnTimer += delta;
        if (this.spawnTimer > 10) {
            this.spawnCaravan();
            this.spawnTimer = 0;
        }
        this.caravans.forEach(c => {
            c.mesh.position.z += 0.01;
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