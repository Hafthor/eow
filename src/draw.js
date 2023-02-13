const common = require('./common');
const buildings = require('./buildings');

module.exports = {
    draw, drawStatusBar, drawInfo, drawBoard
};

function draw(elements, state) {
    state.resources.people = common.countPeople(state.objects, buildings);
    drawStatusBar(elements.statusbar, state.resources, state.mode);
    drawBoard(elements.board, state.objects);
    drawInfo(elements.info, state.messages);
}

function drawStatusBar(statusbar, resources, mode) {
    statusbar.innerHTML = 'mode: ' + (mode || 'normal') + ', ' + JSON.stringify(resources);
}

function drawInfo(info, messages) {
    info.value = messages.join('\n');
    info.scrollTop = info.scrollHeight;
}

function drawBoard(board, objects) {
    const now = common.time();
    board.innerHTML = '';
    for (let r = 0; r < 20; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < 40; c++) {
            const o = common.anyTopLeft(r, c, objects);
            if (o) {
                const td = document.createElement('td');
                td.rowSpan = o.h;
                td.colSpan = o.w;
                td.innerHTML = o.type;
                const b = buildings[o.type];
                const mineableIfBefore = common.time(-b.harvestTime)
                td.className = now > o.minedAt ? o.minedAt < mineableIfBefore ? 'harvestable' : 'built' : 'building'
                if (td.className === 'building')
                    td.innerHTML += '<br>' + common.until(o.minedAt);
                else if (td.className === 'built')
                    td.innerHTML += '<br>' + common.until(o.minedAt, b.harvestTime);
                td.dataset.coord = r + ',' + c;
                td.dataset.hw = o.h + ',' + o.w;
                tr.appendChild(td);
            } else if (common.anyIntersect(r, c, objects)) {
                // do nothing
            } else { // empty
                const td = document.createElement('td');
                td.dataset.coord = r + ',' + c;
                tr.appendChild(td);
            }
        }
        board.appendChild(tr);
    }
}