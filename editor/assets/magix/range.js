define("assets/magix/range", ["magix", "jquery"], function(t, i, s) {
    var o = t("magix")
      , e = t("jquery");
    !function(a, h, i) {
      "use strict";
      function l() {
        return this.init.apply(this, arguments)
      }
      l.prototype = {
        defaults: {
          onstatechange: function() {},
          ondragend: function() {},
          onbarclicked: function() {},
          isRange: !1,
          showLabels: !0,
          showScale: !0,
          step: 1,
          format: "%s",
          theme: "theme-green",
          width: 300,
          disable: !1,
          snap: !1
        },
        template: '<div class="slider-container">      <div class="back-bar">                <div class="selected-bar"></div>                <div class="pointer low"></div><div class="pointer-label low">123456</div>                <div class="pointer high"></div><div class="pointer-label high">456789</div>                <div class="clickable-dummy"></div>            </div>            <div class="scale"></div>    </div>',
        init: function(t, i) {
          this.options = a.extend({}, this.defaults, i),
          this.inputNode = a(t),
          this.options.value = this.inputNode.val() || (this.options.isRange ? this.options.from + "," + this.options.from : "" + this.options.from),
          this.domNode = a(this.template),
          this.domNode.addClass(this.options.theme),
          this.inputNode.after(this.domNode),
          this.domNode.on("change", this.onChange),
          this.pointers = a(".pointer", this.domNode),
          this.lowPointer = this.pointers.first(),
          this.highPointer = this.pointers.last(),
          this.labels = a(".pointer-label", this.domNode),
          this.lowLabel = this.labels.first(),
          this.highLabel = this.labels.last(),
          this.scale = a(".scale", this.domNode),
          this.bar = a(".selected-bar", this.domNode),
          this.clickableBar = this.domNode.find(".clickable-dummy"),
          this.interval = this.options.to - this.options.from,
          this.render()
        },
        render: function() {
          0 !== this.inputNode.width() || this.options.width ? (this.options.width = this.options.width || this.inputNode.width(),
          this.domNode.width(this.options.width),
          this.inputNode.hide(),
          this.isSingle() && (this.lowPointer.hide(),
          this.lowLabel.hide()),
          this.options.showLabels || this.labels.hide(),
          this.attachEvents(),
          this.options.showScale && this.renderScale(),
          this.setValue(this.options.value)) : console.log("jRange : no width found, returning")
        },
        isSingle: function() {
          return "number" == typeof this.options.value || -1 === this.options.value.indexOf(",") && !this.options.isRange
        },
        attachEvents: function() {
          this.clickableBar.click(a.proxy(this.barClicked, this)),
          this.pointers.on("mousedown touchstart", a.proxy(this.onDragStart, this)),
          this.pointers.bind("dragstart", function(t) {
            t.preventDefault()
          })
        },
        onDragStart: function(t) {
          this.options.disable || "mousedown" === t.type && 1 !== t.which || (t.stopPropagation(),
          t.preventDefault(),
          t = a(t.target),
          this.pointers.removeClass("last-active"),
          t.addClass("focused last-active"),
          this[(t.hasClass("low") ? "low" : "high") + "Label"].addClass("focused"),
          a(i).on("mousemove.slider touchmove.slider", a.proxy(this.onDrag, this, t)),
          a(i).on("mouseup.slider touchend.slider touchcancel.slider", a.proxy(this.onDragEnd, this)))
        },
        onDrag: function(t, i) {
          i.stopPropagation(),
          i.preventDefault(),
          i.originalEvent.touches && i.originalEvent.touches.length ? i = i.originalEvent.touches[0] : i.originalEvent.changedTouches && i.originalEvent.changedTouches.length && (i = i.originalEvent.changedTouches[0]);
          i = i.clientX - this.domNode.offset().left;
          this.domNode.trigger("change", [this, t, i])
        },
        onDragEnd: function(t) {
          this.pointers.removeClass("focused").trigger("rangeslideend"),
          this.labels.removeClass("focused"),
          a(i).off(".slider"),
          this.options.ondragend.call(this, this.options.value)
        },
        barClicked: function(t) {
          var i, s, o, e;
          this.options.disable || (i = t.pageX - this.clickableBar.offset().left,
          this.isSingle() ? this.setPosition(this.pointers.last(), i, !0, !0) : (s = Math.abs(parseFloat(this.pointers.first().css("left"), 10)),
          e = this.pointers.first().width() / 2,
          o = Math.abs(parseFloat(this.pointers.last().css("left"), 10)),
          t = this.pointers.first().width() / 2,
          t = (e = Math.abs(s - i + e)) == (t = Math.abs(o - i + t)) ? i < s ? this.pointers.first() : this.pointers.last() : e < t ? this.pointers.first() : this.pointers.last(),
          this.setPosition(t, i, !0, !0)),
          this.options.onbarclicked.call(this, this.options.value))
        },
        onChange: function(t, i, s, o) {
          var e = 0
            , n = i.domNode.width();
          i.isSingle() || (e = s.hasClass("high") ? parseFloat(i.lowPointer.css("left")) + i.lowPointer.width() / 2 : 0,
          n = s.hasClass("low") ? parseFloat(i.highPointer.css("left")) + i.highPointer.width() / 2 : i.domNode.width());
          n = Math.min(Math.max(o, e), n);
          i.setPosition(s, n, !0)
        },
        setPosition: function(t, i, s, o) {
          var e, n = parseFloat(this.lowPointer.css("left")), a = parseFloat(this.highPointer.css("left")) || 0, h = this.highPointer.width() / 2;
          if (s || (i = this.prcToPx(i)),
          this.options.snap) {
            s = this.correctPositionForSnap(i);
            if (-1 === s)
              return;
            i = s
          }
          t[0] === this.highPointer[0] ? a = Math.round(i - h) : n = Math.round(i - h),
          t[o ? "animate" : "css"]({
            left: Math.round(i - h)
          }),
          this.isSingle() ? e = 0 : e = n + h;
          h = Math.round(a + h - e);
          this.bar[o ? "animate" : "css"]({
            width: Math.abs(h),
            left: 0 < h ? e : e + h
          }),
          this.showPointerValue(t, i, o),
          this.isReadonly()
        },
        correctPositionForSnap: function(t) {
          var i = this.positionToValue(t) - this.options.from
            , s = this.options.width / (this.interval / this.options.step)
            , i = i / this.options.step * s;
          return t <= i + s / 2 && i - s / 2 <= t ? i : -1
        },
        setValue: function(t) {
          var i = t.toString().split(",");
          i[0] = Math.min(Math.max(i[0], this.options.from), this.options.to) + "",
          1 < i.length && (i[1] = Math.min(Math.max(i[1], this.options.from), this.options.to) + ""),
          this.options.value = t;
          i = this.valuesToPrc(2 === i.length ? i : [0, i[0]]);
          this.isSingle() || this.setPosition(this.lowPointer, i[0]),
          this.setPosition(this.highPointer, i[1])
        },
        renderScale: function() {
          for (var t = this.options.scale || [this.options.from, this.options.to], i = Math.round(100 / (t.length - 1) * 10) / 10, s = "", o = 0; o < t.length; o++)
            s += '<span style="left: ' + o * i + '%">' + ("|" != t[o] ? "<ins>" + t[o] + "</ins>" : "") + "</span>";
          this.scale.html(s),
          a("ins", this.scale).each(function() {
            a(this).css({
              marginLeft: -a(this).outerWidth() / 2
            })
          })
        },
        getBarWidth: function() {
          var t = this.options.value.split(",");
          return 1 < t.length ? parseFloat(t[1]) - parseFloat(t[0]) : parseFloat(t[0])
        },
        showPointerValue: function(t, i, s) {
          var o = a(".pointer-label", this.domNode)[t.hasClass("low") ? "first" : "last"]()
            , e = this.positionToValue(i);
          n = a.isFunction(this.options.format) ? (n = this.isSingle() ? void 0 : t.hasClass("low") ? "low" : "high",
          this.options.format(e, n)) : this.options.format.replace("%s", e);
          var n = o.html(n).width()
            , i = i - n / 2
            , i = Math.min(Math.max(i, 0), this.options.width - n);
          o[s ? "animate" : "css"]({
            left: i
          }),
          this.setInputValue(t, e)
        },
        valuesToPrc: function(t) {
          return [100 * (parseFloat(t[0]) - parseFloat(this.options.from)) / this.interval, 100 * (parseFloat(t[1]) - parseFloat(this.options.from)) / this.interval]
        },
        prcToPx: function(t) {
          return this.domNode.width() * t / 100
        },
        isDecimal: function() {
          return -1 !== (this.options.value + this.options.from + this.options.to).indexOf(".")
        },
        positionToValue: function(t) {
          t = t / this.domNode.width() * this.interval,
          t = parseFloat(t, 10) + parseFloat(this.options.from, 10);
          if (this.isDecimal()) {
            var i = Math.round(Math.round(t / this.options.step) * this.options.step * 100) / 100;
            if (0 !== i)
              for (-1 === (i = "" + i).indexOf(".") && (i += "."); i.length - i.indexOf(".") < 3; )
                i += "0";
            else
              i = "0.00";
            return i
          }
          return Math.round(t / this.options.step) * this.options.step
        },
        setInputValue: function(t, i) {
          var s;
          this.isSingle() ? this.options.value = i.toString() : (s = this.options.value.split(","),
          t.hasClass("low") ? this.options.value = i + "," + s[1] : this.options.value = s[0] + "," + i),
          this.inputNode.val() !== this.options.value && (this.inputNode.val(this.options.value).trigger("change"),
          this.options.onstatechange.call(this, this.options.value))
        },
        getValue: function() {
          return this.options.value
        },
        getOptions: function() {
          return this.options
        },
        getRange: function() {
          return this.options.from + "," + this.options.to
        },
        isReadonly: function() {
          this.domNode.toggleClass("slider-readonly", this.options.disable)
        },
        disable: function() {
          this.options.disable = !0,
          this.isReadonly()
        },
        enable: function() {
          this.options.disable = !1,
          this.isReadonly()
        },
        toggleDisable: function() {
          this.options.disable = !this.options.disable,
          this.isReadonly()
        },
        updateRange: function(t, i) {
          t = t.toString().split(",");
          this.interval = parseInt(t[1]) - parseInt(t[0]),
          i ? this.setValue(i) : this.setValue(this.getValue())
        }
      };
      var r = "jRange";
      a.fn[r] = function(o) {
        var e, n = arguments;
        return this.each(function() {
          var t = a(this)
            , i = a.data(this, "plugin_" + r)
            , s = "object" == typeof o && o;
          i || (t.data("plugin_" + r, i = new l(this,s)),
          a(h).resize(function() {
            i.setValue(i.getValue())
          })),
          "string" == typeof o && (e = i[o].apply(i, Array.prototype.slice.call(n, 1)))
        }),
        e || this
      }
    }(e, window, document),
    s.exports = o.View.extend({
      ctor: function(t) {
        this.$options = t
      },
      render: function() {
        var i = this
          , t = "#" + i.id
          , s = e(t)
          , t = e.extend({
          from: 16,
          to: 64,
          showLabels: !1,
          showScale: !1,
          step: 8,
          width: 250,
          snap: !0,
          onstatechange: function(t) {
            e("#" + i.id).trigger({
              type: "changeValue",
              value: t
            })
          }
        }, i.$options);
        s.jRange(t)
      }
    })
  });
  