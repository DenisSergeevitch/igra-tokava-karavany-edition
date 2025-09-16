import * as THREE from 'three';
import { Player } from './player.js';
import { GameWorld } from './world.js';
import { CaravanManager } from './caravans.js';
import { attackCaravan } from './combat.js';
import { saveGame, loadGame } from './save.js';
import { createSkyTexture } from './textures.js';
import { NPCManager } from './npc.js';

let scene, camera, renderer;
let player, world, caravans, npcManager;
let lastTime = 0;
const keys = {};

const cameraSpherical = new THREE.Spherical(14, 1.05, Math.PI * 1.05);
const cameraOffset = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();
const cameraLookTarget = new THREE.Vector3();
const cameraTargetOffset = new THREE.Vector3(0, 1.5, 0);
const cameraForward = new THREE.Vector3();
const cameraRight = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);

let pointerLocked = false;
let currentInteractable = null;

const lootPanel = document.getElementById('loot-panel');
const tradePanel = document.getElementById('trade-panel');
const tradeTitle = document.getElementById('trade-title');
const tradeStatusLabel = document.getElementById('trade-status');
const interactionHint = document.getElementById('interaction-hint');

function init() {
    scene = new THREE.Scene();
    scene.background = createSkyTexture();
    scene.fog = new THREE.Fog(0xaecbff, 120, 850);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 9, 18);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.appendChild(renderer.domElement);

    world = new GameWorld(scene, camera);

    player = new Player();
    player.mesh.position.set(0, 0, 0);
    player.setGroundHeightProvider((x, z) => world.getHeightAt(x, z));
    player.setMovementBounds(world.getMovementBounds());
    player.snapToGround();
    scene.add(player.mesh);

    caravans = new CaravanManager(scene, world);
    npcManager = new NPCManager(scene, world);

    setupPointerLock();
    setupUI();
    updateUI();

    requestAnimationFrame(animate);
}

function setupPointerLock() {
    renderer.domElement.addEventListener('click', () => {
        if (isAnyPanelOpen()) return;
        renderer.domElement.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
        pointerLocked = document.pointerLockElement === renderer.domElement;
        renderer.domElement.style.cursor = pointerLocked ? 'none' : 'default';
    });
    document.addEventListener('mousemove', event => {
        if (!pointerLocked) return;
        cameraSpherical.theta -= event.movementX * 0.0022;
        cameraSpherical.phi -= event.movementY * 0.0016;
        cameraSpherical.phi = THREE.MathUtils.clamp(cameraSpherical.phi, 0.3, 1.4);
    });
    renderer.domElement.addEventListener('wheel', event => {
        cameraSpherical.radius = THREE.MathUtils.clamp(cameraSpherical.radius + event.deltaY * 0.01, 6, 28);
        event.preventDefault();
    }, { passive: false });
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
            player.snapToGround();
            updateUI();
            alert('Загружено');
        }
    });
    document.getElementById('close-loot').addEventListener('click', () => {
        lootPanel.style.display = 'none';
    });
    document.getElementById('close-trade').addEventListener('click', () => {
        tradePanel.style.display = 'none';
        tradeStatusLabel.textContent = '';
    });
    document.getElementById('buy-heal').addEventListener('click', () => {
        if (player.spendGold(30)) {
            player.heal(35);
            tradeStatusLabel.textContent = 'Торговец перевязал ваши раны.';
            updateUI();
        } else {
            tradeStatusLabel.textContent = 'Нужно больше золота.';
        }
    });
    document.getElementById('buy-speed').addEventListener('click', () => {
        if (player.spendGold(80)) {
            player.applySpeedUpgrade(1.2);
            tradeStatusLabel.textContent = 'Лошади готовы. Скорость передвижения выросла!';
            updateUI();
        } else {
            tradeStatusLabel.textContent = 'Соберите ещё монеты.';
        }
    });
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', e => {
        const key = e.key === ' ' ? 'space' : e.key.toLowerCase();
        if (!keys[key]) {
            keys[key] = true;
            if (key === 'space') {
                if (!isAnyPanelOpen()) {
                    e.preventDefault();
                    attemptAttack();
                }
            } else if (key === 'e') {
                e.preventDefault();
                attemptInteraction();
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
    if (!player) return;
    const factionNames = {
        elf: 'Лесные Эльфы',
        guard: 'Охрана Дворца',
        villain: 'Злодей'
    };
    document.getElementById('player-faction').textContent = factionNames[player.faction] || 'Не выбрана';
    document.getElementById('player-health').textContent = Math.round(player.health);
    document.getElementById('player-gold').textContent = player.gold;
    document.getElementById('player-speed').textContent = player.getMoveSpeed().toFixed(1);
}

function isPanelVisible(element) {
    if (!element) return false;
    return getComputedStyle(element).display !== 'none';
}

function isAnyPanelOpen() {
    return isPanelVisible(lootPanel) || isPanelVisible(tradePanel);
}

function handleInput(delta) {
    if (!player || isAnyPanelOpen()) return;
    const horizontal = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
    const vertical = (keys['w'] || keys['arrowup'] ? 1 : 0) - (keys['s'] || keys['arrowdown'] ? 1 : 0);
    if (horizontal === 0 && vertical === 0) return;

    cameraForward.subVectors(player.mesh.position, camera.position);
    cameraForward.y = 0;
    if (cameraForward.lengthSq() < 0.0001) {
        cameraForward.set(0, 0, -1);
    } else {
        cameraForward.normalize();
    }
    cameraRight.crossVectors(cameraForward, worldUp).normalize();

    const input = new THREE.Vector2(horizontal, vertical);
    if (input.lengthSq() > 1) {
        input.normalize();
    }
    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(cameraForward, input.y);
    moveDir.addScaledVector(cameraRight, input.x);
    if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        player.move(moveDir, delta);
    }
}

