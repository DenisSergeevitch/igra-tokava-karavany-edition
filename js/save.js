export function saveGame(player) {
    const data = {
        faction: player.faction,
        health: player.health,
        gold: player.gold,
        bodyParts: player.bodyParts,
        position: player.mesh.position.toArray()
    };
    localStorage.setItem('caravanSagaSave', JSON.stringify(data));
}

export function loadGame(player) {
    const raw = localStorage.getItem('caravanSagaSave');
    if (!raw) return false;
    const data = JSON.parse(raw);
    player.faction = data.faction;
    player.health = data.health;
    player.gold = data.gold;
    player.bodyParts = data.bodyParts;
    player.mesh.position.fromArray(data.position);
    if (!player.bodyParts.leftEye) document.getElementById('eye-patch-left').style.display = 'block';
    if (!player.bodyParts.rightEye) document.getElementById('eye-patch-right').style.display = 'block';
    return true;
}