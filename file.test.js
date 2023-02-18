const {describe,it} = require('mocha');
const assert = require('assert');
const fs = require('fs');
const file = require('./file');

describe('file.js', function () {
    describe('load', function () {
        it('should reject bad filename', function () {
            let exception = null;
            try {
                file.load('../hack').then(function() {
                    assert.fail('should not complete');
                });
            } catch (e) {
                exception = e;
            }
            assert.notEqual(exception, null);
        });

        it('should not fail when no file', function (done) {
            file.load('test').then(function (o) {
                assert.equal(o, null);
                done();
            });
        });

        it('should load good file', function (done) {
            const t = { time: new Date().toISOString() };
            fs.writeFileSync('saves/testload.json', JSON.stringify(t));
            file.load('testload').then(function (o) {
                assert.equal(t.time, o.time);
                done();
            }).finally(function () {
                fs.unlinkSync('saves/testload.json');
            });
        });
    });

    describe('save', function () {
        it('should reject bad filename', function () {
            let exception = null;
            try {
                file.save('../hack', {}).then(function() {
                    assert.fail('should not complete');
                });
            } catch (e) {
                exception = e;
            }
            assert.notEqual(exception, null);
        });

        it('should save file', function (done) {
            const t = { time: new Date().toISOString() };
            file.save('testsave', t).then(function () {
                const f = fs.readFileSync('saves/testsave.json');
                const o = JSON.parse(f);
                assert.equal(o.time, t.time);
                fs.unlinkSync('saves/testsave.json');
                done();
            });
        });
    });
});
