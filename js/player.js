import * as THREE from 'three';

export class Player {
    constructor() {
        this.faction = null;
        this.health = 100;
        this.gold = 0;
        this.bodyParts = {
            leftArm: true,
            rightArm: true,
            leftLeg: true,
            rightLeg: true,
            leftEye: true,
            rightEye: true
        };
        this.speed = 0.1;
        this.mesh = this.createMesh();
        this.isAttacking = false;
        this.attackTimer = 0;
    }

    createMesh() {
        const geometry = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x0077ff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.position.y = 1.0;
        return mesh;
    }

    move(dir) {
        const moveSpeed = this.speed * (this.bodyParts.leftLeg && this.bodyParts.rightLeg ? 1 : 0.5);
        this.mesh.position.add(dir.multiplyScalar(moveSpeed));
    }

    attack() {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.attackTimer = 0;
        }
    }

    update(delta) {
        if (this.isAttacking) {
            this.attackTimer += delta;
            const progress = this.attackTimer / 0.3;
            this.mesh.rotation.y = Math.sin(progress * Math.PI) * 0.8;
            if (this.attackTimer >= 0.3) {
                this.mesh.rotation.y = 0;
                this.isAttacking = false;
            }
        }
    }
}