import * as THREE from 'three';

export class GameWorld {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.trees = [];
        this.setup();
    }

    setup() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        const zones = [
            { color: 0x888888, x: 0 },
            { color: 0xffe4b5, x: 50 },
            { color: 0x228b22, x: -50 },
            { color: 0x555555, x: 100 }
        ];
        zones.forEach((z, i) => {
            const g = new THREE.PlaneGeometry(50, 50);
            const m = new THREE.MeshLambertMaterial({ color: z.color });
            const plane = new THREE.Mesh(g, m);
            plane.rotation.x = -Math.PI / 2;
            plane.position.x = z.x;
            plane.receiveShadow = true;
            this.scene.add(plane);
        });

        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            this.addTree(new THREE.Vector3(x, 0, z));
        }
    }

    addTree(pos) {
        const spriteTexture = new THREE.TextureLoader().load('https://dummyimage.com/128x128/228B22/006400.png&text=Tree');
        const spriteMaterial = new THREE.SpriteMaterial({ map: spriteTexture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(0, 2, 0);

        const tree3d = this.createTreeMesh();

        const lod = new THREE.LOD();
        lod.addLevel(tree3d, 0);
        lod.addLevel(sprite, 20);
        lod.position.copy(pos);
        this.scene.add(lod);
        this.trees.push(lod);
    }

    createTreeMesh() {
        const trunkHeight = Math.random() * 2 + 3;
        const trunkRadius = Math.random() * 0.2 + 0.3;
        const foliageRadius = Math.random() * 1 + 1.5;
        const barkTextureUrl = 'https://dummyimage.com/64x128/8B4513/5C3317.png&text=Bark';
        const leavesTextureUrl = 'https://dummyimage.com/128x128/228B22/006400.png&text=Leaves';
        const barkTexture = new THREE.TextureLoader().load(barkTextureUrl);
        const leavesTexture = new THREE.TextureLoader().load(leavesTextureUrl);
        const trunkMaterial = new THREE.MeshLambertMaterial({ map: barkTexture });
        const foliageMaterial = new THREE.MeshLambertMaterial({ map: leavesTexture });
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        const foliageGeometry = new THREE.SphereGeometry(foliageRadius, 8, 6);
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = trunkHeight + foliageRadius * 0.6;
        foliage.castShadow = true;
        const group = new THREE.Group();
        group.add(trunk);
        group.add(foliage);
        return group;
    }

    update() {
        this.trees.forEach(t => t.update(this.camera));
    }
}
