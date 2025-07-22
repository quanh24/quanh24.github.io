// pvzgame.js
const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
let sun = CONFIG.initialSun, score = 0, zLevel = 1, gameTime = 0, lastLevelUp = 0, lastMassAttack = 0;
let paused = false, selected = null, shovel = false, lastPlant = {};
let grid = Array.from({ length: CONFIG.rows }, () => Array(CONFIG.cols).fill(null));
let suns = [], zombies = [], bullets = [];
let explosions = [];
const plantTypes = [
    { name: 'Shovel', icon: '🪓' },
    { name: 'Sunflower', icon: '🌻' },
    { name: 'Peashooter', icon: '🌱' },
    { name: 'Wallnut', icon: '🌵' },
    { name: 'Cherry', icon: '🍒' },
];

const ui = document.getElementById('ui');
plantTypes.forEach(p => {
    const btn = document.createElement('div'); btn.className = 'card';
    btn.innerText = p.icon + (p.name !== 'Shovel' ? '\n' + CONFIG.costs[p.name] : '');
    btn.onclick = () => {
        plantTypes.forEach(p2 => p2.el.classList.remove('selected'));
        if (p.name === 'Shovel') { shovel = true; selected = null; }
        else if (Date.now() - (lastPlant[p.name] || 0) >= CONFIG.cooldowns[p.name]) {
            selected = p; shovel = false; btn.classList.add('selected');
        }
    };
    p.el = btn; ui.appendChild(btn);
});

document.getElementById('pauseBtn').onclick = () => {
    paused = !paused;
    document.getElementById('pauseBtn').innerText = paused ? '▶ Resume' : '⏸ Pause';
};

canvas.addEventListener('click', e => {
    if (paused) return;
    const x = Math.floor(e.offsetX / CONFIG.cellSize), y = Math.floor(e.offsetY / CONFIG.cellSize);
    if (shovel && grid[y][x]) { grid[y][x] = null; }
    else if (selected && !grid[y][x] && sun >= CONFIG.costs[selected.name]) {
        const plant = { ...selected, hp: CONFIG.plantHP[selected.name], lastShot: 0 };
        if (selected.name === 'Cherry') {
            plant.explodeAt = Date.now() + 500; // ⏱ nổ sau 0.5s
        }
        grid[y][x] = plant;
        sun -= CONFIG.costs[selected.name];
        lastPlant[selected.name] = Date.now();
        selected = null;
        plantTypes.forEach(p => p.el.classList.remove('selected'));
    }
});

canvas.addEventListener('mousemove', e => {
    if (paused) return;
    suns = suns.filter(s => {
        const dx = s.x - e.offsetX, dy = s.y - e.offsetY;
        if (dx * dx + dy * dy < 900) { sun += 25; return false; }
        return true;
    });
});

setInterval(() => { if (!paused) suns.push({ x: Math.random() * (canvas.width - 40) + 20, y: 0, vy: CONFIG.sunFallSpeed }); }, CONFIG.globalSunRate);
setInterval(() => {
    if (!paused) {
        grid.forEach((row, y) => row.forEach((c, x) => c && c.name === 'Sunflower' && suns.push({ x: x * CONFIG.cellSize + 30, y: y * CONFIG.cellSize + 30, vy: CONFIG.sunFallSpeed })));
    }
}, CONFIG.sunflowerRate);

setInterval(() => {
    if (paused) return;
    const row = Math.floor(Math.random() * CONFIG.rows);

    // Xác định loại zombie sẽ spawn
    let type = 'Normal';
    const level = zLevel;
    const rand = Math.random();
    let probSum = 0;
    for (let zt of CONFIG.zombieTypes) {
        if (zt.minLevel && level < zt.minLevel) continue;
        probSum += zt.probability;
        if (rand < probSum) {
            type = zt.name;
            break;
        }
    }

    // Tạo zombie
    const zConf = CONFIG.zombieTypes.find(z => z.name === type);
    zombies.push({
        x: canvas.width,
        y: row * CONFIG.cellSize,
        row,
        type,
        hp: zConf.hp + (zLevel - 1) * 30,
        speed: zConf.speed + (zLevel - 1) * 0.05
    });
}, CONFIG.zombieSpawnRate);

