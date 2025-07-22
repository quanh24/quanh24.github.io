const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
let sun = CONFIG.initialSun, score = 0, zLevel = 1, gameTime = 0, lastLevelUp = 0, lastMassAttack = 0;
let paused = false, selected = null, shovel = false, lastPlant = {};
let grid = Array.from({ length: CONFIG.rows }, () => Array(CONFIG.cols).fill(null));
let suns = [], zombies = [], bullets = [];
const plantTypes = [
    { name: 'Shovel', icon: '🪓' },
    { name: 'Sunflower', icon: '🌻' },
    { name: 'Peashooter', icon: '🌱' },
    { name: 'Wallnut', icon: '🌵' }
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
        grid[y][x] = { ...selected, hp: CONFIG.plantHP[selected.name], lastShot: 0 };
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
    zombies.push({
        x: canvas.width, y: row * CONFIG.cellSize, hp: CONFIG.baseZombieHP + (zLevel - 1) * 30,
        speed: CONFIG.baseZombieSpeed + (zLevel - 1) * 0.1, row
    });
}, CONFIG.zombieSpawnRate);

function massAttack() {
    for (let i = 0; i < CONFIG.rows; i++) {
        zombies.push({
            x: canvas.width + Math.random() * 200,
            y: i * CONFIG.cellSize,
            hp: CONFIG.baseZombieHP + (zLevel - 1) * 30,
            speed: CONFIG.baseZombieSpeed + (zLevel - 1) * 0.1,
            row: i
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
    bullets = bullets.filter(b => {
        b.x += 5;
        for (const z of zombies) {
            if (z.row === b.row && Math.hypot(b.y - (z.y + 30), b.x - z.x) < 30) {
                z.hp -= 20; return false;
            }
        }
        return b.x < canvas.width;
    });

    zombies = zombies.filter(z => {
        const cx = Math.floor(z.x / CONFIG.cellSize), cy = z.row;
        if (grid[cy][cx]) {
            const p = grid[cy][cx]; p.hp -= 0.5;
            if (p.hp <= 0) grid[cy][cx] = null;
        } else z.x -= z.speed;
        if (z.hp <= 0) { score += 10; return false; }
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

    for (let y = 0; y < CONFIG.rows; y++) for (let x = 0; x < CONFIG.cols; x++) {
        const p = grid[y][x];
        if (p && p.name === 'Peashooter' && Date.now() - p.lastShot > 1000) {
            bullets.push({ x: x * CONFIG.cellSize + 40, y: y * CONFIG.cellSize + 40, row: y });
            p.lastShot = Date.now();
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
        ctx.font = '30px sans-serif'; ctx.fillText('🧟', z.x, z.y + 60);
        ctx.fillStyle = 'red'; ctx.fillRect(z.x - 20, z.y + 80, 80, 6);
        ctx.fillStyle = 'lime'; ctx.fillRect(z.x - 20, z.y + 80, 80 * (z.hp / (CONFIG.baseZombieHP + (zLevel - 1) * 30)), 6);
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
}