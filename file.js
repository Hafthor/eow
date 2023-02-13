const fs = require('fs');

module.exports = { save, load };

const playerNameRx = /[a-zA-Z0-9_ -]{1,30}/;

function filenameForPlayer(player) {
    if (!playerNameRx.test(player)) throw 'Invalid player name';
    return 'saves/' + player + '.json';
}

function load(player) {
    return new Promise(function (res, rej) {
        const filename = filenameForPlayer(player);
        if (fs.exists(filename, function (exists) {
            if (!exists) {
                res();
            } else {
                fs.readFile(filename, function (err, buf) {
                    if (err) {
                        rej(err);
                    } else {
                        res(JSON.parse(buf));
                    }
                });
            }
        }));
    });
}

function save(player, state) {
    const filename = filenameForPlayer(player);
    return new Promise(function (res, rej) {
        fs.writeFile(filename, JSON.stringify(state), function (err) {
            if (err) rej(err); else res();
        });
    });
}