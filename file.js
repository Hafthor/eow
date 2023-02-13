const fs = require('fs');

module.exports = { save, load };

const playerNameRx = /^[a-zA-Z0-9_][a-zA-Z0-9_ -]*[a-zA-Z0-9_]$/;

function filenameForPlayer(player) {
    if (!playerNameRx.test(player))
        throw 'Invalid player name "' + player + '"';
    return 'saves/' + player + '.json';
}

function load(player) {
    const filename = filenameForPlayer(player);
    return new Promise(function (res, rej) {
        if (fs.exists(filename, function (exists) {
            if (!exists) {
                res();
            } else {
                fs.readFile(filename, function (err, buf) {
                    err ? rej(err) : res(JSON.parse(buf));
                });
            }
        }));
    });
}

function save(player, state) {
    const filename = filenameForPlayer(player);
    return new Promise(function (res, rej) {
        fs.writeFile(filename, JSON.stringify(state), function (err) {
            err ? rej(err) : res();
        });
    });
}