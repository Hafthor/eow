const common = require('./common');
const buildings = require('./buildings');

module.exports = executeCommand;

function executeCommand(state, command, mode) {
    const cmd = command.split(' ');
    if (cmd[0] === 'help')
        return 'commands: build {building_type}, sell and move. building types include hut, fire_hut and wood_hut. then you click where you want it (top/left). sell, you select the building to sell. move, you select building to move, then click where you want it (top/left).';
    else if (cmd[0] === 'click')
        return executeClickCommand(state, cmd, mode);
    else if (cmd[0] === 'build')
        return executeBuildCommand(state, cmd);
    else if (cmd[0] === 'move')
        return executeMoveCommand(state, cmd);
    else if (cmd[0] === 'sell') 
        return executeSellCommand(state, cmd);
    else
        return 'Unknown command ' + JSON.stringify(command) + '. Try "help".';
}

function executeClickCommand(state, cmd, mode) {
    if (mode && mode.split(' ')[0] === 'build')
        return executeCommand(state, mode + ' ' + cmd[1]);
    if (mode && mode.split(' ')[0] === 'move')
        return executeCommand(state, mode + ' ' + cmd[1]);
    if (mode && mode.split(' ')[0] === 'sell')
        return executeCommand(state, mode + ' ' + cmd[1]);

    const coord = cmd[1].split(',');
    const o = common.anyIntersect(+coord[0], +coord[1], state.objects);
    if (!o) return 'Sorry, nothing found at r=' + coord[0] + ', c=' + coord[1];
    const b = buildings[o.type];
    if (o.minedAt > common.time(-b.harvestTime)) return;

    for (let r in b.harvest)
        state.resources[r] = (state.resources[r] || 0) + b.harvest[r];
    o.minedAt = common.time();
    return { command: cmd.join(' ') };
}

function executeBuildCommand(state, cmd) {
    const type = cmd[1];
    const b = buildings[type];
    if (!b) return 'unknown building type ' + type;
    if (state.resources.people + b.people < 0)
        return 'sorry, not enough people';
    const lacking = common.checkResources(state.resources, b.build);
    if (lacking) return 'sorry, not have enough resources, lacking: ' + JSON.stringify(lacking);
    if (!cmd[2]) return { mode: 'build ' + type };

    const coord = cmd[2].split(',');
    if (!common.inbounds(+coord[0], +coord[1], b.h, b.w)) return 'out of bounds';
    const o = Object.assign({ r: +coord[0], c: +coord[1], state: -1, minedAt: common.time(b.buildTime), type: type }, b);
    if (common.collides(o, state.objects)) return 'sorry, not enough space there';
    const lacking2 = common.deductResources(state.resources, b.build);
    if (lacking2) return 'sorry, not have enough resources, lacking: ' + JSON.stringify(lacking2);
    state.objects.push(o);
    return { command: cmd.join(' ') };
}

function executeMoveCommand(state, cmd) {
    if (!cmd[1])
        return { mode: cmd[0] };

    const moveFrom = cmd[1].split(',');
    const moveWhat = common.anyIntersect(+moveFrom[0], +moveFrom[1], state.objects);
    if (!cmd[2]) return { mode: cmd[0] + ' ' + cmd[1] };
    
    const moveTo = cmd[2].split(',');
    const o = Object.assign({ r: +moveTo[0], c: +moveTo[1] }, moveWhat);
    const objects = state.objects.filter(function (o) { o !== moveWhat; });
    if (common.collides(o, objects)) return 'sorry, not enough space there';
    
    moveWhat.r = +moveTo[0];
    moveWhat.c = +moveTo[1];
    return { command: cmd.join(' ') };
}

function executeSellCommand(state, cmd) {
    if (!cmd[1])
        return { mode: cmd[0] };
    const sellFrom = cmd[1].split(',');
    const sellWhat = common.anyIntersect(+sellFrom[0], +sellFrom[1], state.objects);
    if (!sellWhat) return 'no building there';
    const b = buildings[sellWhat.type];
    if (common.countPeople(state.objects, buildings)<b.people) return 'not enough room for our people';
    common.creditResources(state.resources, b.sell);
    state.objects.splice(state.objects.indexOf(sellWhat), 1);
    return { command: cmd.join(' ') };
}