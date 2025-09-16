export function attackCaravan(player, caravanMgr, caravan) {
    const loot = getCaravanLoot(caravan.type);
    player.gold += loot.gold;
    if (typeof player.addLoot === 'function') {
        player.addLoot(loot);
    }
    caravanMgr.removeCaravan(caravan);
    showLootPanel(loot);
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

function showLootPanel(loot) {
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
    const panel = document.getElementById('loot-panel');
    const itemsDiv = document.getElementById('loot-items');
    let html = `<p><strong>Золото:</strong> ${loot.gold}</p>`;
    if (loot.items && loot.items.length) {
        html += `<p><strong>Трофеи:</strong> ${loot.items.join(', ')}</p>`;
    }
    if (loot.resources && Object.keys(loot.resources).length > 0) {
        const resList = Object.entries(loot.resources)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        html += `<p><strong>Ресурсы:</strong> ${resList}</p>`;
    }
    if (loot.story) {
        html += `<p>${loot.story}</p>`;
    }
    html += '<p>Золото можно обменять у караванного торговца (нажмите E рядом с ним).</p>';
    itemsDiv.innerHTML = html;
    panel.style.display = 'block';
}

function getCaravanLoot(type) {
    const loot = {
        gold: 0,
        items: [],
        resources: {},
        story: ''
    };

    if (type === 'merchant') {
        loot.gold = Math.floor(Math.random() * 120) + 70;
        if (Math.random() < 0.6) loot.items.push('Тюки специй');
        if (Math.random() < 0.45) loot.items.push('Шелковые ткани');
        loot.story = 'Торговцы жаловались, что не успели спрятать книги учета.';
    } else if (type === 'imperial_supply') {
        loot.gold = Math.floor(Math.random() * 70) + 40;
        loot.resources['Металл'] = Math.floor(Math.random() * 5) + 3;
        if (Math.random() < 0.4) {
            loot.items.push('Имперские пайки');
        }
        if (Math.random() < 0.25) {
            loot.items.push('Карта патрулей');
            loot.story = 'Найдена карта с пометками маршрутов стражи.';
        } else {
            loot.story = 'Повозка скрипела от веса оружия и пайков.';
        }
    }

    if (loot.items.length === 0) {
        loot.items.push('Нечто любопытное');
    }
    return loot;
}
