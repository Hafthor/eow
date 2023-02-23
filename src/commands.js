const common = require('./common');
const buildings = require('./buildings');
const research = require('./research');

function executeBuildCommand(state, cmd) {
  const buildingType = cmd[1];
  const availableBuildingTypes = Object.keys(buildings)
    .filter((b) => buildings[b].dependsOn.every((r) => state.research.includes(r)));
  if (!buildingType) return `available building types: ${availableBuildingTypes}`;
  const building = buildings[buildingType];
  if (!building) return `unknown building type ${buildingType}`;
  if (!availableBuildingTypes.includes(buildingType)) {
    return `building type ${buildingType} requires research ${building.dependsOn}`;
  }
  if (state.resources.people + building.people < 0) return 'sorry, not enough people';
  const lacking = common.checkResources(state.resources, building.build);
  if (lacking) return `sorry, not have enough resources, lacking: ${JSON.stringify(lacking)}`;
  if (!cmd[2]) return { mode: `build ${buildingType}` };

  const coord = cmd[2].split(',');
  if (!common.inbounds(+coord[0], +coord[1], building.h, building.w)) return 'out of bounds';
  const obj = {
    r: +coord[0],
    c: +coord[1],
    minedAt: common.time(building.buildTime),
    type: buildingType,
    ...building,
  };
  if (common.collides(obj, state.objects)) return 'sorry, not enough space there';
  const lacking2 = common.deductResources(state.resources, building.build);
  state.resources.people += building.people;
  if (lacking2) return `sorry, not have enough resources, lacking: ${JSON.stringify(lacking2)}`;
  state.objects.push(obj);
  return { command: cmd.join(' ') };
}

function executeMoveCommand(state, cmd) {
  if (!cmd[1]) return { mode: cmd[0] };

  const moveFrom = cmd[1].split(',');
  const moveWhat = common.anyIntersect(+moveFrom[0], +moveFrom[1], state.objects);
  if (!moveWhat) return 'no building there';
  if (!cmd[2]) return { mode: `${cmd[0]} ${cmd[1]}` };

  const moveTo = cmd[2].split(',');
  const obj = { ...moveWhat, r: +moveTo[0], c: +moveTo[1] };
  const objects = state.objects.filter((o) => o !== moveWhat);
  if (common.collides(obj, objects)) return 'sorry, not enough space there';

  moveWhat.r = +moveTo[0];
  moveWhat.c = +moveTo[1];
  return { command: cmd.join(' ') };
}

function executeSellCommand(state, cmd) {
  if (!cmd[1]) return { mode: cmd[0] };
  const sellFrom = cmd[1].split(',');
  const sellWhat = common.anyIntersect(+sellFrom[0], +sellFrom[1], state.objects);
  if (!sellWhat) return 'no building there';
  const building = buildings[sellWhat.type];
  if (common.countPeople(state.objects, buildings) < building.people) return 'not enough room for our people';
  common.creditResources(state.resources, building.sell);
  state.resources.people -= building.people;
  state.objects.splice(state.objects.indexOf(sellWhat), 1);
  return { command: cmd.join(' ') };
}

function executeClickCommand(state, cmd, mode) {
  const modeCmd = (mode || '').split(' ')[0];
  const newCmd = `${mode || ''} ${cmd[1]}`;
  if (modeCmd === 'build') return executeBuildCommand(state, newCmd);
  if (modeCmd === 'move') return executeMoveCommand(state, newCmd);
  if (modeCmd === 'sell') return executeSellCommand(state, newCmd);

  const coord = cmd[1].split(',');
  const obj = common.anyIntersect(+coord[0], +coord[1], state.objects);
  if (!obj) return `Sorry, nothing found at r=${coord[0]}, c=${coord[1]}`;
  const building = buildings[obj.type];
  if (obj.minedAt > common.time(-building.harvestTime)) return null;

  Object.keys(building.harvest).forEach((resource) => {
    state.resources[resource] = (state.resources[resource] || 0) + building.harvest[resource];
  });
  obj.minedAt = common.time();
  return { command: cmd.join(' ') };
}

function executeResearchCommand(state, cmd) {
  const availableResearch = Object.keys(research)
    .filter((r) => !state.research.includes(r))
    .filter((r) => research[r].dependsOn.every((rr) => state.research.includes(rr)));
  if (!cmd[1]) return `available research = ${availableResearch}`;
  if (!research[cmd[1]]) return `unknown research ${cmd[1]}`;
  if (state.research.includes(cmd[1])) return `already researched ${cmd[1]}`;
  if (!availableResearch.includes(cmd[1])) return `cannot research ${cmd[1]} yet`;
  const lacking = common.deductResources(state.resources, research[cmd[1]].cost);
  if (lacking) return `sorry, not have enough resources, lacking: ${JSON.stringify(lacking)}`;
  state.research.push(cmd[1]);
  return { command: cmd.join(' ') };
}

function executeHelpCommand() {
  return 'commands: build {building_type}, sell, move, research. building types include hut, fire_hut and wood_hut. then you click where you want it (top/left). sell, you select the building to sell. move, you select building to move, then click where you want it (top/left).';
}

const dispatch = {
  help: executeHelpCommand,
  click: executeClickCommand,
  build: executeBuildCommand,
  move: executeMoveCommand,
  sell: executeSellCommand,
  research: executeResearchCommand,
};

function executeUnknownCommand(state, command) {
  return `Unknown command ${JSON.stringify(command)}. Try "help".`;
}

function executeCommand(state, command, mode) {
  const cmd = command.split(' ');
  return (dispatch[cmd[0]] || executeUnknownCommand)(state, cmd, mode);
}

module.exports = executeCommand;