function massAttack() {
    for (let i = 0; i < CONFIG.rows; i++) {
        let type = 'Normal';
        const level = zLevel;
        const rand = Math.random();
        let probSum = 0;
        for (let zt of CONFIG.zombieTypes) {
            if (zt.minLevel && level < zt.minLevel) continue;
            probSum += zt.probability;
            if (rand < probSum) {
                type = zt.name;
                break;
            }
        }
        const zConf = CONFIG.zombieTypes.find(z => z.name === type);
        zombies.push({
            x: canvas.width + Math.random() * 200,
            y: i * CONFIG.cellSize,
            row: i,
            type,
            hp: zConf.hp + (zLevel - 1) * 30,
            speed: zConf.speed + (zLevel - 1) * 0.05
        });
    }
}

let lastTS = performance.now();
function loop(ts) {
    const dt = ts - lastTS; lastTS = ts;
    if (!paused) {
        gameTime += dt;
        if (gameTime - lastLevelUp >= CONFIG.levelUpInterval) { zLevel++; lastLevelUp = gameTime; }
        if (gameTime - lastMassAttack >= CONFIG.massAttackInterval) { massAttack(); lastMassAttack = gameTime; }
        update(dt); draw();
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function update(dt) {
    // Bullet di chuyển và va chạm với zombie (dùng hitbox đúng vùng)
    bullets = bullets.filter(b => {
        b.x += 5;
        for (const z of zombies) {
            const zConf = CONFIG.zombieTypes.find(t => t.name === z.type);
            const zx1 = z.x;
            const zx2 = z.x + zConf.hitbox.cols * CONFIG.cellSize;
            const zy1 = z.row;
            const zy2 = z.row + zConf.hitbox.rows;

            if (b.x >= zx1 && b.x <= zx2 && b.row >= zy1 && b.row < zy2) {
                z.hp -= 20;
                return false;
            }
        }
        return b.x < canvas.width;
    });

    const newZombies = [];

    // Zombie di chuyển hoặc ăn cây (dùng hitbox nhiều ô)
    zombies = zombies.filter(z => {
        if (z.hp <= 0) {
            score += 10;

            if (z.type === 'Slime') {
                for (let i = 0; i < 4; i++) {
                    const offsetRow = z.row + Math.floor(i / 2);
                    if (offsetRow >= CONFIG.rows) continue;

                    newZombies.push({
                        x: canvas.width + (i % 2) * 40,
                        y: offsetRow * CONFIG.cellSize,
                        row: offsetRow,
                        type: 'MiniSlime',
                        hp: CONFIG.zombieTypes.find(t => t.name === 'MiniSlime').hp + (zLevel - 1) * 30,
                        speed: CONFIG.zombieTypes.find(t => t.name === 'MiniSlime').speed + (zLevel - 1) * 0.05
                    });
                }
            }

            return false;
        }

        let isEating = false;
        const zConf = CONFIG.zombieTypes.find(t => t.name === z.type);
        for (let dx = 0; dx < zConf.hitbox.cols; dx++) {
            for (let dy = 0; dy < zConf.hitbox.rows; dy++) {
                const cx = Math.floor((z.x + dx * CONFIG.cellSize) / CONFIG.cellSize);
                const cy = z.row + dy;
                if (cx >= 0 && cx < CONFIG.cols && cy >= 0 && cy < CONFIG.rows && grid[cy][cx]) {
                    const p = grid[cy][cx];
                    p.hp -= 0.5;
                    if (p.hp <= 0) grid[cy][cx] = null;
                    isEating = true;
                }
            }
        }
        if (!isEating) z.x -= z.speed;

        if (z.x < 0) {
            paused = true;
            document.getElementById('finalScore').innerText = score;
            document.getElementById('finalTime').innerText = Math.floor(gameTime / 1000);
            document.getElementById('finalLevel').innerText = zLevel;
            document.getElementById('gameOverModal').style.display = 'flex';
            return false;
        }

        return true;
    });
    zombies.push(...newZombies);

    // Peashooter bắn
    for (let y = 0; y < CONFIG.rows; y++) {
        for (let x = 0; x < CONFIG.cols; x++) {
            const p = grid[y][x];
            if (p && p.name === 'Peashooter' && Date.now() - p.lastShot > 1000) {
                bullets.push({ x: x * CONFIG.cellSize + 40, y: y * CONFIG.cellSize + 40, row: y });
                p.lastShot = Date.now();
            }
        }
    }

    // Cherry nổ
    for (let y = 0; y < CONFIG.rows; y++) {
        for (let x = 0; x < CONFIG.cols; x++) {
            const p = grid[y][x];
            if (p && p.name === 'Cherry' && p.explodeAt && !p.exploded && Date.now() >= p.explodeAt) {
                p.exploded = true;
                explosions.push({ x, y, time: Date.now() });

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < CONFIG.cols && ny >= 0 && ny < CONFIG.rows) {
                            zombies.forEach(z => {
                                const zConf = CONFIG.zombieTypes.find(t => t.name === z.type);
                                for (let dzr = 0; dzr < zConf.hitbox.rows; dzr++) {
                                    for (let dzc = 0; dzc < zConf.hitbox.cols; dzc++) {
                                        const zx = Math.floor(z.x / CONFIG.cellSize) + dzc;
                                        const zy = z.row + dzr;
                                        if (zx === nx && zy === ny) {
                                            z.hp -= 999;
                                        }
                                    }
                                }
                            });
                        }
                    }
                }

                setTimeout(() => {
                    if (grid[y][x] && grid[y][x].name === 'Cherry') grid[y][x] = null;
                }, 100);
            }
        }
    }
}

