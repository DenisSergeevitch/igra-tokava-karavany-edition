import * as THREE from 'three';
import { createPlayerTexture } from './textures.js';

const PLAYER_EYE_HEIGHT = 1.0;

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
        this.speed = 5; // units per second
        this.isAttacking = false;
        this.attackTimer = 0;
        this.textureCache = {};
        this.mesh = this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.CapsuleGeometry(0.5, 1.0, 8, 16);
        const material = new THREE.MeshStandardMaterial({
            map: this.getTexture('neutral'),
            roughness: 0.6,
            metalness: 0.15
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.y = PLAYER_EYE_HEIGHT;
        return mesh;
    }

    getTexture(theme) {
        const key = theme || 'neutral';
        if (!this.textureCache[key]) {
            this.textureCache[key] = createPlayerTexture(key);
        }
        return this.textureCache[key];
    }

    setFaction(faction) {
        this.faction = faction;
        this.updateAppearance();
    }

    updateAppearance() {
        const texture = this.getTexture(this.faction || 'neutral');
        this.mesh.material.map = texture;
        this.mesh.material.needsUpdate = true;
    }

    move(dir, delta = 1 / 60) {
        const legFactor = this.bodyParts.leftLeg && this.bodyParts.rightLeg ? 1 : 0.5;
        const distance = this.speed * legFactor * delta;
        this.mesh.position.addScaledVector(dir, distance);
        this.mesh.position.y = PLAYER_EYE_HEIGHT;
        if (dir.lengthSq() > 0) {
            const angle = Math.atan2(dir.x, dir.z);
            this.mesh.rotation.y = angle;
        }
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
            this.mesh.rotation.z = Math.sin((this.attackTimer / 0.35) * Math.PI) * 0.35;
            if (this.attackTimer >= 0.35) {
                this.mesh.rotation.z = 0;
                this.isAttacking = false;
            }
        }
    }
}
