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
}