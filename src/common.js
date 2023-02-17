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
        for (let obj of objects)
            if (obj.r === r && obj.c === c) return obj;
        return null;
    },

    anyIntersect: function anyIntersect(r, c, objects) {
        for (let obj of objects)
            if (this.intersect(r, c, obj)) return obj;
        return null;
    },

    intersect: function intersect(r, c, obj) {
        const tr = obj.r, br = obj.r + obj.h - 1, lc = obj.c, rc = obj.c + obj.w - 1;
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

    checkResources: function checkResources(resources, cost) {
        const lacking = {};
        for (let resource in cost)
            if ((resources[resource] || 0) - cost[resource] < 0)
                lacking[resource] = cost[resource] - (resources[resource] || 0);
        return Object.keys(lacking).length ? lacking : null;
    },

    deductResources: function deductResources(resources, cost) {
        const lacking = this.checkResources(resources, cost);
        if (!lacking)
            for (let resource in cost)
                resources[resource] -= cost[resource];
        return lacking;
    },

    creditResources: function creditResources(resources, amt) {
        for (let resource in amt)
            resources[resource] = (resources[resource] || 0) + amt[resource];
    },

    parseQuery: function parseQuery(urlSearch) {
        const query = (urlSearch || '').substring(1);
        if (!query) return {};
        return (urlSearch || '').substring(1).split('&').reduce(function (obj, kv) {
            kv = kv.split('=');
            obj[decodeURIComponent(kv[0])] = kv[1] == null ? null : decodeURIComponent(kv[1]);
            return obj;
        }, {});
    },
};