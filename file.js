const fs = require('fs');

const playerNameRx = /^[a-zA-Z0-9_][a-zA-Z0-9_ -]*[a-zA-Z0-9_]$/;

function filenameForPlayer(player) {
  if (!playerNameRx.test(player)) throw new Error(`Invalid player name "${player}"`);
  return `saves/${player}.json`;
}

function load(player) {
  const filename = filenameForPlayer(player);
  return new Promise((res, rej) => {
    if (fs.exists(filename, (exists) => {
      if (!exists) {
        res();
      } else {
        fs.readFile(filename, (err, buf) => {
          if (err) rej(err); else res(JSON.parse(buf));
        });
      }
    }));
  });
}

function save(player, state) {
  const filename = filenameForPlayer(player);
  return new Promise((res, rej) => {
    fs.writeFile(filename, JSON.stringify(state), (err) => {
      if (err) rej(err); else res();
    });
  });
}

module.exports = { save, load };
