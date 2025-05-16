export function attackCaravan(player, caravanMgr, caravan) {
    const loot = getCaravanLoot(caravan.type);
    player.gold += loot.gold;
    caravanMgr.removeCaravan(caravan);
    if (Math.random() < 0.3) {
        const eyes = ['leftEye', 'rightEye'];
        const eye = eyes[Math.floor(Math.random() * eyes.length)];
        if (player.bodyParts[eye]) {
            player.bodyParts[eye] = false;
            const patchId = eye === 'leftEye' ? 'eye-patch-left' : 'eye-patch-right';
            document.getElementById(patchId).style.display = 'block';
        }
    }
}

function getCaravanLoot(type) {
    let loot = { gold: 0 };
    if (type === 'merchant') {
        loot.gold = Math.floor(Math.random() * 100) + 50;
    } else if (type === 'imperial_supply') {
        loot.gold = Math.floor(Math.random() * 50) + 20;
    }
    return loot;
}