function draw() {
    ctx.fillStyle = '#4caf50'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
    for (let r = 0; r < CONFIG.rows; r++) for (let c = 0; c < CONFIG.cols; c++) {
        ctx.strokeRect(c * CONFIG.cellSize, r * CONFIG.cellSize, CONFIG.cellSize, CONFIG.cellSize);
    }

    for (let y = 0; y < CONFIG.rows; y++) for (let x = 0; x < CONFIG.cols; x++) {
        const p = grid[y][x];
        if (p) {
            ctx.font = '30px sans-serif'; ctx.fillText(p.icon, x * CONFIG.cellSize + 20, y * CONFIG.cellSize + 50);
            ctx.fillStyle = 'red'; ctx.fillRect(x * CONFIG.cellSize + 10, y * CONFIG.cellSize + 60, 60, 6);
            ctx.fillStyle = 'lime'; ctx.fillRect(x * CONFIG.cellSize + 10, y * CONFIG.cellSize + 60, 60 * (p.hp / CONFIG.plantHP[p.name]), 6);
        }
    }

    ctx.font = '25px sans-serif';
    suns.forEach(s => { s.y += s.vy; ctx.fillText('☀️', s.x, s.y); });

    ctx.fillStyle = 'yellow';
    bullets.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, 2 * Math.PI); ctx.fill(); });

    zombies.forEach(z => {
        const zConf = CONFIG.zombieTypes.find(t => t.name === z.type);
        const w = zConf.hitbox.cols * CONFIG.cellSize;
        const h = zConf.hitbox.rows * CONFIG.cellSize;

        // Chọn biểu tượng và font
        let emoji = '🧟', fontSize = '30px';
        if (z.type === 'Slime') { emoji = '🟢'; fontSize = '100px'; }
        else if (z.type === 'MiniSlime') { emoji = '🟩'; fontSize = '30px'; }

        const iconX = z.x + w / 2 - 30;
        const iconY = z.row * CONFIG.cellSize + h / 2 + 30;

        ctx.font = fontSize + ' sans-serif';
        ctx.fillText(emoji, iconX, iconY);

        // Thanh máu
        const barX = z.x;
        const barY = z.row * CONFIG.cellSize + h + 5;

        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, w, 6);
        ctx.fillStyle = 'lime';
        const maxHP = zConf.hp + (zLevel - 1) * 30;
        ctx.fillRect(barX, barY, w * (z.hp / maxHP), 6);
    });

    document.getElementById('sunCount').innerText = sun;
    document.getElementById('score').innerText = score;
    document.getElementById('zLevel').innerText = zLevel;
    document.getElementById('time').innerText = Math.floor(gameTime / 1000);

    plantTypes.forEach(p => {
        const cd = CONFIG.cooldowns[p.name] - (Date.now() - (lastPlant[p.name] || 0));
        p.el.querySelector('.cooldown')?.remove();
        if (p.name !== 'Shovel' && cd > 0) {
            const d = document.createElement('div'); d.className = 'cooldown'; d.innerText = Math.ceil(cd / 1000);
            p.el.appendChild(d);
        }
    });

    explosions = explosions.filter(e => Date.now() - e.time < 400);
    explosions.forEach(e => {
        const px = e.x * CONFIG.cellSize, py = e.y * CONFIG.cellSize;
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(px + 40, py + 40, 40, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(px + 40, py + 40, 20, 0, 2 * Math.PI);
        ctx.fill();
    });
}