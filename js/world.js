import * as THREE from 'three';
import {
    createGroundTexture,
    createBarkTexture,
    createLeafTexture,
    createLeafBillboardTexture
} from './textures.js';
import { generatePerlinMap } from './noise.js';

export class GameWorld {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.trees = [];
        this.terrainSize = 1600;
        this.terrainSegments = 256;
        this.heightScale = 46;
        this.halfSize = this.terrainSize / 2;
        this.heightField = new Float32Array((this.terrainSegments + 1) * (this.terrainSegments + 1));
        this.treeTextures = {
            bark: createBarkTexture(),
            leaves: createLeafTexture(),
            billboard: createLeafBillboardTexture()
        };
        this.treeMaterials = {
            trunk: new THREE.MeshStandardMaterial({ map: this.treeTextures.bark, roughness: 0.9, metalness: 0.0 }),
            foliage: new THREE.MeshStandardMaterial({ map: this.treeTextures.leaves, roughness: 0.65, metalness: 0.05 })
        };
        this.treeSpriteMaterial = new THREE.SpriteMaterial({
            map: this.treeTextures.billboard,
            transparent: true,
            depthWrite: false
        });
        this.setup();
    }

    setup() {
        const hemiLight = new THREE.HemisphereLight(0xbfd8ff, 0x3d2a18, 0.65);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
        dirLight.position.set(220, 320, 180);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.set(2048, 2048);
        dirLight.shadow.camera.left = -400;
        dirLight.shadow.camera.right = 400;
        dirLight.shadow.camera.top = 360;
        dirLight.shadow.camera.bottom = -280;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 1200;
        this.scene.add(dirLight);

        this.createTerrain();
        this.populateTrees();
        this.createLandmarks();
    }

    createTerrain() {
        const geometry = new THREE.PlaneGeometry(this.terrainSize, this.terrainSize, this.terrainSegments, this.terrainSegments);
        const positions = geometry.attributes.position;
        const vertexCount = positions.count;
        const sampleSize = this.terrainSegments + 1;

        const noise = generatePerlinMap(sampleSize, sampleSize, {
            scale: 0.003,
            octaves: 5,
            persistence: 0.52,
            lacunarity: 2.1,
            seed: 5123
        });

        for (let i = 0; i < vertexCount; i++) {
            const ix = i % sampleSize;
            const iz = Math.floor(i / sampleSize);
            const x = (ix / this.terrainSegments) * this.terrainSize - this.halfSize;
            const z = (iz / this.terrainSegments) * this.terrainSize - this.halfSize;
            const distance = Math.sqrt(x * x + z * z);
            const normalizedDistance = Math.min(1, distance / (this.terrainSize * 0.52));
            const falloff = Math.pow(Math.max(0, 1 - normalizedDistance), 3.2);
            const plateau = Math.pow(Math.max(0, 1 - distance / (this.terrainSize * 0.18)), 3.5) * 11;
            const noiseValue = noise[iz * sampleSize + ix];
            const shapedNoise = (noiseValue - 0.5) * this.heightScale;
            const height = THREE.MathUtils.clamp(shapedNoise * (0.35 + falloff * 0.7) + plateau - normalizedDistance * 12, -18, 38);

            positions.setXYZ(i, x, height, z);
            this.heightField[iz * sampleSize + ix] = height;
        }

        geometry.computeVertexNormals();
        positions.needsUpdate = true;

        const texture = createGroundTexture('neutral');
        texture.repeat.set(24, 24);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.92,
            metalness: 0.04
        });

        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);
    }

    populateTrees() {
        const desiredCount = 260;
        const maxAttempts = desiredCount * 8;
        let attempts = 0;
        while (this.trees.length < desiredCount && attempts < maxAttempts) {
            attempts++;
            const x = (Math.random() * 2 - 1) * this.halfSize;
            const z = (Math.random() * 2 - 1) * this.halfSize;
            if (Math.abs(x) < 60 && Math.abs(z) < 80) continue;
            const height = this.getHeightAt(x, z);
            if (height > 28 || height < -8) continue;
            const slope = Math.abs(height - this.getHeightAt(x + 6, z)) + Math.abs(height - this.getHeightAt(x, z + 6));
            if (slope > 9) continue;

            const position = new THREE.Vector3(x, height, z);
            this.addTree(position);
        }
    }

    createLandmarks() {
        const material = new THREE.MeshStandardMaterial({ color: 0x6b4523, roughness: 0.8 });
        const geometry = new THREE.CylinderGeometry(1.6, 1.6, 4.2, 12);
        const bannerMaterial = new THREE.MeshStandardMaterial({ color: 0xd6b25e, roughness: 0.5, metalness: 0.2 });

        const campPositions = [
            { pos: new THREE.Vector3(-240, 0, 200), color: 0x2f7a42 },
            { pos: new THREE.Vector3(210, 0, 110), color: 0x3c4b8e },
            { pos: new THREE.Vector3(290, 0, -240), color: 0x5b1e5e }
        ];

        campPositions.forEach(camp => {
            const h = this.getHeightAt(camp.pos.x, camp.pos.z);
            const totem = new THREE.Mesh(geometry, material.clone());
            totem.position.set(camp.pos.x, h + 2.1, camp.pos.z);
            totem.castShadow = true;
            this.scene.add(totem);

            const banner = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 1.8), bannerMaterial.clone());
            banner.material.color.setHex(camp.color);
            banner.position.set(camp.pos.x, h + 3.2, camp.pos.z + 0.9);
            banner.castShadow = true;
            this.scene.add(banner);
        });
    }

    addTree(position) {
        const lod = new THREE.LOD();
        const treeMesh = this.createTreeMesh();
        const sprite = this.createTreeSprite();
        lod.addLevel(treeMesh, 0);
        lod.addLevel(sprite, 360);
        lod.position.copy(position);
        this.scene.add(lod);
        this.trees.push({
            lod,
            highDetail: treeMesh,
            swayOffset: Math.random() * Math.PI * 2,
            swaySpeed: 0.5 + Math.random() * 0.4,
            time: Math.random() * Math.PI * 2
        });
    }

    createTreeMesh() {
        const trunkHeight = Math.random() * 2 + 3;
        const trunkRadiusTop = Math.random() * 0.15 + 0.2;
        const trunkRadiusBottom = trunkRadiusTop + 0.15;
        const foliageRadius = Math.random() * 1 + 1.6;
        const scale = 0.8 + Math.random() * 0.6;

        const trunkGeometry = new THREE.CylinderGeometry(trunkRadiusTop, trunkRadiusBottom, trunkHeight, 8, 1);
        const trunk = new THREE.Mesh(trunkGeometry, this.treeMaterials.trunk);
        trunk.position.y = (trunkHeight * scale) / 2;
        trunk.castShadow = true;

        const foliageGeometry = new THREE.SphereGeometry(foliageRadius, 12, 10);
        const foliage = new THREE.Mesh(foliageGeometry, this.treeMaterials.foliage);
        foliage.position.y = trunkHeight * scale;
        foliage.castShadow = true;

        const group = new THREE.Group();
        group.add(trunk);
        group.add(foliage);
        group.scale.setScalar(scale);
        group.rotation.y = Math.random() * Math.PI * 2;
        group.userData = { foliage };
        return group;
    }

    createTreeSprite() {
        const spriteMaterial = this.treeSpriteMaterial.clone();
        spriteMaterial.rotation = (Math.random() - 0.5) * 0.1;
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(5.5, 7.4, 1);
        sprite.position.set(0, 3.6, 0);
        return sprite;
    }

    update(delta = 0) {
        this.trees.forEach(tree => {
            tree.lod.update(this.camera);
            tree.time += delta * tree.swaySpeed;
            const sway = Math.sin(tree.time + tree.swayOffset) * 0.08;
            const foliage = tree.highDetail.userData?.foliage;
            if (foliage) {
                foliage.rotation.z = sway;
                foliage.position.x = Math.sin(tree.time * 0.8 + tree.swayOffset) * 0.1;
            }
        });
    }

    getHeightAt(x, z) {
        const clampedX = THREE.MathUtils.clamp(x, -this.halfSize, this.halfSize);
        const clampedZ = THREE.MathUtils.clamp(z, -this.halfSize, this.halfSize);
        const normalizedX = (clampedX + this.halfSize) / this.terrainSize;
        const normalizedZ = (clampedZ + this.halfSize) / this.terrainSize;

        const gridX = normalizedX * this.terrainSegments;
        const gridZ = normalizedZ * this.terrainSegments;
        const x0 = Math.floor(gridX);
        const z0 = Math.floor(gridZ);
        const x1 = Math.min(x0 + 1, this.terrainSegments);
        const z1 = Math.min(z0 + 1, this.terrainSegments);
        const sx = gridX - x0;
        const sz = gridZ - z0;
        const size = this.terrainSegments + 1;

        const h00 = this.heightField[z0 * size + x0];
        const h10 = this.heightField[z0 * size + x1];
        const h01 = this.heightField[z1 * size + x0];
        const h11 = this.heightField[z1 * size + x1];

        const hx0 = THREE.MathUtils.lerp(h00, h10, sx);
        const hx1 = THREE.MathUtils.lerp(h01, h11, sx);
        return THREE.MathUtils.lerp(hx0, hx1, sz);
    }

    getMovementBounds() {
        return this.halfSize - 24;
    }
}
