const common = require('./common');
const buildings = require('./buildings');

function drawStatusBar(statusBar, resources, mode) {
  statusBar.innerHTML = `mode: ${mode || 'normal'}, ${JSON.stringify(resources)}`;
}

function drawInfo(info, messages) {
  info.value = messages.join('\n');
  info.scrollTop = info.scrollHeight;
}

function drawBoard(board, objects) {
  const now = common.time();
  board.innerHTML = '';
  for (let r = 0; r < 20; r += 1) {
    const tr = document.createElement('tr');
    for (let c = 0; c < 40; c += 1) {
      const o = common.anyTopLeft(r, c, objects);
      if (o) {
        const td = document.createElement('td');
        td.rowSpan = o.h;
        td.colSpan = o.w;
        td.innerHTML = o.type;
        const b = buildings[o.type];
        const mineableIfBefore = common.time(-b.harvestTime);
        if (now < o.minedAt) {
          td.className = 'building';
          td.innerHTML += `<br>${common.until(o.minedAt)}`;
        } else if (o.minedAt < mineableIfBefore) {
          td.className = 'harvestable';
        } else {
          td.className = 'built';
          td.innerHTML += `<br>${common.until(o.minedAt, b.harvestTime)}`;
        }
        td.dataset.coord = `${r},${c}`;
        td.dataset.hw = `${o.h},${o.w}`;
        tr.appendChild(td);
      } else if (common.anyIntersect(r, c, objects)) {
        // do nothing
      } else { // empty
        const td = document.createElement('td');
        td.dataset.coord = `${r},${c}`;
        tr.appendChild(td);
      }
    }
    board.appendChild(tr);
  }
}

function draw(elements, state) {
  state.resources.people = common.countPeople(state.objects, buildings);
  drawStatusBar(elements.statusBar, state.resources, state.mode);
  drawBoard(elements.board, state.objects);
  drawInfo(elements.info, state.messages);
}

module.exports = {
  draw, drawStatusBar, drawInfo, drawBoard,
};
