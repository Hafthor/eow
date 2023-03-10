const { describe, it } = require('mocha');
const assert = require('assert');
const common = require('./common');

describe('common.js', () => {
  describe('time/clockSkew', () => {
    it('should return current time', () => {
      common.clockSkew(0);
      const before = new Date().toISOString();
      const now = common.time();
      const after = new Date().toISOString();
      assert(before <= now && now <= after);
    });

    it('should skew current time', () => {
      const before = new Date(new Date().getTime() + 1000).toISOString();
      common.clockSkew(1000);
      const now = common.time();
      common.clockSkew(0);
      const after = new Date(new Date().getTime() + 1000).toISOString();
      assert(before <= now && now <= after);
    });

    it('should add current time', () => {
      common.clockSkew(0);
      const before = new Date(new Date().getTime() + 6000).toISOString();
      const now6 = common.time(6);
      const after = new Date(new Date().getTime() + 6000).toISOString();
      assert(before <= now6 && now6 <= after);
    });
  });

  describe('ft/until', () => {
    it('should return friendly time', () => {
      assert.equal(common.ft(6), '6s');
      assert.equal(common.ft(60), '60s');
      assert.equal(common.ft(600), '10m');
      assert.equal(common.ft(6000), '2h');
      assert.equal(common.ft(60000), '17h');

      assert.equal(common.ft(-6), '-6s');
      assert.equal(common.ft(-60), '-60s');
      assert.equal(common.ft(-600), '-10m');
      assert.equal(common.ft(-6000), '-2h');
      assert.equal(common.ft(-60000), '-17h');
    });

    it('should return friendly time until', () => {
      assert.equal(common.until(common.time(6)), '6s');
      assert.equal(common.until(common.time(-6)), '6s ago');
    });

    it('should return friendly time from offset of now', () => {
      const now = new Date().toISOString();
      assert.equal(common.until(now, +6), '6s');
      assert.equal(common.until(now, -6), '6s ago');
    });
  });

  describe('countPeople', () => {
    it('should default to zero', () => {
      const actual = common.countPeople([], {});
      assert.equal(actual, 0);
    });

    it('should count people', () => {
      const objects = [{ type: 'a' }, { type: 'a' }, { type: 'c' }];
      const buildings = { a: { people: 10 }, b: { people: 100 }, c: { people: 1000 } };
      const actual = common.countPeople(objects, buildings);
      assert.equal(actual, 1020);
    });
  });

  describe('anyTopLeft', () => {
    it('should return null when not found', () => {
      const objects = [{ r: 0, c: 0 }];
      const actual = common.anyTopLeft(1, 1, objects);
      assert.equal(null, actual);
    });

    it('should return object when found', () => {
      const objects = [{ r: 1, c: 1 }];
      const actual = common.anyTopLeft(1, 1, objects);
      assert.equal(objects[0], actual);
    });
  });

  describe('intersect', () => {
    it('should return false when not intersecting', () => {
      const object = {
        r: 5, c: 5, h: 2, w: 2,
      };
      for (let r = 3; r <= 7; r += 2) {
        for (let c = 3; c <= 7; c += 2) {
          if (r !== 5 && c !== 5) {
            assert.equal(common.intersect(r, c, object), false);
          }
        }
      }
    });

    it('should return true when intersecting', () => {
      const object = {
        r: 5, c: 5, h: 2, w: 2,
      };
      for (let r = 5; r <= 6; r += 1) {
        for (let c = 5; c <= 6; c += 1) {
          assert.equal(common.intersect(r, c, object), true);
        }
      }
    });
  });

  describe('anyIntersect', () => {
    it('should return null when no intersecting object', () => {
      const objects = [
        {
          r: 3, c: 3, h: 2, w: 2,
        },
        {
          r: 5, c: 5, h: 2, w: 2,
        },
        {
          r: 7, c: 7, h: 2, w: 2,
        },
      ];
      assert.equal(null, common.anyIntersect(3, 7, objects));
    });

    it('should return first intersecting object', () => {
      const objects = [
        {
          r: 3, c: 3, h: 2, w: 2,
        },
        {
          r: 5, c: 5, h: 2, w: 2,
        },
        {
          r: 7, c: 7, h: 2, w: 2,
        },
      ];
      assert.equal(objects[1], common.anyIntersect(6, 6, objects));
    });
  });

  describe('collides', () => {
    it('should return first collider on collision', () => {
      const objects = [
        {
          r: 0, c: 3, h: 3, w: 3,
        },
        {
          r: 3, c: 0, h: 3, w: 3,
        },
        {
          r: 3, c: 3, h: 3, w: 3,
        },
      ];
      assert.equal(common.collides({
        r: 0, c: 0, h: 4, w: 3,
      }, objects), objects[1]);
      assert.equal(common.collides({
        r: 0, c: 0, h: 3, w: 4,
      }, objects), objects[0]);
    });

    it('should return null on non collision', () => {
      const objects = [
        {
          r: 0, c: 3, h: 3, w: 3,
        },
        {
          r: 3, c: 0, h: 3, w: 3,
        },
        {
          r: 3, c: 3, h: 3, w: 3,
        },
      ];
      assert.equal(common.collides({
        r: 0, c: 0, h: 3, w: 3,
      }, objects), null);
    });
  });

  describe('inbounds', () => {
    it('should return true when inbounds', () => {
      assert.equal(common.inbounds(0, 0), true);
      assert.equal(common.inbounds(15, 35, 5, 5), true);
      assert.equal(common.inbounds(19, 39), true);
    });

    it('should return false when not inbounds', () => {
      assert.equal(common.inbounds(-1, 0), false);
      assert.equal(common.inbounds(0, -1), false);
      assert.equal(common.inbounds(20, 0), false);
      assert.equal(common.inbounds(0, 40), false);

      assert.equal(common.inbounds(15, 0, 10, 10), false);
      assert.equal(common.inbounds(0, 35, 10, 10), false);
    });
  });

  describe('checkResource/deductResources/creditResources', () => {
    it('should return null if not lacking', () => {
      const res = { a: 10, b: 10, c: 10 };
      const cost = { b: 5, c: 10 };
      const actual = common.checkResources(res, cost);
      assert.equal(actual, null);
    });

    it('should deduct resources if not lacking', () => {
      const res = { a: 10, b: 10, c: 10 };
      const cost = { b: 5, c: 10 };
      const actual = common.deductResources(res, cost);
      assert.equal(actual, null);
      assert.deepEqual(res, { a: 10, b: 5, c: 0 });
    });

    it('should return deficit if lacking', () => {
      const res = { a: 10, b: 10, c: 10 };
      const cost = { b: 5, c: 15, d: 10 };
      const actual = common.checkResources(res, cost);
      assert.deepEqual(actual, { c: 5, d: 10 });
    });

    it('should not deduct resources if lacking', () => {
      const res = { a: 10, b: 10, c: 10 };
      const cost = { b: 5, c: 15, d: 10 };
      const actual = common.deductResources(res, cost);
      assert.deepEqual(actual, { c: 5, d: 10 });
      assert.deepEqual(res, { a: 10, b: 10, c: 10 });
    });

    it('should credit resources', () => {
      const res = { a: 10, b: 10, c: 10 };
      const amt = { b: 5, c: 15, d: 10 };
      common.creditResources(res, amt);
      assert.deepEqual(res, {
        a: 10, b: 15, c: 25, d: 10,
      });
    });
  });

  describe('parseQuery', () => {
    it('should handle empty query', () => {
      const actual = common.parseQuery();
      assert.deepEqual(actual, {});
    });

    it('should handle valueless query param', () => {
      const actual = common.parseQuery('?cmd');
      assert.deepEqual(actual, { cmd: null });
    });

    it('should handle queries with params', () => {
      const actual = common.parseQuery('?a=1&b=2');
      assert.deepEqual(actual, { a: '1', b: '2' });
    });

    it('should handle repeated names by overwriting them', () => {
      const actual = common.parseQuery('?a=1&a=2');
      assert.deepEqual(actual, { a: '2' });
    });
  });
});
