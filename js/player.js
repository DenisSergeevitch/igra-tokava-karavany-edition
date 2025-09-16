import * as THREE from 'three';
import { createPlayerTexture } from './textures.js';

const PLAYER_EYE_HEIGHT = 1.0;

export class Player {
    constructor() {
        this.faction = null;
        this.health = 100;
        this.gold = 0;
        this.baseSpeed = 5;
        this.speedBonus = 0;
        this.bodyParts = {
            leftArm: true,
            rightArm: true,
            leftLeg: true,
            rightLeg: true,
            leftEye: true,
            rightEye: true
        };
        this.inventory = [];
        this.groundHeightProvider = null;
        this.movementBounds = null;
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
        const effectiveSpeed = this.baseSpeed + this.speedBonus;
        const distance = effectiveSpeed * legFactor * delta;
        this.mesh.position.addScaledVector(dir, distance);
        this.clampToBounds();
        this.updateGroundHeight();
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
        this.updateGroundHeight();
    }

    setGroundHeightProvider(fn) {
        this.groundHeightProvider = fn;
        this.updateGroundHeight();
    }

    setMovementBounds(bounds) {
        this.movementBounds = bounds;
        this.clampToBounds();
    }

    updateGroundHeight() {
        if (typeof this.groundHeightProvider === 'function') {
            const ground = this.groundHeightProvider(this.mesh.position.x, this.mesh.position.z);
            this.mesh.position.y = ground + PLAYER_EYE_HEIGHT;
        } else {
            this.mesh.position.y = PLAYER_EYE_HEIGHT;
        }
    }

    clampToBounds() {
        if (typeof this.movementBounds === 'number' && this.movementBounds > 0) {
            this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -this.movementBounds, this.movementBounds);
            this.mesh.position.z = THREE.MathUtils.clamp(this.mesh.position.z, -this.movementBounds, this.movementBounds);
        }
    }

    snapToGround() {
        this.updateGroundHeight();
    }

    addLoot(loot) {
        if (loot.items && loot.items.length) {
            this.inventory.push(...loot.items);
        }
        if (loot.resources) {
            this.inventory.push(...Object.keys(loot.resources).map(res => `${res} (${loot.resources[res]})`));
        }
    }

    spendGold(amount) {
        if (this.gold < amount) return false;
        this.gold -= amount;
        return true;
    }

    heal(amount) {
        this.health = Math.min(100, this.health + amount);
    }

    applySpeedUpgrade(amount = 0.8) {
        this.speedBonus += amount;
    }

    getMoveSpeed() {
        return this.baseSpeed + this.speedBonus;
    }
}
