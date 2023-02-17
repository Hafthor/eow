module.exports = {
    'hut': {
        w: 2, h: 2,
        buildTime: 5,
        build: { lumber: 10 },
        sell: { lumber: 5 },
        harvestTime: 5,
        harvest: { coins: 5 },
        people: 5,
    },
    'fire_hut': {
        w: 3, h: 3,
        buildTime: 5,
        build: { coins: 10 },
        sell: { coins: 5 },
        harvestTime: 5,
        harvest: { food: 5 },
        people: -3,
    },
    'wood_hut': {
        w: 3, h: 3,
        buildTime: 5,
        build: { food: 10 },
        sell: { food: 5 },
        harvestTime: 5,
        harvest: { lumber: 20 },
        people: -2,
    },
};