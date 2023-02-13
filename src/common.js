let _clockSkew = 0;
module.exports = {
    clockSkew: function clockSkew(millis) {
        _clockSkew = millis;
        console.log('clockSkew: '+millis+'ms');
    },

    time: function time(a) {
        const d = new Date();
        d.setSeconds(d.getSeconds() + (a || 0));
        d.setMilliseconds(d.getMilliseconds() + _clockSkew)
        return d.toISOString();
    },

    until: function until(t, a) {
        const d = (new Date(t) - new Date()) / 1000 + (a || 0);
        return d < 0 ? this.ft(-d) + ' ago' : this.ft(d);
    },

    ft: function ft(sec) {
        if (sec < 100) {
            return Math.round(sec) + 's';
        }
        const min = sec / 60;
        if (min < 100) {
            return Math.round(min) + 'm';
        }
        const hr = min / 60;
        return Math.round(hr) + 'h';
    },

    countPeople: function countPeople(objects, buildings) {
        let people = 0;
        for (let o of objects) {
            people += buildings[o.type].people;
        }
        return people;
    },

    anyTopLeft: function anyTopLeft(r, c, objects) {
        for (let o of objects) {
            if (o.r === r && o.c === c) return o;
        }
        return null;
    },

    anyIntersect: function anyIntersect(r, c, objects) {
        for (let o of objects) {
            if (this.intersect(r, c, o)) return o;
        }
        return null;
    },

    intersect: function intersect(r, c, o) {
        const tr = o.r, br = o.r + o.h - 1, lc = o.c, rc = o.c + o.w - 1;
        return r >= tr && r <= br && c >= lc && c <= rc;
    },

    collides: function collides(obj, objects) {
        const t = obj.r, b = obj.r + obj.h - 1, l = obj.c, r = obj.c + obj.w - 1;
        for (let o of objects) {
            const tt = o.r, bb = o.r + o.h - 1, ll = o.c, rr = o.c + o.w - 1;
            const tc = tt >= t && tt <= b, bc = bb >= t && bb <= b;
            const lc = ll >= l && ll <= r, rc = rr >= l && rr <= r;
            if (tc && (lc || rc)) return o;
            if (bc && (lc || rc)) return o;
        }
        return null;
    },

    inbounds: function inbounds(r, c) {
        return 0 <= r && r < 20 && 0 <= c && c < 40;
    },

    checkResources: function checkResources(res, cost) {
        const lacking = {};
        for (let c in cost) {
            if ((res[c] || 0) - cost[c] < 0) lacking[c] = cost[c] - (res[c] || 0);
        }
        return Object.keys(lacking).length ? lacking : null;
    },

    deductResources: function deductResources(res, cost) {
        const lacking = this.checkResources(res, cost);
        if (!lacking) {
            for (let c in cost) {
                res[c] -= cost[c];
            }
        }
        return lacking;
    },
};