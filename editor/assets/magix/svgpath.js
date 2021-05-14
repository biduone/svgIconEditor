define("assets/magix/svgpath", function(t, e, a) {
    "use strict";
    var h = {
      a: 7,
      c: 6,
      h: 1,
      l: 2,
      m: 2,
      r: 4,
      q: 4,
      s: 4,
      t: 2,
      v: 1,
      z: 0
    }
      , r = [5760, 6158, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287, 12288, 65279];
    function c(t) {
      return 48 <= t && t <= 57
    }
    function s(t) {
      this.index = 0,
      this.path = t,
      this.max = t.length,
      this.result = [],
      this.param = 0,
      this.err = "",
      this.segmentStart = 0,
      this.data = []
    }
    function n(t) {
      for (; t.index < t.max && (10 === (e = t.path.charCodeAt(t.index)) || 13 === e || 8232 === e || 8233 === e || 32 === e || 9 === e || 11 === e || 12 === e || 160 === e || 5760 <= e && 0 <= r.indexOf(e)); )
        t.index++;
      var e
    }
    function o(t) {
      var e = t.path[t.segmentStart]
        , a = e.toLowerCase()
        , r = t.data;
      if ("m" === a && 2 < r.length && (t.result.push([e, r[0], r[1]]),
      r = r.slice(2),
      a = "l",
      e = "m" === e ? "l" : "L"),
      "r" === a)
        t.result.push([e].concat(r));
      else
        for (; r.length >= h[a] && (t.result.push([e].concat(r.splice(0, h[a]))),
        h[a]); )
          ;
    }
    function i(t) {
      var e, a, r, s, i = t.max;
      if (t.segmentStart = t.index,
      function(t) {
        switch (32 | t) {
        case 109:
        case 122:
        case 108:
        case 104:
        case 118:
        case 99:
        case 115:
        case 113:
        case 116:
        case 97:
        case 114:
          return 1
        }
      }(t.path.charCodeAt(t.index)))
        if (a = h[t.path[t.index].toLowerCase()],
        t.index++,
        n(t),
        t.data = [],
        a) {
          for (e = !1; ; ) {
            for (r = a; 0 < r; r--) {
              if (!function(t) {
                var e, a, r = t.index, s = r, i = t.max, h = !1, n = !1, o = !1;
                if (i <= s)
                  t.err = "SvgPath: missed param (at pos " + s + ")";
                else if (c(a = 43 === (a = t.path.charCodeAt(s)) || 45 === a ? ++s < i ? t.path.charCodeAt(s) : 0 : a) || 46 === a) {
                  if (46 !== a) {
                    if (e = 48 === a,
                    s++,
                    a = s < i ? t.path.charCodeAt(s) : 0,
                    e && s < i && a && c(a))
                      return t.err = "SvgPath: numbers started with `0` such as `09` are ilegal (at pos " + r + ")";
                    for (; s < i && c(t.path.charCodeAt(s)); )
                      s++,
                      h = !0;
                    a = s < i ? t.path.charCodeAt(s) : 0
                  }
                  if (46 === a) {
                    for (o = !0,
                    s++; c(t.path.charCodeAt(s)); )
                      s++,
                      n = !0;
                    a = s < i ? t.path.charCodeAt(s) : 0
                  }
                  if (101 === a || 69 === a) {
                    if (o && !h && !n)
                      return t.err = "SvgPath: invalid float exponent (at pos " + s + ")";
                    if (43 !== (a = ++s < i ? t.path.charCodeAt(s) : 0) && 45 !== a || s++,
                    !(s < i && c(t.path.charCodeAt(s))))
                      return t.err = "SvgPath: invalid float exponent (at pos " + s + ")";
                    for (; s < i && c(t.path.charCodeAt(s)); )
                      s++
                  }
                  t.index = s,
                  t.param = parseFloat(t.path.slice(r, s)) + 0
                } else
                  t.err = "SvgPath: param should start with 0..9 or `.` (at pos " + s + ")"
              }(t),
              t.err.length)
                return;
              t.data.push(t.param),
              n(t),
              e = !1,
              t.index < i && 44 === t.path.charCodeAt(t.index) && (t.index++,
              n(t),
              e = !0)
            }
            if (!e) {
              if (t.index >= t.max)
                break;
              if (!(48 <= (s = t.path.charCodeAt(t.index)) && s <= 57 || 43 === s || 45 === s || 46 === s))
                break
            }
          }
          o(t)
        } else
          o(t);
      else
        t.err = "SvgPath: bad command " + t.path[t.index] + " (at pos " + t.index + ")"
    }
    var u = function(t) {
      var e = new s(t)
        , a = e.max;
      for (n(e); e.index < a && !e.err.length; )
        i(e);
      return e.err.length ? e.result = [] : e.result.length && ("mM".indexOf(e.result[0][0]) < 0 ? (e.err = "SvgPath: string should start with `M` or `m`",
      e.result = []) : e.result[0][0] = "M"),
      {
        err: e.err,
        segments: e.result
      }
    };
    function l() {
      if (!(this instanceof l))
        return new l;
      this.queue = [],
      this.cache = null
    }
    l.prototype.matrix = function(t) {
      return 1 === t[0] && 0 === t[1] && 0 === t[2] && 1 === t[3] && 0 === t[4] && 0 === t[5] || (this.cache = null,
      this.queue.push(t)),
      this
    }
    ,
    l.prototype.translate = function(t, e) {
      return 0 === t && 0 === e || (this.cache = null,
      this.queue.push([1, 0, 0, 1, t, e])),
      this
    }
    ,
    l.prototype.scale = function(t, e) {
      return 1 === t && 1 === e || (this.cache = null,
      this.queue.push([t, 0, 0, e, 0, 0])),
      this
    }
    ,
    l.prototype.rotate = function(t, e, a) {
      var r;
      return 0 !== t && (this.translate(e, a),
      r = t * Math.PI / 180,
      t = Math.cos(r),
      r = Math.sin(r),
      this.queue.push([t, r, -r, t, 0, 0]),
      this.cache = null,
      this.translate(-e, -a)),
      this
    }
    ,
    l.prototype.skewX = function(t) {
      return 0 !== t && (this.cache = null,
      this.queue.push([1, 0, Math.tan(t * Math.PI / 180), 1, 0, 0])),
      this
    }
    ,
    l.prototype.skewY = function(t) {
      return 0 !== t && (this.cache = null,
      this.queue.push([1, Math.tan(t * Math.PI / 180), 0, 1, 0, 0])),
      this
    }
    ,
    l.prototype.toArray = function() {
      if (this.cache)
        return this.cache;
      if (!this.queue.length)
        return this.cache = [1, 0, 0, 1, 0, 0],
        this.cache;
      if (this.cache = this.queue[0],
      1 === this.queue.length)
        return this.cache;
      for (var t, e, a = 1; a < this.queue.length; a++)
        this.cache = (t = this.cache,
        e = this.queue[a],
        [t[0] * e[0] + t[2] * e[1], t[1] * e[0] + t[3] * e[1], t[0] * e[2] + t[2] * e[3], t[1] * e[2] + t[3] * e[3], t[0] * e[4] + t[2] * e[5] + t[4], t[1] * e[4] + t[3] * e[5] + t[5]]);
      return this.cache
    }
    ,
    l.prototype.calc = function(t, e, a) {
      var r;
      return this.queue.length ? (this.cache || (this.cache = this.toArray()),
      [t * (r = this.cache)[0] + e * r[2] + (a ? 0 : r[4]), t * r[1] + e * r[3] + (a ? 0 : r[5])]) : [t, e]
    }
    ;
    var f = {
      matrix: !0,
      scale: !0,
      rotate: !0,
      translate: !0,
      skewX: !0,
      skewY: !0
    }
      , p = /\s*(matrix|translate|scale|rotate|skewX|skewY)\s*\(\s*(.+?)\s*\)[\s,]*/
      , d = /[\s,]+/
      , v = l
      , Y = 2 * Math.PI;
    function z(t, e, a, r) {
      var s = t * a + e * r;
      return (s = 1 < s ? 1 : s) < -1 && (s = -1),
      (t * r - e * a < 0 ? -1 : 1) * Math.acos(s)
    }
    function x(t, e, a, r, s, i, h, n, o) {
      var c, u, l = Math.sin(o * Y / 360), f = Math.cos(o * Y / 360), p = -l * (t - a) / 2 + f * (e - r) / 2;
      if (0 == (c = f * (t - a) / 2 + l * (e - r) / 2) && 0 == p)
        return [];
      if (0 === h || 0 === n)
        return [];
      h = Math.abs(h),
      n = Math.abs(n),
      1 < (u = c * c / (h * h) + p * p / (n * n)) && (h *= Math.sqrt(u),
      n *= Math.sqrt(u));
      var d, v, x, g, m, M, _, k = (d = s,
      v = i,
      (r = (M = (x = h) * x) * (_ = (g = n) * g) - M * (t = (i = -(m = l) * ((o = t) - (c = a)) / 2 + (p = f) * ((u = e) - (s = r)) / 2) * i) - _ * (e = (a = p * (o - c) / 2 + m * (u - s) / 2) * a)) < 0 && (r = 0),
      r /= M * t + _ * e,
      d = (r = Math.sqrt(r) * (d === v ? -1 : 1)) * x / g * i,
      c = p * d - m * (r = r * -g / x * a) + (o + c) / 2,
      p = m * d + p * r + (u + s) / 2,
      u = (a - d) / x,
      s = (i - r) / g,
      x = (-a - d) / x,
      r = (-i - r) / g,
      g = z(1, 0, u, s),
      r = z(u, s, x, r),
      0 === v && 0 < r && (r -= Y),
      1 === v && r < 0 && (r += Y),
      [c, p, g, r]), y = [], w = k[2], q = k[3], A = Math.max(Math.ceil(Math.abs(q) / (Y / 4)), 1);
      q /= A;
      for (var C, b, F, S, P, L, X = 0; X < A; X++)
        y.push((C = w,
        b = q,
        L = P = S = F = void 0,
        F = 4 / 3 * Math.tan(b / 4),
        S = Math.cos(C),
        P = Math.sin(C),
        L = Math.cos(C + b),
        b = Math.sin(C + b),
        [S, P, S - P * F, P + S * F, L + b * F, b - L * F, L, b])),
        w += q;
      return y.map(function(t) {
        for (var e = 0; e < t.length; e += 2) {
          var a = t[e + 0]
            , r = t[e + 1]
            , s = f * (a *= h) - l * (r *= n)
            , r = l * a + f * r;
          t[e + 0] = s + k[0],
          t[e + 1] = r + k[1]
        }
        return t
      })
    }
    var g = 1e-10
      , m = Math.PI / 180;
    function M(t, e, a) {
      if (!(this instanceof M))
        return new M(t,e,a);
      this.rx = t,
      this.ry = e,
      this.ax = a
    }
    M.prototype.transform = function(t) {
      var e = Math.cos(this.ax * m)
        , a = Math.sin(this.ax * m)
        , r = [this.rx * (t[0] * e + t[2] * a), this.rx * (t[1] * e + t[3] * a), this.ry * (-t[0] * a + t[2] * e), this.ry * (-t[1] * a + t[3] * e)]
        , s = r[0] * r[0] + r[2] * r[2]
        , i = r[1] * r[1] + r[3] * r[3]
        , a = ((r[0] - r[3]) * (r[0] - r[3]) + (r[2] + r[1]) * (r[2] + r[1])) * ((r[0] + r[3]) * (r[0] + r[3]) + (r[2] - r[1]) * (r[2] - r[1]))
        , t = (s + i) / 2;
      if (a < g * t)
        return this.rx = this.ry = Math.sqrt(t),
        this.ax = 0,
        this;
      e = r[0] * r[1] + r[2] * r[3],
      r = t + (a = Math.sqrt(a)) / 2,
      a = t - a / 2;
      return this.ax = Math.abs(e) < g && Math.abs(r - i) < g ? 90 : 180 * Math.atan(Math.abs(e) > Math.abs(r - i) ? (r - s) / e : e / (r - i)) / Math.PI,
      0 <= this.ax ? (this.rx = Math.sqrt(r),
      this.ry = Math.sqrt(a)) : (this.ax += 90,
      this.rx = Math.sqrt(a),
      this.ry = Math.sqrt(r)),
      this
    }
    ,
    M.prototype.isDegenerate = function() {
      return this.rx < g * this.ry || this.ry < g * this.rx
    }
    ;
    var _ = M;
    function k(t) {
      if (!(this instanceof k))
        return new k(t);
      t = u(t);
      this.segments = t.segments,
      this.err = t.err,
      this.__stack = []
    }
    k.prototype.__matrix = function(c) {
      var u, l = this;
      c.queue.length && this.iterate(function(t, e, a, r) {
        var s, i, h;
        switch (t[0]) {
        case "v":
          i = 0 === (s = c.calc(0, t[1], !0))[0] ? ["v", s[1]] : ["l", s[0], s[1]];
          break;
        case "V":
          i = (s = c.calc(a, t[1], !1))[0] === c.calc(a, r, !1)[0] ? ["V", s[1]] : ["L", s[0], s[1]];
          break;
        case "h":
          i = 0 === (s = c.calc(t[1], 0, !0))[1] ? ["h", s[0]] : ["l", s[0], s[1]];
          break;
        case "H":
          i = (s = c.calc(t[1], r, !1))[1] === c.calc(a, r, !1)[1] ? ["H", s[0]] : ["L", s[0], s[1]];
          break;
        case "a":
        case "A":
          var n = c.toArray()
            , o = _(t[1], t[2], t[3]).transform(n);
          if (n[0] * n[3] - n[1] * n[2] < 0 && (t[5] = t[5] ? "0" : "1"),
          s = c.calc(t[6], t[7], "a" === t[0]),
          "A" === t[0] && t[6] === a && t[7] === r || "a" === t[0] && 0 === t[6] && 0 === t[7]) {
            i = ["a" === t[0] ? "l" : "L", s[0], s[1]];
            break
          }
          i = o.isDegenerate() ? ["a" === t[0] ? "l" : "L", s[0], s[1]] : [t[0], o.rx, o.ry, o.ax, t[4], t[5], s[0], s[1]];
          break;
        case "m":
          h = 0 < e,
          i = ["m", (s = c.calc(t[1], t[2], h))[0], s[1]];
          break;
        default:
          for (i = [o = t[0]],
          h = o.toLowerCase() === o,
          u = 1; u < t.length; u += 2)
            s = c.calc(t[u], t[u + 1], h),
            i.push(s[0], s[1])
        }
        l.segments[e] = i
      }, !0)
    }
    ,
    k.prototype.__evaluateStack = function() {
      var t, e;
      if (this.__stack.length) {
        if (1 === this.__stack.length)
          return this.__matrix(this.__stack[0]),
          void (this.__stack = []);
        for (t = v(),
        e = this.__stack.length; 0 <= --e; )
          t.matrix(this.__stack[e].toArray());
        this.__matrix(t),
        this.__stack = []
      }
    }
    ,
    k.prototype.toString = function() {
      var t, e = [];
      this.__evaluateStack();
      for (var a = 0; a < this.segments.length; a++)
        t = this.segments[a][0],
        t = 0 < a && "m" !== t && "M" !== t && t === this.segments[a - 1][0],
        e = e.concat(t ? this.segments[a].slice(1) : this.segments[a]);
      return e.join(" ").replace(/ ?([achlmqrstvz]) ?/gi, "$1").replace(/ \-/g, "-").replace(/zm/g, "z m")
    }
    ,
    k.prototype.translate = function(t, e) {
      return this.__stack.push(v().translate(t, e || 0)),
      this
    }
    ,
    k.prototype.scale = function(t, e) {
      return this.__stack.push(v().scale(t, e || 0 === e ? e : t)),
      this
    }
    ,
    k.prototype.rotate = function(t, e, a) {
      return this.__stack.push(v().rotate(t, e || 0, a || 0)),
      this
    }
    ,
    k.prototype.skewX = function(t) {
      return this.__stack.push(v().skewX(t)),
      this
    }
    ,
    k.prototype.skewY = function(t) {
      return this.__stack.push(v().skewY(t)),
      this
    }
    ,
    k.prototype.matrix = function(t) {
      return this.__stack.push(v().matrix(t)),
      this
    }
    ,
    k.prototype.transform = function(t) {
      return t.trim() && this.__stack.push((t = t,
      r = new l,
      t.split(p).forEach(function(t) {
        if (t.length)
          if (void 0 === f[t])
            switch (a = t.split(d).map(function(t) {
              return +t || 0
            }),
            e) {
            case "matrix":
              return void (6 === a.length && r.matrix(a));
            case "scale":
              return void (1 === a.length ? r.scale(a[0], a[0]) : 2 === a.length && r.scale(a[0], a[1]));
            case "rotate":
              return void (1 === a.length ? r.rotate(a[0], 0, 0) : 3 === a.length && r.rotate(a[0], a[1], a[2]));
            case "translate":
              return void (1 === a.length ? r.translate(a[0], 0) : 2 === a.length && r.translate(a[0], a[1]));
            case "skewX":
              return void (1 === a.length && r.skewX(a[0]));
            case "skewY":
              return void (1 === a.length && r.skewY(a[0]))
            }
          else
            e = t
      }),
      r)),
      this;
      var e, a, r
    }
    ,
    k.prototype.round = function(r) {
      var e, s = 0, i = 0, h = 0, n = 0;
      return r = r || 0,
      this.__evaluateStack(),
      this.segments.forEach(function(a) {
        var t = a[0].toLowerCase() === a[0];
        switch (a[0]) {
        case "H":
        case "h":
          return t && (a[1] += h),
          h = a[1] - a[1].toFixed(r),
          void (a[1] = +a[1].toFixed(r));
        case "V":
        case "v":
          return t && (a[1] += n),
          n = a[1] - a[1].toFixed(r),
          void (a[1] = +a[1].toFixed(r));
        case "Z":
        case "z":
          return h = s,
          void (n = i);
        case "M":
        case "m":
          return t && (a[1] += h,
          a[2] += n),
          h = a[1] - a[1].toFixed(r),
          n = a[2] - a[2].toFixed(r),
          s = h,
          i = n,
          a[1] = +a[1].toFixed(r),
          void (a[2] = +a[2].toFixed(r));
        case "A":
        case "a":
          return t && (a[6] += h,
          a[7] += n),
          h = a[6] - a[6].toFixed(r),
          n = a[7] - a[7].toFixed(r),
          a[1] = +a[1].toFixed(r),
          a[2] = +a[2].toFixed(r),
          a[3] = +a[3].toFixed(r + 2),
          a[6] = +a[6].toFixed(r),
          void (a[7] = +a[7].toFixed(r));
        default:
          return e = a.length,
          t && (a[e - 2] += h,
          a[e - 1] += n),
          h = a[e - 2] - a[e - 2].toFixed(r),
          n = a[e - 1] - a[e - 1].toFixed(r),
          void a.forEach(function(t, e) {
            e && (a[e] = +a[e].toFixed(r))
          })
        }
      }),
      this
    }
    ,
    k.prototype.iterate = function(s, t) {
      var e, a, r, i = this.segments, h = {}, n = !1, o = 0, c = 0, u = 0, l = 0;
      if (t || this.__evaluateStack(),
      i.forEach(function(t, e) {
        var a = s(t, e, o, c);
        Array.isArray(a) && (h[e] = a,
        n = !0);
        var r = t[0] === t[0].toLowerCase();
        switch (t[0]) {
        case "m":
        case "M":
          return o = t[1] + (r ? o : 0),
          c = t[2] + (r ? c : 0),
          u = o,
          void (l = c);
        case "h":
        case "H":
          return void (o = t[1] + (r ? o : 0));
        case "v":
        case "V":
          return void (c = t[1] + (r ? c : 0));
        case "z":
        case "Z":
          return o = u,
          void (c = l);
        default:
          o = t[t.length - 2] + (r ? o : 0),
          c = t[t.length - 1] + (r ? c : 0)
        }
      }),
      !n)
        return this;
      for (r = [],
      e = 0; e < i.length; e++)
        if (void 0 !== h[e])
          for (a = 0; a < h[e].length; a++)
            r.push(h[e][a]);
        else
          r.push(i[e]);
      return this.segments = r,
      this
    }
    ,
    k.prototype.abs = function() {
      return this.iterate(function(t, e, a, r) {
        var s, i = t[0], h = i.toUpperCase();
        if (i !== h)
          switch (t[0] = h,
          i) {
          case "v":
            return void (t[1] += r);
          case "a":
            return t[6] += a,
            void (t[7] += r);
          default:
            for (s = 1; s < t.length; s++)
              t[s] += s % 2 ? a : r
          }
      }, !0),
      this
    }
    ,
    k.prototype.rel = function() {
      return this.iterate(function(t, e, a, r) {
        var s, i = t[0], h = i.toLowerCase();
        if (i !== h && (0 !== e || "M" !== i))
          switch (t[0] = h,
          i) {
          case "V":
            return void (t[1] -= r);
          case "A":
            return t[6] -= a,
            void (t[7] -= r);
          default:
            for (s = 1; s < t.length; s++)
              t[s] -= s % 2 ? a : r
          }
      }, !0),
      this
    }
    ,
    k.prototype.unarc = function() {
      return this.iterate(function(t, e, a, r) {
        var s, i = [], h = t[0];
        return "A" !== h && "a" !== h ? null : (h = "a" === h ? (s = a + t[6],
        r + t[7]) : (s = t[6],
        t[7]),
        0 === (h = x(a, r, s, h, t[4], t[5], t[1], t[2], t[3])).length ? [["a" === t[0] ? "l" : "L", t[6], t[7]]] : (h.forEach(function(t) {
          i.push(["C", t[2], t[3], t[4], t[5], t[6], t[7]])
        }),
        i))
      }),
      this
    }
    ,
    k.prototype.unshort = function() {
      var n, o, c, u, l, f = this.segments;
      return this.iterate(function(t, e, a, r) {
        var s, i = t[0], h = i.toUpperCase();
        e && ("T" === h ? (s = "t" === i,
        c = f[e - 1],
        o = "Q" === c[0] ? (n = c[1] - a,
        c[2] - r) : "q" === c[0] ? (n = c[1] - c[3],
        c[2] - c[4]) : n = 0,
        u = -n,
        l = -o,
        s || (u += a,
        l += r),
        f[e] = [s ? "q" : "Q", u, l, t[1], t[2]]) : "S" === h && (s = "s" === i,
        c = f[e - 1],
        o = "C" === c[0] ? (n = c[3] - a,
        c[4] - r) : "c" === c[0] ? (n = c[3] - c[5],
        c[4] - c[6]) : n = 0,
        u = -n,
        l = -o,
        s || (u += a,
        l += r),
        f[e] = [s ? "c" : "C", u, l, t[1], t[2], t[3], t[4]]))
      }),
      this
    }
    ,
    a.exports = k
  });
  