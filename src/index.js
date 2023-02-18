import './style.css';

const common = require('./common');
const commands = require('./commands');
const createElements = require('./createElements');
const draw = require('./draw');

const query = common.parseQuery(document.location.search);
const elements = createElements(executeCommand);
let state;

function showMessage(message) {
  state.messages.push(message);
  draw.drawInfo(elements.info, state.messages);
}

function getText(r) { return r.text(); }

function queueServerCommand(command) {
  console.log(`queueServerCommand: ${command}`);
  const playerQuery = `player=${encodeURIComponent(query.player)}`;
  const cmdQuery = `cmd=${encodeURIComponent(command)}`;
  const url = `/api/exec?${playerQuery}&${cmdQuery}`;
  fetch(url).then(getText).then((text) => {
    const r = JSON.parse(text);
    common.clockSkew(new Date() - new Date(r.time));
  }).catch(() => {
    alert('Error!');
    document.location.reload();
  });
}

function executeCommand(cmd) {
  const { mode } = state;
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

if (!query.player) {
  const player = prompt('who are you?');
  document.location.href += `?player=${encodeURIComponent(player)}`;
} else {
  elements.statusBar.innerHTML = 'Loading...';
  fetch(`/api/state?player=${encodeURIComponent(query.player)}`).then(getText).then((text) => {
    state = JSON.parse(text);
    common.clockSkew(new Date() - new Date(state.time));
    draw.draw(elements, state);
    setInterval(() => {
      draw.drawBoard(elements.board, state.objects);
    }, 1000);
  }).catch(() => {
    alert('Sorry. We encountered an error loading your game. Try again later.');
  });
}
