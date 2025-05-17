import * as THREE from 'three';
import { Player } from './player.js';
import { GameWorld } from './world.js';
import { CaravanManager } from './caravans.js';
import { attackCaravan } from './combat.js';
import { saveGame, loadGame } from './save.js';

let scene, camera, renderer;
let player, world, caravans;
let lastTime = 0;
const keys = {};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    player = new Player();
    scene.add(player.mesh);

    world = new GameWorld(scene, camera);
    caravans = new CaravanManager(scene);

    setupUI();
    // start animation loop with an initial timestamp
    animate(0);
}

function setupUI() {
    document.getElementById('choose-faction').addEventListener('click', () => {
        const sel = document.getElementById('faction-select');
        player.faction = sel.value;
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
    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
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
    document.getElementById('player-health').textContent = player.health;
    document.getElementById('player-gold').textContent = player.gold;
}

function handleInput() {
    const dir = new THREE.Vector3();
    if (keys['w']) dir.z -= 1;
    if (keys['s']) dir.z += 1;
    if (keys['a']) dir.x -= 1;
    if (keys['d']) dir.x += 1;
    if (dir.lengthSq() > 0) {
        dir.normalize();
        player.move(dir);
        camera.position.x = player.mesh.position.x;
        camera.position.z = player.mesh.position.z + 10;
        camera.lookAt(player.mesh.position);
    }
    if (keys[' ']) attemptAttack();
}

function attemptAttack() {
    let target = null;
    caravans.caravans.forEach(c => {
        if (c.mesh.position.distanceTo(player.mesh.position) < 2) target = c;
    });
    if (target) {
        attackCaravan(player, caravans, target);
        player.attack();
        updateUI();
    }
}

function animate(time) {
    requestAnimationFrame(animate);
    const delta = (time - lastTime) / 1000;
    lastTime = time;
    handleInput();
    player.update(delta);
    caravans.update(delta);
    world.update();
    renderer.render(scene, camera);
}

init();