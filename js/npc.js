import * as THREE from 'three';
import { createPlayerTexture } from './textures.js';

const NPC_BASE_HEIGHT = 1.0;

export class NPCManager {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.npcs = [];
        this.highlightedNPC = null;

        this.textures = {
            elf: createPlayerTexture('elf'),
            guard: createPlayerTexture('guard'),
            villain: createPlayerTexture('villain'),
            merchant: createPlayerTexture('neutral')
        };

        this.baseMaterials = {
            elf: new THREE.MeshStandardMaterial({ map: this.textures.elf, roughness: 0.6, metalness: 0.1, emissive: new THREE.Color(0x0a160a) }),
            guard: new THREE.MeshStandardMaterial({ map: this.textures.guard, roughness: 0.55, metalness: 0.18, emissive: new THREE.Color(0x080818) }),
            villain: new THREE.MeshStandardMaterial({ map: this.textures.villain, roughness: 0.58, metalness: 0.16, emissive: new THREE.Color(0x160812) }),
            merchant: new THREE.MeshStandardMaterial({ map: this.textures.merchant, roughness: 0.62, metalness: 0.08, emissive: new THREE.Color(0x120805) })
        };

        this.spawnInitialNPCs();
    }

    spawnInitialNPCs() {
        // Neutral merchant near the central road
        this.spawnNPC({
            type: 'merchant',
            name: 'Караванный торговец',
            position: new THREE.Vector3(28, 0, -24),
            roamRadius: 18,
            speed: 1.6,
            interaction: 'trade'
        });

        // Elf scouts in the forest
        this.spawnFactionGroup('elf', new THREE.Vector3(-260, 0, 210), 4, 60, [
            'Следопыт Тир',
            'Лучница Элин',
            'Друид Варен',
            'Следопыт Лиара'
        ], { speed: 2.6 });

        // Palace guards on imperial lands
        this.spawnFactionGroup('guard', new THREE.Vector3(220, 0, 130), 4, 55, [
            'Сержант Маркус',
            'Страж Ирия',
            'Капрал Дариус',
            'Страж Арман'
        ], { speed: 2.4 });

        // Villain warband in the mountains
        this.spawnFactionGroup('villain', new THREE.Vector3(310, 0, -260), 3, 45, [
            'Колдунья Вера',
            'Воевода Мор',
            'Громила Затх'
        ], { speed: 2.5 });
    }

    spawnFactionGroup(type, center, count, radius, names = [], options = {}) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.6;
            const position = new THREE.Vector3(
                center.x + Math.cos(angle) * distance,
                0,
                center.z + Math.sin(angle) * distance
            );
            this.spawnNPC({
                type,
                name: names[i % names.length] || `${type}_npc_${i}`,
                position,
                roamRadius: radius,
                speed: options.speed || 2.2
            });
        }
    }

    spawnNPC({ type, name, position, roamRadius = 30, speed = 2.2, interaction = null }) {
        const mesh = this.createNPCMesh(type);
        const ground = this.world.getHeightAt(position.x, position.z);
        mesh.position.set(position.x, ground + NPC_BASE_HEIGHT, position.z);
        this.scene.add(mesh);

        const npc = {
            mesh,
            type,
            displayName: name,
            roamCenter: new THREE.Vector3(position.x, 0, position.z),
            roamRadius,
            speed,
            interaction,
            target: null,
            thinkTimer: 0,
            bobTime: Math.random() * Math.PI * 2,
            baseEmissive: mesh.material.emissive.clone()
        };

        this.npcs.push(npc);
        return npc;
    }

    createNPCMesh(type) {
        const geometry = new THREE.CapsuleGeometry(0.45, 0.9, 6, 12);
        const baseMaterial = this.baseMaterials[type] || this.baseMaterials.merchant;
        const material = baseMaterial.clone();
        material.emissiveIntensity = 0.65;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.y = NPC_BASE_HEIGHT;

        // Simple shoulder pad to differentiate factions visually
        const shoulderGeometry = new THREE.SphereGeometry(0.25, 12, 12);
        const shoulderMaterial = new THREE.MeshStandardMaterial({
            color: type === 'villain' ? 0x5b1e5e : type === 'guard' ? 0x41496a : type === 'elf' ? 0x2f7a42 : 0x8b5524,
            roughness: 0.5,
            metalness: 0.3,
            emissive: new THREE.Color(0x050505)
        });
        const shoulders = new THREE.Group();
        const left = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        const right = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        left.position.set(-0.5, 1.1, 0);
        right.position.set(0.5, 1.1, 0);
        shoulders.add(left);
        shoulders.add(right);
        mesh.add(shoulders);
        return mesh;
    }

    chooseNewTarget(npc) {
        const attempts = 6;
        for (let i = 0; i < attempts; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * npc.roamRadius;
            const x = npc.roamCenter.x + Math.cos(angle) * distance;
            const z = npc.roamCenter.z + Math.sin(angle) * distance;
            const height = this.world.getHeightAt(x, z);

            const slope = Math.abs(height - this.world.getHeightAt(x + 4, z)) + Math.abs(height - this.world.getHeightAt(x, z + 4));
            if (slope > 10) continue;

            return new THREE.Vector3(x, height + NPC_BASE_HEIGHT, z);
        }
        const centerHeight = this.world.getHeightAt(npc.roamCenter.x, npc.roamCenter.z);
        return new THREE.Vector3(npc.roamCenter.x, centerHeight + NPC_BASE_HEIGHT, npc.roamCenter.z);
    }

    update(delta) {
        const moveDir = new THREE.Vector3();
        this.npcs.forEach(npc => {
            npc.thinkTimer -= delta;
            if (npc.thinkTimer <= 0 || !npc.target) {
                npc.target = this.chooseNewTarget(npc);
                npc.thinkTimer = 4 + Math.random() * 6;
            }

            moveDir.copy(npc.target).sub(npc.mesh.position);
            const distanceSq = moveDir.x * moveDir.x + moveDir.z * moveDir.z;
            if (distanceSq > 0.2) {
                moveDir.y = 0;
                moveDir.normalize();
                npc.mesh.position.addScaledVector(moveDir, npc.speed * delta);
                npc.mesh.rotation.y = Math.atan2(moveDir.x, moveDir.z);
            }

            npc.bobTime += delta * 2.2;
            const ground = this.world.getHeightAt(npc.mesh.position.x, npc.mesh.position.z);
            npc.mesh.position.y = ground + NPC_BASE_HEIGHT + Math.sin(npc.bobTime + npc.displayName.length) * 0.05;
        });
    }

    getNearestInteractable(position, maxDistance = 4) {
        let nearest = null;
        let minDistSq = maxDistance * maxDistance;
        for (const npc of this.npcs) {
            if (!npc.interaction) continue;
            const distSq = npc.mesh.position.distanceToSquared(position);
            if (distSq < minDistSq) {
                nearest = npc;
                minDistSq = distSq;
            }
        }
        if (!nearest) return null;
        return { npc: nearest, distance: Math.sqrt(minDistSq) };
    }

    setHighlightedNPC(npc) {
        if (this.highlightedNPC === npc) return;
        if (this.highlightedNPC) {
            this.highlightedNPC.mesh.material.emissive.copy(this.highlightedNPC.baseEmissive);
        }
        this.highlightedNPC = npc || null;
        if (npc) {
            npc.mesh.material.emissive.copy(npc.baseEmissive).lerp(new THREE.Color(0xffff99), 0.45);
        }
    }
}

