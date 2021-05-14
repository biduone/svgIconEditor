define("assets/magix/tmpl", ["jquery"], function (jQ, e, t) {
  var fakeJQ, r, a, o, p, i, c, l, jQ = jQ("jquery");
  function _(n) {
    return "\\" + c[n]
  }
  function s(n) {
    return r[n]
  }
  p = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  },
    i = /(.)^/,
    c = {
      "'": "'",
      "\\": "\\",
      "\r": "r",
      "\n": "n",
      "\u2028": "u2028",
      "\u2029": "u2029"
    },
    l = /\\|'|\r|\n|\u2028|\u2029/g,
    (fakeJQ = jQ).keys = function (n) {
      var e, t = [];
      for (e in n)
        n.hasOwnProperty(e) && t.push(e);
      return t
    }
    ,
    fakeJQ.escape = (r = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "`": "&#x60;"
    },
      jQ = "(?:" + fakeJQ.keys(r).join("|") + ")",
      a = RegExp(jQ),
      o = RegExp(jQ, "g"),
      function (n) {
        return n = null == n ? "" : "" + n,
          a.test(n) ? n.replace(o, s) : n
      }
    ),
    fakeJQ.tmpl = function (a, n, e) {
      n = (n = !n && e ? e : n) || {},
        n = fakeJQ.extend(n, p);
      var t, r = RegExp([(n.escape || i).source, (n.interpolate || i).source, (n.evaluate || i).source].join("|") + "|$", "g"), o = 0, c = "__p+='";
      a.replace(r, function (n, e, t, r, u) {
        return c += a.slice(o, u).replace(l, _),
          o = u + n.length,
          e ? c += "'+\n((__t=(" + e + "))==null?'':$.escape(__t))+\n'" : t ? c += "'+\n((__t=(" + t + "))==null?'':__t)+\n'" : r && (c += "';\n" + r + "\n__p+='"),
          n
      }),
        c += "';\n",
        c = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + (c = !n.variable ? "with(obj||{}){\n" + c + "}\n" : c) + "return __p;\n";
      try {
        t = new Function(n.variable || "obj", "$", c)
      } catch (n) {
        throw n.source = c,
        n
      }
      e = function (n) {
        return t.call(this, n, fakeJQ)
      }
        ,
        r = n.variable || "obj";
      return e.source = "function(" + r + "){\n" + c + "}",
        e
    }
});
