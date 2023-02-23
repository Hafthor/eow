module.exports = {
  cooking: {
    dependsOn: [],
    cost: { coins: 50 },
  },
  logging: {
    dependsOn: ['cooking'],
    cost: { coins: 100, food: 100 },
  },
};
