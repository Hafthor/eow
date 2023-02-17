const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const url = require('url');

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
const webpackDevMiddlewareOptions = { publicPath: config.output.publicPath };
app.use(webpackDevMiddleware(compiler, webpackDevMiddlewareOptions));
app.use('/api/exec', apiExec);
app.use('/api/state', apiState);

// Serve the files on port 3000.
app.listen(3000, function () { });

const common = require('./src/common');
const execCmd = require('./src/commands');
const states = {};
const fs = require('fs');

function initialState() {
    return {
        resources: { coins: 10 },
        objects: [{ type: 'hut', level: 0, c: 20, r: 10, w: 2, h: 2, minedAt: common.time(buildings.hut.buildTime) }],
        messages: ['Welcome to EoW. Red buildings are being built. Green are ready to be harvested. Try "help" in command bar below.'],
    };
}

const file = require('./file');

function readOrInit(player) {
    return file.load(player).then(function (state) {
        if (state) return state;
        state = initialState();
        return file.save(player, state).then(function () {
            return state;
        });
    });
}

function apiExec(req, resp, next) {
    const query = url.parse(req.url, { parseQueryString: true }).query;
    readOrInit(query.player).then(function (state) {
        const result = execCmd(state, query.cmd);
        if (typeof result === 'string') {
            resp.status(400).send(result);
        } else if ((result || {}).command) {
            console.log('apiExec player=' + query.player + ', cmd=' + query.cmd);
            file.save(query.player, state).then(function () {
                resp.send(JSON.stringify({ time: common.time() }));
            });
        } else {
            resp.send(400).send(result);
        }
    });
}

function apiState(req, resp, next) {
    const query = url.parse(req.url, { parseQueryString: true }).query;
    readOrInit(query.player).then(function (state) {
        state.time = common.time();
        console.log('apiState player=' + query.player);
        resp.send(JSON.stringify(state));
    });
}