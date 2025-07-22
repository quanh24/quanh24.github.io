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
        Wallnut: 75,
        Cherry: 125
    },

    cooldowns: {
        Sunflower: 5000,
        Peashooter: 3000,
        Wallnut: 8000,
        Cherry: 7000
    },

    plantHP: {
        Sunflower: 60,
        Peashooter: 100,
        Wallnut: 300,
        Cherry: 200
    },

    baseZombieHP: 100,
    baseZombieSpeed: 0.5,
    zombieSpawnRate: 2000,
    levelUpInterval: 30000,
    massAttackInterval: 120000,

    zombieTypes: [
        {
            name: 'Normal',
            hp: 100,
            speed: 0.3,
            probability: 0.6,
            hitbox: { width: 80, height: 80, rows: 1, cols: 1 }
        },
        {
            name: 'Conehead',
            hp: 200,
            speed: 0.25,
            probability: 0.2,
            hitbox: { width: 80, height: 80, rows: 1, cols: 1 }
        },
        {
            name: 'Slime',
            hp: 400,
            speed: 0.2,
            probability: 0.8,
            minLevel: 1,
            hitbox: { width: 160, height: 160, rows: 2, cols: 2 }
        },
        {
            name: 'MiniSlime',
            hp: 80,
            speed: 0.35,
            probability: 0,
            hitbox: { width: 80, height: 80, rows: 1, cols: 1 }
        }
    ]
};
