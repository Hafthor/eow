let _clockSkew = 0;
module.exports = {
    clockSkew: function clockSkew(millis) {
        _clockSkew = millis;
    },

    time: function time(a) {
        const d = new Date();
        d.setSeconds(d.getSeconds() + (a || 0));
        d.setMilliseconds(d.getMilliseconds() + _clockSkew)
        return d.toISOString();
    },

    until: function until(t, a) {
        const d = Math.round((new Date(t).getTime() - new Date().getTime() + _clockSkew) / 1000 + (a || 0));
        return d < 0 ? this.ft(-d) + ' ago' : this.ft(d);
    },

    ft: function ft(sec) {
        const absSec = Math.abs(sec);
        if (absSec < 100)
            return Math.round(sec) + 's';
        if (absSec < 6000)
            return Math.round(sec / 60) + 'm';
        return Math.round(sec / 60 / 60) + 'h';
    },

    countPeople: function countPeople(objects, buildings) {
        let people = 0;
        for (let o of objects)
            people += buildings[o.type].people;
        return people;
    },

    anyTopLeft: function anyTopLeft(r, c, objects) {
        for (let o of objects)
            if (o.r === r && o.c === c) return o;
        return null;
    },

    anyIntersect: function anyIntersect(r, c, objects) {
        for (let o of objects)
            if (this.intersect(r, c, o)) return o;
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

    inbounds: function inbounds(r, c, h, w) {
        return 0 <= r && r + (h || 1) <= 20 && 0 <= c && c + (w || 1) <= 40;
    },

    checkResources: function checkResources(res, cost) {
        const lacking = {};
        for (let c in cost)
            if ((res[c] || 0) - cost[c] < 0)
                lacking[c] = cost[c] - (res[c] || 0);
        return Object.keys(lacking).length ? lacking : null;
    },

    deductResources: function deductResources(res, cost) {
        const lacking = this.checkResources(res, cost);
        if (!lacking)
            for (let c in cost)
                res[c] -= cost[c];
        return lacking;
    },

    creditResources: function creditResources(res, amt) {
        for (let c in amt)
            res[c] = (res[c] || 0) + amt[c];
    },

    parseQuery: function parseQuery(urlSearch) {
        const query = (urlSearch || '').substring(1);
        if (!query) return {};
        return (urlSearch || '').substring(1).split('&').reduce(function (o, q) {
            const qq = q.split('=');
            o[decodeURIComponent(qq[0])] = qq[1] == null ? null : decodeURIComponent(qq[1]);
            return o;
        }, {});
    },
};