// Simple Perlin noise implementation for procedural texturing.
// The generator is deterministic for a given seed.

function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
    return a + t * (b - a);
}

function grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function buildPermutation(seed) {
    const perm = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
        perm[i] = i;
    }
    const rand = mulberry32(seed || 123456789);
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const tmp = perm[i];
        perm[i] = perm[j];
        perm[j] = tmp;
    }
    const p = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
        p[i] = perm[i & 255];
    }
    return p;
}

export class PerlinNoise {
    constructor(seed = Math.floor(Math.random() * 0xffffffff)) {
        this.permutation = buildPermutation(seed);
    }

    noise2D(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = fade(xf);
        const v = fade(yf);
        const p = this.permutation;

        const aa = p[p[X] + Y];
        const ab = p[p[X] + Y + 1];
        const ba = p[p[X + 1] + Y];
        const bb = p[p[X + 1] + Y + 1];

        const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
        const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);

        return lerp(x1, x2, v);
    }
}

export function generatePerlinMap(width, height, {
    scale = 0.05,
    octaves = 4,
    persistence = 0.5,
    lacunarity = 2,
    seed = Math.floor(Math.random() * 0xffffffff)
} = {}) {
    const noise = new PerlinNoise(seed);
    const data = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let amplitude = 1;
            let frequency = scale;
            let value = 0;
            let totalAmplitude = 0;
            for (let octave = 0; octave < octaves; octave++) {
                const sampleX = x * frequency;
                const sampleY = y * frequency;
                value += amplitude * noise.noise2D(sampleX, sampleY);
                totalAmplitude += amplitude;
                amplitude *= persistence;
                frequency *= lacunarity;
            }
            value = value / totalAmplitude;
            data[y * width + x] = value * 0.5 + 0.5; // Normalize to 0..1
        }
    }
    return data;
}
