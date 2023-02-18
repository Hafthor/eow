/* eslint-disable no-restricted-globals */
module.exports = function createElements(executeCommand) {
  const statusBar = document.createElement('div');
  statusBar.id = 'statusBar';
  const board = document.createElement('table');
  board.id = 'board';
  board.cellPadding = 0;
  board.cellSpacing = 0;
  board.onmouseup = function boardMouseUp(event) {
    const ex = event.offsetX; const
      ey = event.offsetY;
    const element = event.srcElement;
    if (element && element.dataset && element.dataset.coord) {
      const coord = element.dataset.coord.split(',');
      if (!element.dataset.hw) {
        executeCommand(`click ${coord}`);
      } else {
        const td = element.getBoundingClientRect();
        const tdh = td.bottom - td.top;
        const tdw = td.right - td.left;
        const hw = element.dataset.hw.split(',');
        let r = Math.floor(+coord[0] + ey / (tdh / +hw[0]));
        let c = Math.floor(+coord[1] + ex / (tdw / +hw[1]));
        // clamp to limit, just in case the math is slightly off
        if (r >= +coord[0] + +hw[0]) r = +coord[0] + +hw[0] - 1;
        if (c >= +coord[1] + +hw[1]) c = +coord[1] + +hw[1] - 1;
        executeCommand(`click ${r},${c}`);
      }
    }
    return false;
  };

  const info = document.createElement('textarea');
  info.id = 'info';

  const commandBar = document.createElement('input');
  commandBar.id = 'commandBar';
  document.body.appendChild(statusBar);
  document.body.appendChild(board);
  document.body.appendChild(info);
  document.body.appendChild(commandBar);
  commandBar.onkeyup = function commandBarOnKeyUp() {
    if (event.key === 'Enter') {
      this.select();
      executeCommand(this.value);
    }
  };
  return {
    statusBar, board, info, commandBar,
  };
};