function attemptAttack() {
    if (!caravans) return;
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

function attemptInteraction() {
    if (!currentInteractable || isAnyPanelOpen()) return;
    if (currentInteractable.interaction === 'trade') {
        openTradePanel(currentInteractable);
    }
}

function openTradePanel(npc) {
    if (document.pointerLockElement === renderer.domElement) {
        document.exitPointerLock();
    }
    tradeTitle.textContent = npc.displayName;
    tradeStatusLabel.textContent = 'Есть товары и слухи из дальних земель.';
    tradePanel.style.display = 'block';
}

function updateInteractionTargets() {
    if (!npcManager || !player) return;
    if (isAnyPanelOpen()) {
        hideInteractionHint();
        npcManager.setHighlightedNPC(null);
        return;
    }
    const interactable = npcManager.getNearestInteractable(player.mesh.position, 4.5);
    if (interactable) {
        currentInteractable = interactable.npc;
        npcManager.setHighlightedNPC(interactable.npc);
        showInteractionHint(`E — поговорить с ${interactable.npc.displayName}`);
    } else {
        currentInteractable = null;
        npcManager.setHighlightedNPC(null);
        hideInteractionHint();
    }
}

function showInteractionHint(text) {
    if (!interactionHint) return;
    if (interactionHint.textContent !== text) {
        interactionHint.textContent = text;
    }
    if (interactionHint.style.display !== 'block') {
        interactionHint.style.display = 'block';
    }
}

function hideInteractionHint() {
    if (!interactionHint) return;
    if (interactionHint.style.display !== 'none') {
        interactionHint.style.display = 'none';
    }
}

function updateCamera() {
    if (!player) return;
    cameraOffset.setFromSpherical(cameraSpherical);
    desiredCameraPosition.copy(player.mesh.position).add(cameraOffset);
    camera.position.lerp(desiredCameraPosition, 0.12);
    cameraLookTarget.copy(player.mesh.position).add(cameraTargetOffset);
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
    if (player) {
        player.update(delta);
    }
    if (caravans) {
        caravans.update(delta);
    }
    if (world) {
        world.update(delta);
    }
    if (npcManager) {
        npcManager.update(delta);
    }
    updateInteractionTargets();
    updateCamera();
    renderer.render(scene, camera);
}

init();
