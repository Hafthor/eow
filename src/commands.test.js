const assert = require('assert');

const executeCommand = require('./commands');
const common = require('./common');

describe('commands.js', function () {
    describe('executeCommand', function () {
        it('should offer help', function () {
            const result = executeCommand({}, 'derp');
            assert.equal(typeof result, 'string');
            assert(result.includes('Try "help"'));
        });

        it('should help', function () {
            const result = executeCommand({}, 'help');
            assert.equal(typeof result, 'string');
            assert(result.includes('commands:'));
        });
    });

    describe('executeClickCommand', function () {
        it('should find nothing', function () {
            const result = executeCommand({ objects: [] }, 'click 0,0');
            assert.equal(typeof result, 'string');
            assert(result.includes('nothing found'));
        });

        it('should ignore clicks on buildings being built', function () {
            const hut = { r: 0, c: 0, w: 2, h: 2, type: 'hut', minedAt: '9999-01-01T00:00:00.000Z' };
            const result = executeCommand({ objects: [hut] }, 'click 0,0');
            assert(result == null);
        });

        it('should ignore clicks on unharvestable buildings', function () {
            const now = common.time();
            const hut = { r: 0, c: 0, w: 2, h: 2, type: 'hut', minedAt: now };
            const result = executeCommand({ objects: [hut] }, 'click 0,0');
            assert(result == null);
        });

        it('should harvest buildings', function () {
            const hut = { r: 0, c: 0, w: 2, h: 2, type: 'hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const state = { resources: {}, objects: [hut] };
            const result = executeCommand(state, 'click 0,0');
            assert.deepEqual(state.resources, { coins: 5 });
            assert(hut.minedAt !== '2000-01-01T00:00:00.000Z');
            assert.deepEqual(result, { command: 'click 0,0' });
        });
    });

    describe('executeBuildCommand', function () {
        it('should reject unknown building', function () {
            const result = executeCommand({}, 'build derp');
            assert.equal(typeof result, 'string');
            assert(result.includes('unknown'));
        });

        it('should reject when population insufficient', function () {
            const result = executeCommand({ resources: { people: 0 } }, 'build fire_hut');
            assert.equal(typeof result, 'string');
            assert(result.includes('not enough people'));
        });

        it('should reject when resources insufficient', function () {
            const result = executeCommand({ resources: { people: 10 } }, 'build fire_hut');
            assert.equal(typeof result, 'string');
            assert(result.includes('lacking'));
        });

        it('should return mode for build', function () {
            const result = executeCommand({ resources: { people: 10, coins: 10 } }, 'build fire_hut');
            assert.deepEqual(result, { mode: 'build fire_hut' });
        });

        it('should reject out of bounds build', function () {
            const state = { resources: { people: 10, coins: 10 } };
            const result = executeCommand(state, 'build fire_hut 1000,1000');
            assert.equal(typeof result, 'string');
            assert(result.includes('out of bounds'));
        });

        it('should reject collision build', function () {
            const hut = { r: 2, c: 2, w: 2, h: 2, type: 'hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const state = { resources: { people: 10, coins: 10 }, objects: [hut] };
            const result = executeCommand(state, 'build fire_hut 0,0');
            assert.equal(typeof result, 'string');
            assert(result.includes('not enough space'));
        });

        it('should build', function () {
            const hut = { r: 3, c: 3, w: 2, h: 2, type: 'hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const state = { resources: { people: 10, coins: 10 }, objects: [hut] };
            const result = executeCommand(state, 'build fire_hut 0,0');
            assert.deepEqual(result, { command: 'build fire_hut 0,0' });
            assert.deepEqual(state.resources, { people: 7, coins: 0 });
            assert.equal(state.objects.length, 2);
            assert.deepEqual(state.objects[0], hut);
            assert.equal(state.objects[1].type, 'fire_hut');
            assert.equal(state.objects[1].r, 0);
            assert.equal(state.objects[1].c, 0);
        });
    });

    describe('executeSellCommand', function () {
        it('should return mode for sell', function () {
            const result = executeCommand({}, 'sell');
            assert.deepEqual(result, { mode: 'sell' });
        });

        it('should reject sell miss', function () {
            const result = executeCommand({ resources: {}, objects: [] }, 'sell 0,0');
            assert.equal(typeof result, 'string');
            assert.equal(result, 'no building there');
        });

        it('should reject sell on negative population', function () {
            const hut = { r: 0, c: 0, w: 2, h: 2, type: 'hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const fire_hut = { r: 2, c: 2, w: 3, h: 3, type: 'fire_hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const state = { resources: {}, objects: [hut, fire_hut] };
            const result = executeCommand(state, 'sell 0,0');
            assert.equal(typeof result, 'string');
            assert.equal(result, 'not enough room for our people');
        });

        it('should sell', function () {
            const hut = { r: 0, c: 0, w: 2, h: 2, type: 'hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const state = { resources: { people: 5 }, objects: [hut] };
            const result = executeCommand(state, 'sell 0,0');
            assert.deepEqual(result, { command: 'sell 0,0' });
            assert.deepEqual(state.resources, { people: 0, lumber: 5 });
        });

        it('should sell on non top left hit', function () {
            const hut = { r: 0, c: 0, w: 2, h: 2, type: 'hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const state = { resources: { people: 5 }, objects: [hut] };
            const result = executeCommand(state, 'sell 1,1');
            assert.deepEqual(result, { command: 'sell 1,1' });
            assert.deepEqual(state.resources, { people: 0, lumber: 5 });
        });
    });

    describe('executeMoveCommand', function () {
        it('should return mode for move', function () {
            const result = executeCommand({}, 'move');
            assert.deepEqual(result, { mode: 'move' });
        });

        it('should reject move miss', function () {
            const result = executeCommand({ objects: [] }, 'move 0,0');
            assert.equal(typeof result, 'string');
            assert.equal(result, 'no building there');
        });

        it('should return mode for move 0,0', function () {
            const hut = { r: 0, c: 0, w: 2, h: 2, type: 'hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const state = { objects: [hut] };
            const result = executeCommand(state, 'move 0,0');
            assert.deepEqual(result, { mode: 'move 0,0' });
        });

        it('should reject move on collision', function () {
            const hut = { r: 0, c: 0, w: 2, h: 2, type: 'hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const fire_hut = { r: 3, c: 3, w: 3, h: 3, type: 'fire_hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const state = { objects: [hut, fire_hut] };
            const result = executeCommand(state, 'move 0,0 4,4');
            assert.equal(typeof result, 'string');
            assert(result.includes('not enough space'));
        });

        it('should move', function () {
            const hut = { r: 0, c: 0, w: 2, h: 2, type: 'hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const fire_hut = { r: 3, c: 3, w: 3, h: 3, type: 'fire_hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const state = { objects: [hut, fire_hut] };
            const result = executeCommand(state, 'move 0,0 1,1');
            assert.deepEqual(result, { command: 'move 0,0 1,1' });
            hut.r = 1; hut.c = 1;
            assert.deepEqual(state.objects, [hut, fire_hut]);
        });

        it('should move on non top left hit', function () {
            const hut = { r: 0, c: 0, w: 2, h: 2, type: 'hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const fire_hut = { r: 3, c: 3, w: 3, h: 3, type: 'fire_hut', minedAt: '2000-01-01T00:00:00.000Z' };
            const state = { objects: [hut, fire_hut] };
            const result = executeCommand(state, 'move 1,1 1,1');
            assert.deepEqual(result, { command: 'move 1,1 1,1' });
            hut.r = 1; hut.c = 1;
            assert.deepEqual(state.objects, [hut, fire_hut]);
        });
    });
});