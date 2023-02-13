import './style.css';
const common = require('./common');
const commands = require('./commands');
const createElements = require('./createElements');
const draw = require('./draw');

const elements = createElements(executeCommand);

function executeCommand(cmd) {
    const mode = state.mode;
    delete state.mode;
    const result = commands(state, cmd, mode);
    if (typeof (result) === 'string') {
        showMessage(result);
    } else if (typeof (result) === 'object') {
        if (result.command) queueServerCommand(result.command);
        if (result.mode) state.mode = result.mode;
    }
    draw.draw(elements, state);
}

function showMessage(message) {
    state.messages.push(message);
    draw.drawInfo(elements.info, state.messages);
}

function getText(r) { return r.text(); }

function queueServerCommand(command) {
    console.log('queueServerCommand: ' + command);
    fetch('/api/exec?player=' + encodeURIComponent(query.player) + '&cmd=' + encodeURIComponent(command)).then(getText).then(function (text) {
        const r = JSON.parse(text);
        common.clockSkew(new Date() - new Date(r.time));
    }).catch(function (e) {
        alert('Error!');
        document.location.reload();
    });
}

let buildings, state;

const query = (location.search || '').substring(1).split('&').reduce(function (o, q) {
    const qq = q.split('=');
    o[decodeURIComponent(qq[0])] = decodeURIComponent(qq[1]);
    return o;
}, {});

if (!query.player) {
    const player = prompt('who are you?');
    location.href += '?player=' + encodeURIComponent(player);
} else {
    statusbar.innerHTML = 'Loading...';
    const promise1 = fetch('/api/buildings').then(getText).then(function (text) {
        buildings = JSON.parse(text);
        statusbar.innerHTML += '...';
    });
    const promise2 = fetch('/api/state?player=' + encodeURIComponent(query.player)).then(getText).then(function (text) {
        state = JSON.parse(text);
        common.clockSkew(new Date() - new Date(state.time));
        statusbar.innerHTML += '...';
    });
    Promise.all([promise1, promise2]).then(function () {
        draw.draw(elements, state);
        setInterval(function () {
            draw.drawBoard(elements.board, state.objects);
        }, 1000);
    });
}