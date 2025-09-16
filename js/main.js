import * as THREE from 'three';
import { Player } from './player.js';
import { GameWorld } from './world.js';
import { CaravanManager } from './caravans.js';
import { attackCaravan } from './combat.js';
import { saveGame, loadGame } from './save.js';
import { createSkyTexture } from './textures.js';

let scene, camera, renderer;
let player, world, caravans;
let lastTime = 0;
const keys = {};
const cameraOffset = new THREE.Vector3(0, 5, 10);
const desiredCameraPosition = new THREE.Vector3();
const cameraLookTarget = new THREE.Vector3();

function init() {
    scene = new THREE.Scene();
    scene.background = createSkyTexture();
    scene.fog = new THREE.Fog(0xaecbff, 40, 180);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 6, 14);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.appendChild(renderer.domElement);

    player = new Player();
    scene.add(player.mesh);

    world = new GameWorld(scene, camera);
    caravans = new CaravanManager(scene);

    setupUI();
    updateUI();

    requestAnimationFrame(animate);
}

function setupUI() {
    document.getElementById('choose-faction').addEventListener('click', () => {
        const sel = document.getElementById('faction-select');
        player.setFaction(sel.value);
        updateUI();
    });
    document.getElementById('save-game').addEventListener('click', () => {
        saveGame(player);
        alert('Сохранено');
    });
    document.getElementById('load-game').addEventListener('click', () => {
        if (loadGame(player)) {
            updateUI();
            alert('Загружено');
        }
    });
    document.getElementById('close-loot').addEventListener('click', () => {
        document.getElementById('loot-panel').style.display = 'none';
    });
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', e => {
        const key = e.key === ' ' ? 'space' : e.key.toLowerCase();
        if (!keys[key]) {
            keys[key] = true;
            if (key === 'space') {
                e.preventDefault();
                attemptAttack();
            }
        }
    });
    window.addEventListener('keyup', e => {
        const key = e.key === ' ' ? 'space' : e.key.toLowerCase();
        keys[key] = false;
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateUI() {
    const factionNames = {
        elf: 'Лесные Эльфы',
        guard: 'Охрана Дворца',
        villain: 'Злодей'
    };
    document.getElementById('player-faction').textContent = factionNames[player.faction] || 'Не выбрана';
    document.getElementById('player-health').textContent = Math.round(player.health);
    document.getElementById('player-gold').textContent = player.gold;
}

function handleInput(delta) {
    const dir = new THREE.Vector3();
    if (keys['w'] || keys['arrowup']) dir.z -= 1;
    if (keys['s'] || keys['arrowdown']) dir.z += 1;
    if (keys['a'] || keys['arrowleft']) dir.x -= 1;
    if (keys['d'] || keys['arrowright']) dir.x += 1;
    if (dir.lengthSq() > 0) {
        dir.normalize();
        player.move(dir, delta);
    }
}

function attemptAttack() {
    let target = null;
    caravans.caravans.forEach(c => {
        if (!target && c.mesh.position.distanceTo(player.mesh.position) < 2.2) {
            target = c;
        }
    });
    if (target) {
        attackCaravan(player, caravans, target);
        player.attack();
        updateUI();
    }
}

function updateCamera() {
    desiredCameraPosition.copy(player.mesh.position).add(cameraOffset);
    camera.position.lerp(desiredCameraPosition, 0.08);
    cameraLookTarget.copy(player.mesh.position);
    cameraLookTarget.y += 1.5;
    camera.lookAt(cameraLookTarget);
}

function animate(time) {
    requestAnimationFrame(animate);
    let delta = 0;
    if (lastTime !== 0) {
        delta = Math.min((time - lastTime) / 1000, 0.12);
    }
    lastTime = time;
    handleInput(delta);
    player.update(delta);
    caravans.update(delta);
    world.update(delta);
    updateCamera();
    renderer.render(scene, camera);
}

init();
