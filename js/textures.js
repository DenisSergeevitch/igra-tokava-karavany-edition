import * as THREE from 'three';
import { generatePerlinMap } from './noise.js';

function hexToRgb(hex) {
    const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
    const value = parseInt(normalized, 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function lerpColor(a, b, t) {
    return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t)
    ];
}

function createGradient(colors) {
    const stops = colors.map((color, index) => ({
        value: colors.length === 1 ? 0 : index / (colors.length - 1),
        color: hexToRgb(color)
    }));
    return stops;
}

function sampleGradient(stops, t) {
    if (stops.length === 1) {
        return stops[0].color;
    }
    if (t <= stops[0].value) {
        return stops[0].color;
    }
    for (let i = 0; i < stops.length - 1; i++) {
        const current = stops[i];
        const next = stops[i + 1];
        if (t <= next.value) {
            const localT = (t - current.value) / (next.value - current.value);
            return lerpColor(current.color, next.color, localT);
        }
    }
    return stops[stops.length - 1].color;
}

function createNoiseTexture(width, height, noiseOptions, colors, {
    repeat = 4,
    wrap = THREE.RepeatWrapping,
    contrast = 1,
    brightness = 0
} = {}) {
    const data = generatePerlinMap(width, height, noiseOptions);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(width, height);
    const gradient = createGradient(colors);
    for (let i = 0; i < data.length; i++) {
        let value = data[i];
        if (contrast !== 1) {
            value = Math.pow(value, contrast);
        }
        value = Math.min(1, Math.max(0, value + brightness));
        const color = sampleGradient(gradient, value);
        const offset = i * 4;
        image.data[offset] = color[0];
        image.data[offset + 1] = color[1];
        image.data[offset + 2] = color[2];
        image.data[offset + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 4;
    if (wrap) {
        texture.wrapS = wrap;
        texture.wrapT = wrap;
        if (Array.isArray(repeat)) {
            texture.repeat.set(repeat[0], repeat[1]);
        } else {
            texture.repeat.set(repeat, repeat);
        }
    }
    return texture;
}

export function createGroundTexture(type) {
    switch (type) {
        case 'imperial':
            return createNoiseTexture(256, 256, { scale: 0.015, octaves: 5, seed: 5312 }, ['#a47c3c', '#c5ab6e', '#e3d6a2'], { repeat: 6 });
        case 'forest':
            return createNoiseTexture(256, 256, { scale: 0.02, octaves: 5, seed: 9321 }, ['#1f3c1d', '#305c29', '#4d8b3d'], { repeat: 8 });
        case 'villain':
            return createNoiseTexture(256, 256, { scale: 0.02, octaves: 4, seed: 4123 }, ['#2a2a2e', '#3a3a3f', '#4d4d55'], { repeat: 5 });
        case 'neutral':
        default:
            return createNoiseTexture(256, 256, { scale: 0.018, octaves: 4, seed: 8127 }, ['#4b3a24', '#6a4f2e', '#856847'], { repeat: 7 });
    }
}

export function createBarkTexture() {
    return createNoiseTexture(128, 256, { scale: 0.03, octaves: 5, seed: 2711 }, ['#3a2412', '#5b361c', '#7a4c28'], { repeat: [1, 3], contrast: 1.2 });
}

export function createLeafTexture() {
    return createNoiseTexture(256, 256, { scale: 0.04, octaves: 5, seed: 9821 }, ['#204421', '#2f6a2f', '#55a041'], { repeat: 4, contrast: 0.9 });
}

export function createLeafBillboardTexture() {
    const width = 128;
    const height = 192;
    const noise = generatePerlinMap(width, height, { scale: 0.035, octaves: 4, seed: 6721 });
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(width, height);
    const base = hexToRgb('#234b1f');
    const highlight = hexToRgb('#5fa54a');
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const offset = idx * 4;
            const nx = (x / width) * 2 - 1;
            const ny = (y / height) * 2 - 1.1;
            const distance = Math.sqrt(nx * nx + ny * ny * 1.2);
            let alpha = 1 - Math.max(0, distance - 0.75) * 4;
            alpha = Math.min(1, Math.max(0, alpha));
            const value = noise[idx];
            const color = lerpColor(base, highlight, value);
            image.data[offset] = color[0];
            image.data[offset + 1] = color[1];
            image.data[offset + 2] = color[2];
            image.data[offset + 3] = Math.round(alpha * 255);
        }
    }
    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 2;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

export function createCaravanTexture(type) {
    if (type === 'imperial_supply') {
        return createNoiseTexture(128, 128, { scale: 0.06, octaves: 4, seed: 4523 }, ['#5a5f66', '#7b838c', '#b2bcc7'], { repeat: 2, contrast: 1.1 });
    }
    return createNoiseTexture(128, 128, { scale: 0.05, octaves: 4, seed: 3542 }, ['#5b3821', '#7a4b29', '#9d6a3a'], { repeat: 2, contrast: 1.15 });
}

export function createPlayerTexture(theme = 'neutral') {
    const palette = {
        neutral: ['#1d3c58', '#2f5c7c', '#58a3c6'],
        elf: ['#1f4b30', '#2c7a4a', '#58c47b'],
        guard: ['#2f2f5c', '#42427a', '#6a6ad1'],
        villain: ['#3f1d45', '#5b2f66', '#a64ab5']
    };
    const colors = palette[theme] || palette.neutral;
    const seeds = {
        neutral: 1251,
        elf: 4321,
        guard: 7821,
        villain: 9513
    };
    return createNoiseTexture(128, 128, { scale: 0.05, octaves: 4, seed: seeds[theme] || seeds.neutral }, colors, {
        repeat: 1,
        wrap: null,
        contrast: 0.9
    });
}

export function createSkyTexture() {
    const width = 512;
    const height = 256;
    const noise = generatePerlinMap(width, height, { scale: 0.01, octaves: 3, seed: 2401 });
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(width, height);
    const topColor = hexToRgb('#8ec5ff');
    const bottomColor = hexToRgb('#e7f0ff');
    for (let y = 0; y < height; y++) {
        const vertical = y / height;
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const offset = idx * 4;
            const cloud = Math.pow(noise[idx], 2);
            const base = lerpColor(topColor, bottomColor, vertical);
            const color = lerpColor(base, [255, 255, 255], cloud * 0.5);
            image.data[offset] = color[0];
            image.data[offset + 1] = color[1];
            image.data[offset + 2] = color[2];
            image.data[offset + 3] = 255;
        }
    }
    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
}
