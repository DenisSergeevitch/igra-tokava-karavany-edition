import * as THREE from 'three';
import {
    createGroundTexture,
    createBarkTexture,
    createLeafTexture,
    createLeafBillboardTexture
} from './textures.js';

export class GameWorld {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.trees = [];
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
        const hemiLight = new THREE.HemisphereLight(0xbfd8ff, 0x3d2a18, 0.6);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(30, 60, 40);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.set(2048, 2048);
        dirLight.shadow.camera.left = -120;
        dirLight.shadow.camera.right = 120;
        dirLight.shadow.camera.top = 120;
        dirLight.shadow.camera.bottom = -120;
        dirLight.shadow.camera.far = 200;
        this.scene.add(dirLight);

        const zones = [
            { type: 'neutral', x: 0 },
            { type: 'imperial', x: 50 },
            { type: 'forest', x: -50 },
            { type: 'villain', x: 100 }
        ];
        zones.forEach(zone => {
            const texture = createGroundTexture(zone.type);
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.95,
                metalness: 0.0
            });
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), material);
            plane.rotation.x = -Math.PI / 2;
            plane.position.x = zone.x;
            plane.receiveShadow = true;
            this.scene.add(plane);
        });

        for (let i = 0; i < 28; i++) {
            const x = (Math.random() - 0.5) * 140;
            const z = (Math.random() - 0.5) * 140;
            this.addTree(new THREE.Vector3(x, 0, z));
        }
    }

    addTree(position) {
        const lod = new THREE.LOD();
        const treeMesh = this.createTreeMesh();
        const sprite = this.createTreeSprite();
        lod.addLevel(treeMesh, 0);
        lod.addLevel(sprite, 28);
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
        sprite.scale.set(4.5, 6.5, 1);
        sprite.position.set(0, 3.2, 0);
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
}
