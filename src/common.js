let clockSkewMillis = 0;

module.exports = {
  clockSkew: function clockSkew(millis) {
    clockSkewMillis = millis;
  },

  time: function time(a) {
    const d = new Date();
    d.setSeconds(d.getSeconds() + (a || 0));
    d.setMilliseconds(d.getMilliseconds() + clockSkewMillis);
    return d.toISOString();
  },

  until: function until(t, a) {
    const diff = new Date(t).getTime() - new Date().getTime() + clockSkewMillis;
    const d = Math.round(diff / 1000 + (a || 0));
    return d < 0 ? `${this.ft(-d)} ago` : this.ft(d);
  },

  ft: function ft(sec) {
    const absSec = Math.abs(sec);
    if (absSec < 100) return `${Math.round(sec)}s`;
    if (absSec < 6000) return `${Math.round(sec / 60)}m`;
    return `${Math.round(sec / 60 / 60)}h`;
  },

  countPeople: function countPeople(objects, buildings) {
    return objects.reduce((people, o) => people + buildings[o.type].people, 0);
  },

  anyTopLeft: function anyTopLeft(r, c, objects) {
    return objects.find((obj) => obj.r === r && obj.c === c);
  },

  anyIntersect: function anyIntersect(r, c, objects) {
    const that = this;
    return objects.find((obj) => that.intersect(r, c, obj));
  },

  intersect: function intersect(r, c, obj) {
    const tr = obj.r;
    const br = obj.r + obj.h - 1;
    const lc = obj.c;
    const rc = obj.c + obj.w - 1;
    return r >= tr && r <= br && c >= lc && c <= rc;
  },

  collides: function collides(obj, objects) {
    const t = obj.r;
    const b = obj.r + obj.h - 1;
    const l = obj.c;
    const r = obj.c + obj.w - 1;
    return objects.find((o) => {
      const tt = o.r;
      const bb = o.r + o.h - 1;
      const ll = o.c;
      const rr = o.c + o.w - 1;
      const tc = tt >= t && tt <= b;
      const bc = bb >= t && bb <= b;
      const lc = ll >= l && ll <= r;
      const rc = rr >= l && rr <= r;
      return (tc && (lc || rc)) || (bc && (lc || rc));
    });
  },

  inbounds: function inbounds(r, c, h, w) {
    return r >= 0 && r + (h || 1) <= 20 && c >= 0 && c + (w || 1) <= 40;
  },

  checkResources: function checkResources(resources, cost) {
    const lacking = {};
    Object.keys(cost).forEach((resource) => {
      if ((resources[resource] || 0) - cost[resource] < 0) {
        lacking[resource] = cost[resource] - (resources[resource] || 0);
      }
    });
    return Object.keys(lacking).length ? lacking : null;
  },

  deductResources: function deductResources(resources, cost) {
    const lacking = this.checkResources(resources, cost);
    if (!lacking) {
      Object.keys(cost).forEach((resource) => {
        resources[resource] -= cost[resource];
      });
    }
    return lacking;
  },

  creditResources: function creditResources(resources, amt) {
    Object.keys(amt).forEach((resource) => {
      resources[resource] = (resources[resource] || 0) + amt[resource];
    });
  },

  parseQuery: function parseQuery(urlSearch) {
    const query = (urlSearch || '').substring(1);
    if (!query) return {};
    return (urlSearch || '').substring(1).split('&').reduce((obj, s) => {
      const kv = s.split('=');
      obj[decodeURIComponent(kv[0])] = kv[1] == null ? null : decodeURIComponent(kv[1]);
      return obj;
    }, {});
  },
};
