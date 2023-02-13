module.exports = function createElements(executeCommand) {
    const statusbar = document.createElement('div');
    statusbar.id = 'statusbar';
    const board = document.createElement('table');
    board.id = 'board';
    board.cellPadding = 0;
    board.cellSpacing = 0;
    board.onmouseup = function (e) {
        const ex = e.offsetX, ey = e.offsetY;
        let ele = e.srcElement;
        if (ele && ele.dataset && ele.dataset.coord) {
            const coord = ele.dataset.coord.split(',');
            if (!ele.dataset.hw) {
                executeCommand('click ' + coord);
            } else {
                const td = ele.getBoundingClientRect();
                const tdh = td.bottom - td.top;
                const tdw = td.right - td.left;
                const hw = ele.dataset.hw.split(',');
                let r = +coord[0] + ey / (tdh / +hw[0]) | 0;
                let c = +coord[1] + ex / (tdw / +hw[1]) | 0;
                // clap to limit, just in case the math is slightly off
                if (r >= +coord[0] + +hw[0]) r = +coord[0] + +hw[0] - 1;
                if (c >= +coord[1] + +hw[1]) c = +coord[1] + +hw[1] - 1;
                executeCommand('click ' + r + ',' + c);
            }
        }
        return false;
    }

    const info = document.createElement('textarea');
    info.id = 'info';

    const commandbar = document.createElement('input');
    commandbar.id = 'commandbar';
    document.body.appendChild(statusbar);
    document.body.appendChild(board);
    document.body.appendChild(info);
    document.body.appendChild(commandbar);
    commandbar.onkeyup = function (e) {
        if (event.key === 'Enter') {
            this.select();
            executeCommand(this.value);
        }
    };
    return { statusbar, board, info, commandbar };
}
