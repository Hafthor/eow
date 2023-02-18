const { describe, it } = require('mocha');
const assert = require('assert');
const fs = require('fs');
const file = require('./file');

describe('file.js', () => {
  describe('load', () => {
    it('should reject bad filename', () => {
      let exception = null;
      try {
        file.load('../hack').then(() => {
          assert.fail('should not complete');
        });
      } catch (e) {
        exception = e;
      }
      assert.notEqual(exception, null);
    });

    it('should not fail when no file', (done) => {
      file.load('test').then((o) => {
        assert.equal(o, null);
        done();
      });
    });

    it('should load good file', (done) => {
      const t = { time: new Date().toISOString() };
      fs.writeFileSync('saves/testload.json', JSON.stringify(t));
      file.load('testload').then((o) => {
        assert.equal(t.time, o.time);
        done();
      }).finally(() => {
        fs.unlinkSync('saves/testload.json');
      });
    });
  });

  describe('save', () => {
    it('should reject bad filename', () => {
      let exception = null;
      try {
        file.save('../hack', {}).then(() => {
          assert.fail('should not complete');
        });
      } catch (e) {
        exception = e;
      }
      assert.notEqual(exception, null);
    });

    it('should save file', (done) => {
      const t = { time: new Date().toISOString() };
      file.save('testsave', t).then(() => {
        const f = fs.readFileSync('saves/testsave.json');
        const o = JSON.parse(f);
        assert.equal(o.time, t.time);
        fs.unlinkSync('saves/testsave.json');
        done();
      });
    });
  });
});
