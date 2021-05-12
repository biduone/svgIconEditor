define("assets/magix/edit_view", ["magix", "assets/magix/helper", "jquery", "assets/magix/colorpicker", "assets/magix/svgpath", "assets/magix/jquery.fileupload"], function (require, t, module) {
    var magix = require("magix")
        , helper = require("assets/magix/helper")
        , jQ = require("jquery")
        , colorPicker = require("assets/magix/colorpicker")
        , svgPath = require("assets/magix/svgpath");
    require("assets/magix/jquery.fileupload");
    var o = helper.HISTORY_COLOR_KEY
        , l = helper.MOST_USE_COLOR;
    module.exports = magix.View.extend({
        tmpl: '<div class="top-title"><div class="icon-title"><span class="name">"{{*name}}"</span> icon</div><span class="divid"></span> <span class="item"><span class="title">**MANAGE_ICON_DOWNLOAD_DIALOG_AUTHOR**\uff1a</span><a href="/user/detail?uid={{creator.id}}" data-spm-click="gostr=/alimama.30;locaid=d214f71f6" vclick-ignore="true" class="link-text">{{creater.nickname}}</a> </span><span class="item"><span class="title">**MANAGE_ICON_DOWNLOAD_DIALOG_UPDATED_AT**\uff1a</span><strong>{{updated_at.split(\'T\')[0]}}</strong></span></div><div class="svg-wrap clearfix"><div class="svg-container"><div class="edit_grid" id="J_edit_grid"></div><div class="icon-container" id="J_icon_container"><span class="iconfont container-reload" title="reload" mx-click="reload()" data-spm-click="gostr=/alimama.30;locaid=d051827c9">&#xe688;</span> {{{show_svg}}}</div></div><div class="svg-manage"><div class="manage-element"><label>画布</label><div class="manage-content manage-vb"><span>宽&nbsp;&nbsp;<input class="input" name="viewWidth" value="{{viewWidth}}" mx-change="setViewBox()" /></span>&nbsp;&nbsp;&nbsp;&nbsp;<span>高&nbsp;&nbsp;<input class="input" name="viewHeight" value="{{viewHeight}}" mx-change="setViewBox()" /></span></div></div><div class="manage-element"><label>**MANAGE_ICON_EDIT_DIALOG_GRID**</label><div class="manage-content"><div mx-view="assets/magix/range" mx-options="{to:96}" mx-changevalue="onChangeSlide()"></div><span id="J_change_value" class="change-value">16</span></div></div><div class="manage-element"><label>**MANAGE_ICON_EDIT_DIALOG_TRANSLATE**</label><div class="manage-content manage-transform"><span title="top" class="iconfont" mx-click="transform(\'top\')" data-spm-click="gostr=/alimama.30;locaid=d5bc66546">&#xe663;</span> <span title="bottom" class="iconfont" mx-click="transform(\'bottom\')" data-spm-click="gostr=/alimama.30;locaid=d4b5e3901">&#xe668;</span> <span title="left" class="iconfont" mx-click="transform(\'left\')" data-spm-click="gostr=/alimama.30;locaid=dddf21788">&#xe661;</span> <span title="right" class="iconfont" mx-click="transform(\'right\')" data-spm-click="gostr=/alimama.30;locaid=d637499e4">&#xe669;</span></div></div><div class="manage-element"><label>**MANAGE_ICON_EDIT_DIALOG_ROTATE**</label><div class="manage-content manage-transform"><span title="Clockwise" mx-click="transform(\'rotateRight\')" data-spm-click="gostr=/alimama.30;locaid=d67bbd548" class="iconfont">&#xe665;</span> <span title="Counterclockwise" mx-click="transform(\'rotateLeft\')" data-spm-click="gostr=/alimama.30;locaid=dfde2d6ff" class="iconfont">&#xe65a;</span></div></div><div class="manage-element"><label>**MANAGE_ICON_EDIT_DIALOG_SCALE**</label><div class="manage-content manage-transform"><span title="enlarge" mx-click="transform(\'scaleUp\')" data-spm-click="gostr=/alimama.30;locaid=dc9fb9ee9" class="iconfont">&#xe667;</span> <span title="narrow" mx-click="transform(\'scaleDown\')" data-spm-click="gostr=/alimama.30;locaid=dcc4aa5e4" class="iconfont">&#xe65d;</span></div></div><div class="manage-element"><div class="block-color-manage"><ul class="color-block-lists clearfix mt20">{{#for(c in mostUseColors)}}<li class="color-block" style="background:#{{*c}};" mx-click="selectColor()" data-spm-click="gostr=/alimama.30;locaid=d02c5e2a5">{{*c}}</li>{{/for}}</ul></div><div class="block-color-manage"><ul class="color-block-lists clearfix histroy">{{#for(c in historyUseColors)}}<li class="color-block" style="background:#{{*c}};" mx-click="selectColor()" data-spm-click="gostr=/alimama.30;locaid=d50f08c6b">{{*c}}</li>{{/for}}</ul><div class="manage-mid-wrap"><span class="color-picker-wrap"><input class="input pick-input" value="{{selectedColor}}" type="text" mx-focusout="changeColor()" mx-keydown="changeColor()"/> <span id="J_color_pick_icon" class="color-picker-item" style="background:#{{selectedColor}}" mx-click="showPicker()" data-spm-click="gostr=/alimama.30;locaid=dba2ea334"></span></span></div></div></div></div></div>{{#if(isProject)}}<div class="content-wrap"><span class="content-item">Unicode(**MANAGE_ICON_EDIT_DIALOG_HEX**)<br><input id="J_edit_dialog_unicode" class="input" type="text" value="{{unicodex}}"/> </span><span class="content-item">Font Class / Symbol<br><input id="J_edit_dialog_fontclass" class="input" type="text" value="{{font_class}}"/></span></div>{{/if}} {{#if(!isProject)}}<div class="content-wrap"><span class="content-item content-item-upload">Icon Name<br><input id="J_edit_dialog_name" class="input" type="text" value="{{name}}"/> </span><span class="content-item content-item-upload">Tags(**MANAGE_ICON_EDIT_DIALOG_SPLIT**)<br><input id="J_edit_dialog_slug" class="input" type="text" value="{{slug}}"/> </span><span class="content-item content-item-upload">Font Class / Symbol<br><input id="J_edit_dialog_fontclass" class="input" type="text" value="{{font_class}}"/></span></div>{{/if}}<div class="line"></div><div class="btn-wrap"><span class="btn btn-normal mr20" mx-click="update()" data-spm-click="gostr=/alimama.30;locaid=d8ac649a8">**MANAGE_ICON_EDIT_DIALOG_SAVE**</span></div>',
        ctor: function (a) {
            this.opts = a
        },
        render: function () {
            var currView = this;
            this.gridSize = 16;
            this.paths = [];
            svgData = currView.opts;
            currView.data = svgData;
            currView.data.tags = currView.data.slug ? currView.data.slug.split(",") : [];
            currView.data.unicodex = parseInt(currView.data.unicode).toString(16);
            currView.data.ctoken = magix.config().ctoken;
            jQ.extend(currView.data, {
                selectedColor: "333333",
                mostUseColors: l,
                historyUseColors: helper.getItem(o) || [],
                isProject: currView.opts.pId && 0 < currView.opts.pId
            });
            currView.data.show_svg = currView.data.show_svg.replace("<svg", "<svg t=" + (new Date).getTime());
            currView.setView().then(function () {
                currView.initGrid(),
                    currView.bind()
            })

        },
        _selectToggleNode: function (a) {
            var t = this.paths || [];
            helper.inArray(t, a) ? (jQ(a).removeClass("selected"),
                helper.findAndRemove(t, a)) : (jQ(a).addClass("selected"),
                    t.push(a)),
                this.paths = t
        },
        _transFormNodes: function (i, a, t) {
            var e = this.paths || [];
            i = arguments[0];
            var o = jQ.makeArray(arguments).slice(1);
            0 === e.length ? jQ("#J_icon_container path").each(function (a, t) {
                var e = jQ(t).attr("d")
                    , s = svgPath(e);
                s[i].apply(s, o),
                    e = s.round(8).toString(),
                    jQ(t).attr("d", e)
            }) : jQ.each(e, function (a, t) {
                var e = jQ(t).attr("d")
                    , s = svgPath(e);
                s[i].apply(s, o),
                    e = s.round(8).toString(),
                    jQ(t).attr("d", e)
            })
        },
        _fixSvg: function (a) {
            return svgPath(a).scale(1, -1).translate(0, helper.ICON_ASCENT).toString()
        },
        _changeSvg: function (a) {
            var t = this
                , e = t.gridSize
                , s = 1024 / e / 3
                , i = 512;
            switch (a) {
                case "left":
                    t._transFormNodes("translate", -s, 0);
                    break;
                case "right":
                    t._transFormNodes("translate", s, 0);
                    break;
                case "top":
                    t._transFormNodes("translate", 0, -s);
                    break;
                case "bottom":
                    t._transFormNodes("translate", 0, s);
                    break;
                case "scaleDown":
                    t._transFormNodes("translate", -i, -i),
                        t._transFormNodes("scale", 1 - 1 / e),
                        t._transFormNodes("translate", i, i);
                    break;
                case "scaleUp":
                    t._transFormNodes("translate", -i, -i),
                        t._transFormNodes("scale", 1 / (1 - 1 / e)),
                        t._transFormNodes("translate", i, i);
                    break;
                case "rotateLeft":
                    t._transFormNodes("translate", -i, -i),
                        t._transFormNodes("rotate", 45),
                        t._transFormNodes("translate", i, i);
                    break;
                case "rotateRight":
                    t._transFormNodes("translate", -i, -i),
                        t._transFormNodes("rotate", -45),
                        t._transFormNodes("translate", i, i)
            }
        },
        bind: function () {
            var e = this;
            jQ("#" + e.id).delegate("path", "click", function (a) {
                a = jQ(a.currentTarget);
                e._selectToggleNode(a[0])
            }),
                jQ("#J_uploader_svg").fileupload({
                    fail: function (a, t) {
                        t = jQ.parseJSON(t.jqXHR.responseText);
                        helper.showGlobalTip(t.message)
                    },
                    add: function (a, t) {
                        if (a.isDefaultPrevented())
                            return !1;
                        if (t.originalFiles[0].name.length && !/(\.|\/)(svg)$/i.test(t.originalFiles[0].name))
                            return helper.showGlobalTip("only accepted svg type"),
                                !1;
                        (t.autoUpload || !1 !== t.autoUpload && jQ(this).fileupload("option", "autoUpload")) && t.process().done(function () {
                            t.submit()
                        })
                    },
                    done: function (a, t) {
                        t = t.result;
                        200 === t.code ? (e.data.show_svg = t.data.show_svg,
                            e.paths = [],
                            e.setView()) : helper.showGlobalTip(t.message)
                    }
                })
        },
        initGrid: function () {
            for (var a = this.gridSize, t = 400 / a, e = [], s = [], i = "", o = 0; o <= a; o++) {
                var n = o * t
                    , l = 0 === o || o === a ? " border" : "";
                e.push('<div class="hLine' + l + '" style="top: ' + n + 'px"></div>'),
                    s.push('<div class="vLine' + l + '" style="left: ' + n + 'px"></div>')
            }
            i += e.join("") + s.join(""),
                jQ("#J_edit_grid").html(i)
        },
        walkPaths: function (e) {
            var a = this.paths || [];
            0 === a.length && (a = jQ("#J_icon_container path").toArray()),
                jQ.each(a, function (a, t) {
                    e && e(t)
                })
        },
        setColor: function (t) {
            var a = this;
            t = t.replace(/<[^>]+>/g, ""),
                /[^0-9a-fA-F]/.test(t) || 6 !== t.length ? helper.showGlobalTip("\u8bf7\u8f93\u51656\u4f4d\u5408\u6cd516\u8fdb\u5236\u8272\u503c\uff01") : (a.walkPaths(function (a) {
                    jQ(a).attr("fill", "#" + t)
                }),
                    a.data.selectedColor = t,
                    -1 === jQ.inArray(t, a.data.historyUseColors) && (a.data.historyUseColors.unshift(t),
                        a.data.historyUseColors = a.data.historyUseColors.slice(0, 8),
                        helper.setItem(o, a.data.historyUseColors)),
                    a.setView())
        },
        "transform<click>": function (a) {
            a = a.params;
            a && this._changeSvg(a)
        },
        "selectColor<click>": function (a) {
            a.preventDefault();
            a = a.current.innerHTML;
            this.setColor(a)
        },
        "changeColor<focusout>": function (a) {
            a.preventDefault();
            a = jQ(a.current).val();
            this.setColor(a)
        },
        "changeColor<keydown>": function (a) {
            13 === a.originalEvent.keyCode && (a = jQ(a.current).val(),
                this.setColor(a))
        },
        "showPicker<click>": function (a) {
            a.preventDefault();
            var t = this
                , a = a.current;
            colorPicker.show(this, {
                ownerNodeId: a.id,
                dock: "right",
                color: t.data.selectedColor,
                picked: function (a) {
                    t.setColor(a.color.replace("#", ""))
                }
            })
        },
        "onChangeSlide<changeValue>": function (a) {
            a = a.value;
            this.gridSize = parseInt(a),
                jQ("#J_change_value").html(a),
                this.initGrid()
        },
        "reload<click>": function (a) {
            this.render()
        },
        "update<click>": function (saveArgs) {
            var thisView = this,
                svgDomStr = jQ("#J_icon_container svg")[0].outerHTML;

            jQ.ajax({
                url: '/svg/save',
                method: 'post',
                data: {
                    fn: thisView.data.id,
                    svgFile: svgDomStr
                },
                complete: function (xhr, a, b, c) {
                    var res = JSON.parse(xhr.responseText);
                    //return helper.showGlobalTip('保存失败');
                    if (res.succ) {
                        setTimeout(function () {
                            renewFontIcon();
                        }, 500)
                        helper.hideDialog();
                    } else {
                        helper.showGlobalTip('保存失败');
                    }
                }
            })
        },

        "setViewBox<change>": function (evt) {
            var prevData = this.data,
                svgDom = jQ("#J_icon_container svg")[0],
                dims = [0, 0, prevData.viewWidth, prevData.viewHeight],
                value = evt.currentTarget.value,
                name = evt.currentTarget.name;

            if (name == "viewWidth") {
                dims[2] = value;
            } else if (name == "viewHeight") {
                dims[3] = value;
            }

            svgDom.setAttribute('viewBox', dims.join(' '));
            prevData[name] = value;
        }
    })
});
