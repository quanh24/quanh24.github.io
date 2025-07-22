// config.js
const CONFIG = {
    rows: 6,
    cols: 15,
    cellSize: 80,

    initialSun: 150,
    sunFallSpeed: 0.3,
    sunflowerRate: 7000,
    globalSunRate: 5000,

    costs: {
        Sunflower: 50,
        Peashooter: 100,
        Wallnut: 75
    },

    cooldowns: {
        Sunflower: 5000,
        Peashooter: 3000,
        Wallnut: 8000
    },

    plantHP: {
        Sunflower: 60,
        Peashooter: 100,
        Wallnut: 300
    },

    baseZombieHP: 100,
    baseZombieSpeed: 0.5,
    zombieSpawnRate: 2000,
    levelUpInterval: 30000,
    massAttackInterval: 120000
};
