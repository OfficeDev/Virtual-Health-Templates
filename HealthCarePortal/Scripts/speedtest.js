var ThirdParty;
(function (n) {
    function i(t) {
        return n._d.getElementById(t)
    }

    function r(n, t, i) {
        return setTimeout(n, t, i)
    }

    function u(n) {
        clearTimeout(n)
    }

    function f() {
        return (new Date).getTime()
    }
    n._w = window;
    n._d = document;
    n.sb_de = n._d.documentElement;
    n._ge = i;
    n.sb_st = r;
    n.sb_ct = u;
    n.sb_gt = f;
    var t = n._w;
    t._w = n._w;
    t._d = n._d;
    t.sb_de = n.sb_de;
    t._ge = i;
    t.sb_st = r;
    t.sb_ct = u;
    t.sb_gt = f;
    (typeof n._w.console == "undefined" || typeof n._w.console.log == "undefined") && (n._w.console = {
        log: function () { }
    })
})(ThirdParty || (ThirdParty = {})),
function (n) {
    function t(n, t, i) {
        n.addEventListener ? n.addEventListener(t, i, !1) : n.attachEvent ? n.attachEvent("on" + t, i) : n["on" + t] = i
    }

    function i(n, t, i) {
        n.removeEventListener ? n.removeEventListener(t, i, !1) : n.detachEvent ? n.detachEvent("on" + t, i) : n["on" + t] = null
    }
    n.bindEvent = t;
    n.unbindEvent = i
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function e(n) {
        return o[n] || (o[n] = [])
    }

    function y(n, t) {
        for (var r = e(n), i = 0; i < r.length; i++) r[i](n, t)
    }

    function s(n, t) {
        if (f) try {
            f(n, t)
        } catch (i) { }
    }

    function h(n) {
        var t, u, i;
        if (n && n.data && typeof n.data == "string" && (t = n.data.indexOf(":"), t !== -1) && (u = n.data.substring(0, t), u === "ThirdParty") && (i = n.data.indexOf(":", t + 1), i !== -1)) {
            s(!0, n.data);
            var f = n.data.substring(t + 1, i),
  				e = n.data.substring(i + 1),
  				r = null;
            try {
                r = JSON.parse(e)
            } catch (o) { }
            r !== null && y(f, r)
        }
    }

    function c() {
        if (!i) {
            i = !0;
            for (var n = 0; n < t.length; ++n) r.postMessage(t[n], "*");
            t = []
        }
    }

    function p(t) {
        var i = !1;
        try {
            i = t === top
        } catch (f) { }
        u = !i && !!window.postMessage && r && !!r.postMessage;
        n.bindEvent(window, "message", h);
        a("Ready", c);
        l("Ready", 0, !1, !0)
    }

    function w() {
        n.unbindEvent(window, "message", h);
        v("Ready", c);
        u = !1;
        i = !1;
        t = []
    }

    function b(n) {
        f = n
    }

    function l(n, f, e, o) {
        var c, h;
        (typeof f == "undefined" && (f = {}), c = JSON.stringify(f), e && typeof f == "string" && (c = f), h = ["ThirdParty:", n, ":", c].join(""), s(!1, h), u) && (i || o ? (r.postMessage(h, "*"), i || t.push(h)) : t.push(h))
    }

    function a(n, t) {
        var i = e(n);
        i.push(t)
    }

    function v(n, t) {
        for (var r = e(n), i = 0; i < r.length; i++)
            if (r[i] == t) {
                r.splice(i, 1);
                break
            }
    }
    var r = window.parent,
  		u = !1,
  		i = !1,
  		t = [],
  		o = {},
  		f = null;
    n.initializeMessaging = p;
    n.uninitializeMessaging = w;
    n.setMessageLogger = b;
    n.sendMessage = l;
    n.subscribeToMessage = a;
    n.unsubscribeFromMessage = v
}(ThirdParty || (ThirdParty = {})),
function (n) {
    n.initializeMessaging(n._w)
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function t(t) {
        n.sendMessage("Error", t || "", !0)
    }

    function i(t) {
        for (var r = [], i = 1; i < arguments.length; i++) r[i - 1] = arguments[i];
        n.sendMessage("ErrorEx", {
            error: t,
            extra: r
        })
    }

    function r(t, i, r) {
        n.sendMessage("Click", {
            name: t,
            title: i,
            url: r
        })
    }

    function u(t, i, r) {
        n.sendMessage("SoftClick", {
            name: t,
            title: i,
            url: r
        })
    }

    function f(t) {
        for (var r = [], i = 1; i < arguments.length; i++) r[i - 1] = arguments[i];
        n.sendMessage("Load", {
            name: t,
            extra: r
        })
    }

    function e(t, i) {
        n.sendMessage("Show", {
            name: t,
            count: i
        })
    }

    function o(t, i) {
        n.sendMessage("Hide", {
            name: t,
            count: i
        })
    }

    function s(t, i) {
        n.sendMessage("Visible", {
            name: t,
            method: i
        })
    }

    function h(t, i, r, u) {
        n.sendMessage("Hover", {
            name: t,
            target: i,
            hoverType: r,
            count: u
        })
    }
    n.logError = t;
    n.logErrorEx = i;
    n.logClick = r;
    n.logSoftClick = u;
    n.logLoad = f;
    n.logShow = e;
    n.logHide = o;
    n.logVisible = s;
    n.logHover = h
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function i(n) {
        t = n
    }

    function r() {
        return t
    }

    function u(t) {
        var u = null,
  			i = null;
        return u = typeof t == "string" ? t : t && t.message || window && window.event && window.event.errorMessage || "unknown error", typeof t != "string" && t.error && t.error.stack && (i = t.error.stack), i === null && window && window.event && window.event.error && window.event.error.stack && (i = window.event.error.stack), i !== null ? n.logErrorEx(u, "Stack", i.replace(/\n\s*/g, " ")) : n.logError(u), r() ? (t.preventDefault(), !0) : void 0
    }

    function f() {
        n.bindEvent(window, "error", u)
    }
    var t = !1;
    n.setErrorSuppression = i;
    f()
}(ThirdParty || (ThirdParty = {})),
function (n) {
    n.setErrorSuppression(!0)
}(ThirdParty || (ThirdParty = {}));

var ThirdParty;
(function (n) {
    n.sendMessage("Render", {})
})(ThirdParty || (ThirdParty = {})),
function (n) {
    var t = function (n) {
        var t = arguments;
        return function () {
            n.apply(null, [].slice.apply(t).slice(1))
        }
    },
  		i = new function () {
  		    function u(n) {
  		        return i[n] || (i[n] = [])
  		    }
  		    var i = {},
  				r = this;
  		    r.fire = function (i) {
  		        for (var r = u(i), e = r.e = arguments, f = 0; f < r.length; f++) r[f].d ? n.sb_st(t(r[f], e), r[f].d) : r[f](e)
  		    };
  		    r.bind = function (n, t, i, r) {
  		        var f = u(n);
  		        t.d = r;
  		        f.push(t);
  		        i && f.e && t(f.e)
  		    };
  		    r.unbind = function (n, t) {
  		        for (var r = 0, u = i[n]; u && r < u.length; r++)
  		            if (u[r] == t) {
  		                u.splice(r, 1);
  		                break
  		            }
  		    }
  		};
    n.customEvents = i
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function u(n, t) {
        var i, f, u;
        if (t in n) return t;
        for (t = t.charAt(0).toUpperCase() + t.slice(1), i = 0, f = r.length; i < f; ++i)
            if (u = r[i] + t, u in n) return u
    }

    function t(n) {        
        return n && n.preventDefault(), !1
    }

    function f() {
        if (n.bindEvent(window, "touchmove", t), n.bindEvent(window, "dragstart", t), n.bindEvent(document, "selectstart", t), i) {
            var r = document.documentElement.style,
  				u = r[i];
            r[i] = "none"
        }
        return function () {
            n.unbindEvent(window, "touchmove", t);
            n.unbindEvent(window, "dragstart", t);
            n.unbindEvent(document, "selectstart", t);
            i && (r[i] = u)
        }
    }
    var r = ["webkit", "ms", "moz", "Moz", "o", "O"],
  		i = u(document.documentElement.style, "userSelect");
    n.dragSuppress = f
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function i(i) {
        for (var e = i.target, u = null, r = e, o; r != null;) {
            if (u = r.getAttribute("data-inst-name"), !!u) break;
            r = r.parentElement
        }
        if (o = e.getAttribute("data-nav-href"), u && r != null || o && (u = "navlink", r = e), !!u && r != null) {
            var s = r.getAttribute("data-inst-title"),
  				h = r.getAttribute("data-inst-soft") === "1",
  				f = o || r.getAttribute("data-nav-href") || r.getAttribute("href");
            f && f.indexOf("javascript:") === 0 && (f = null);
            h ? n.logSoftClick(u, s, f) : n.logClick(u, s, f);
            t = f
        }
    }

    function r() {
        n.bindEvent(n._w, "mousedown", i)
    }

    function u() {
        return t
    }
    var t;
    n.autoClickHandler = i;
    n.setupAutoClickHandler = r;
    n.getDestinationUrl = u
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function t(t, i) {
        n.sendMessage("Resize", {
            width: t,
            height: i
        })
    }

    function i() {
        n.sendMessage("ScrollTop", {})
    }
    n.resizeFrame = t;
    n.scrollTop = i
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function i(n) {
        return "textContent" in n ? n.textContent : n.innerText
    }

    function r(n, t) {
        "textContent" in n ? n.textContent = t : n.innerText = t
    }

    function u(n) {
        return document.getElementById(n)
    }

    function f(n) {
        for (var i = [], t = 1; t < arguments.length; t++) i[t - 1] = arguments[t];
        return n.replace(/\{([0-9]+)\}/g, function (n, t) {
            var r = parseInt(t);
            return r >= 0 && r < i.length ? i[r] : ""
        })
    }

    function e(i) {
        var u = document.body,
  			r = u.offsetHeight;
        t !== r && (t = r, n.resizeFrame(null, r), i && n.scrollTop())
    }

    function o(i) {
        var u = document.body,
  			r = u.offsetHeight;
        r != i && (t = r, n.resizeFrame(null, r), n.logLoad("InitialResize"))
    }

    function s(t) {
        n.ready(function () {
            return o(t)
        })
    }

    function h() {
        return function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (n) {
                window.setTimeout(n, 1e3 / 60)
            }
        }()
    }
    n.getText = i;
    n.setText = r;
    n.ge = u;
    n.formatString = f;
    var t = 0;
    n.resizeToFitContent = e;
    n.resizeOnLoad = s;
    n.requestAnimationFrame = h
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function t(t) {
        for (var r = [], i = 1; i < arguments.length; i++) r[i - 1] = arguments[i];
        n.sendMessage("FireEvent", {
            name: t,
            args: r
        })
    }

    function i(t, i) {
        n.sendMessage("Activate", {
            id: t,
            method: i
        })
    }

    function r(t, i) {
        n.sendMessage("Activate", {
            query: t,
            method: i
        })
    }

    function u(t) {
        n.sendMessage("Focus", {
            id: t
        })
    }

    function f(t) {
        n.sendMessage("Blur", {
            id: t
        })
    }

    function e(t) {
        n.sendMessage("Focus", {
            query: t
        })
    }

    function o(t) {
        n.sendMessage("Blur", {
            query: t
        })
    }

    function s(t) {
        for (var r = [], i = 1; i < arguments.length; i++) r[i - 1] = arguments[i];
        n.sendMessage("Terminate", {
            error: t,
            extra: r
        })
    }
    n.interopFireEvent = t;
    n.interopActivate = i;
    n.interopActivateQuerySelector = r;
    n.interopFocusElement = u;
    n.interopBlurElement = f;
    n.interopFocusElementQuerySelector = e;
    n.interopBlurElementQuerySelector = o;
    n.interopTerminate = s
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function t(t, i) {
        n.sendMessage("Popover", {
            title: t,
            lines: i
        })
    }
    n.showFullscreenPopover = t
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function t() {
        n.sendMessage("ToggleFullscreen", {})
    }
    n.toggleFullscreen = t
}(ThirdParty || (ThirdParty = {})),
function (n) {
    n.logLoad("Load")
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function u(n, u) {
        var f = n.parentElement;
        u ? f.className.indexOf(t) >= 0 && (f.className = f.className.replace(t, "").replace(i, "").replace(r, " ")) : f.className.indexOf(t) < 0 && (f.className = f.className + " " + t)
    }
    var i = /^\s+|\s+$/g,
  		r = /  /g,
  		t = "has-error";
    n.setInputErrorStatus = u
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function i(n, i) {
        if (n && t(n)) {
            var r = " " + t(n) + " ";
            return r.indexOf(" " + i + " ") !== -1
        }
        return !1
    }

    function u(n, r) {
        if (n && !i(n, r)) {
            var u = n.className.length > 0 && n.className[n.className.length - 1] === " ";
            e(n, t(n) + (u ? "" : " ") + r)
        }
    }

    function f(n, r) {
        if (i(n, r)) {
            var u = new RegExp("(\\s|^)" + r + "(\\s|$)", "g"),
  				f = t(n).replace(u, " ");
            e(n, f)
        }
    }

    function o(n, t) {
        i(n, t) ? f(n, t) : u(n, t)
    }

    function s(n) {
        u(n, r)
    }

    function h(n) {
        f(n, r)
    }

    function c(n) {
        o(n, r)
    }

    function t(n) {
        return typeof n.className == "string" ? n.className : n.getAttribute("class")
    }

    function e(n, t) {
        typeof n.className == "string" ? n.className = t : n.setAttribute("class", t)
    }
    var r = "hidden";
    n.hasClass = i;
    n.addClass = u;
    n.removeClass = f;
    n.toggleClass = o;
    n.hide = s;
    n.show = h;
    n.toggleVisibility = c;
    n.getClassName = t;
    n.setClassName = e
}(ThirdParty || (ThirdParty = {})),
function (n) {
    var t = function () {
        function n(n, t, i) {
            var r = this;
            this.action = i;
            this.maxCount = t;
            this.currentCount = 0;
            clearInterval(this.interval);
            this.interval = setInterval(function () {
                return r.repeate()
            }, n)
        }
        return n.prototype.repeate = function () {
            if (this.currentCount++, this.currentCount >= this.maxCount) {
                clearInterval(this.interval);
                return
            }
            if (this.action) {
                var n = this.action();
                n && clearInterval(this.interval)
            }
        }, n
    }();
    n.RepetitiveAction = t
}(ThirdParty || (ThirdParty = {})),
function (n) {
    var t = function () {
        function t(t, i) {
            var r = this;
            this.activeClass = "active";
            this.hideContentClass = "hidden";
            this.handler = null;
            n.bindEvent(t, "click", function () {
                return r.handleClick()
            });
            this.tabControl = i;
            this.element = t;
            this.boundElement = this.getCorrespondingElement(t)
        }
        return t.prototype.setHandler = function (n) {
            this.handler = n
        }, t.prototype.activate = function () {
            this.element == null || n.hasClass(this.boundElement, this.activeClass) || n.addClass(this.element, this.activeClass);
            this.boundElement != null && n.removeClass(this.boundElement, this.hideContentClass)
        }, t.prototype.deactivate = function () {
            this.element != null && n.removeClass(this.element, this.activeClass);
            this.boundElement == null || n.hasClass(this.boundElement, this.hideContentClass) || n.addClass(this.boundElement, this.hideContentClass)
        }, t.prototype.isActive = function () {
            return n.hasClass(this.element, this.activeClass)
        }, t.prototype.isElement = function (n) {
            return n == this.element
        }, t.prototype.getBoundElement = function () {
            return this.boundElement
        }, t.prototype.handleClick = function () {
            var n = !0;
            this.handler != null && (n = this.handler());
            n && this.tabControl.selectTab(this)
        }, t.prototype.getCorrespondingElement = function (n) {
            var i = n.firstElementChild,
                t;
            return i == null ? null : (t = i.getAttribute("content"), t == null) ? null : document.querySelector(t)
        }, t
    }(),
  		i;
    n.Tab = t;
    i = function () {
        function n(n) {
            var r, u, i;
            if (this.updateHandler = null, this.activeTab = null, this.tabs = [], r = n.getElementsByTagName("li"), r.length != 0) {
                for (u = 0; u < r.length; u++) i = new t(r[u], this), i.isActive() ? (this.activeTab = i, i.activate()) : i.deactivate(), this.tabs.push(i);
                this.activeTab == null && this.selectTab(this.tabs[0])
            }
        }
        return n.prototype.selectTab = function (n) {
            this.activeTab != n && (this.activeTab && this.activeTab.deactivate(), n.activate(), this.activeTab = n, this.updateHandler && this.updateHandler())
        }, n.prototype.setUpdateHandler = function (n) {
            this.updateHandler = n
        }, n.prototype.getTabByIndex = function (n) {
            return this.tabs[n]
        }, n.prototype.getTabByElement = function (n) {
            for (var t = 0; t < this.tabs.length; t++)
                if (this.tabs[t].isElement(n)) return this.tabs[t];
            return null
        }, n.prototype.getTabByBoundElement = function (n) {
            for (var t = 0; t < this.tabs.length; t++)
                if (this.tabs[t].getBoundElement() === n) return this.tabs[t];
            return null
        }, n
    }();
    n.TabControl = i
}(ThirdParty || (ThirdParty = {})),
function (n) {
    var t = function () {
        function t(t) {
            var u = this,
  				i, r;
            this.handler = null;
            this.updateHandler = null;
            this.onExpandHandler = null;
            this.onCollapseHandler = null;
            this.button = null;
            this.content = null;
            this.toggleContent = null;
            this.openedClass = "open";
            this.instTitleAttribute = "data-inst-expansion-title";
            this.instNameExpand = "expand";
            this.instNameCollapse = "collapse";
            this.instrumentationTitle = null;
            this.button = t;
            this.expanded = n.hasClass(this.button, this.openedClass);
            i = t.getAttribute("data-for");
            r = t.getAttribute("data-for-toggle");
            i && (this.content = n.ge(i), this.content && (r && (this.toggleContent = n.ge(r)), this.toggleContent && n.hide(this.toggleContent)));
            this.instrumentationTitle = this.button.getAttribute(this.instTitleAttribute);
            n.bindEvent(t, "click", function () {
                return u.handleClick()
            })
        }
        return t.prototype.getContent = function () {
            return this.content
        }, t.prototype.getHiddenContent = function () {
            return this.toggleContent
        }, t.prototype.isExpanded = function () {
            return this.expanded
        }, t.prototype.setHandler = function (n) {
            this.handler = n
        }, t.prototype.setUpdateHandler = function (n) {
            this.updateHandler = n
        }, t.prototype.setOnExpand = function (n) {
            this.onExpandHandler = n
        }, t.prototype.setOnCollapse = function (n) {
            this.onCollapseHandler = n
        }, t.prototype.handleClick = function () {
            var n = !0;
            this.handler != null && (n = this.handler());
            n && this.toggle()
        }, t.prototype.instrumentToggle = function () {
            if (this.instrumentationTitle) {
                var t = this.expanded ? this.instNameCollapse : this.instNameExpand;
                n.logClick(t, this.instrumentationTitle, null)
            }
        }, t.prototype.toggle = function () {
            this.instrumentToggle();
            this.expanded = !this.expanded;
            n.toggleClass(this.button, this.openedClass);
            n.toggleVisibility(this.content);
            this.expanded && this.onExpandHandler ? this.onExpandHandler() : !this.expanded && this.onCollapseHandler && this.onCollapseHandler();
            this.toggleContent && n.toggleVisibility(this.toggleContent);
            this.updateHandler && this.updateHandler()
        }, t
    }();
    n.Expansion = t
}(ThirdParty || (ThirdParty = {})),
function (n) {
    var t = function () {
        function t(t, i) {
            var r = this;
            this.expandedIconOpenedClass = "opened";
            this.animatedClass = "expandoAnimated";
            this.animationDurationInSeconds = .2;
            this.handler = null;
            this.updateHandler = null;
            this.onExpandHandler = null;
            this.onCollapseHandler = null;
            n.bindEvent(t, "mousedown", function () {
                return r.handleClick()
            });
            this.expando = t;
            this.boundItem = i;
            this.isExpanded = n.hasClass(this.expando, this.expandedIconOpenedClass);
            n.hasClass(this.boundItem, this.animatedClass) || n.addClass(this.boundItem, this.animatedClass)
        }
        return t.prototype.setHandler = function (n) {
            this.handler = n
        }, t.prototype.setUpdateHandler = function (n) {
            this.updateHandler = n
        }, t.prototype.setOnExpand = function (n) {
            this.onExpandHandler = n
        }, t.prototype.setOnCollapse = function (n) {
            this.onCollapseHandler = n
        }, t.prototype.getBoundElement = function () {
            return this.boundItem
        }, t.prototype.expand = function () {
            var t, i;
            this.expando != null && (n.hasClass(this.expando, this.expandedIconOpenedClass) || n.addClass(this.expando, this.expandedIconOpenedClass));
            n.hasClass(this.boundItem, this.animatedClass) && n.removeClass(this.boundItem, this.animatedClass);
            t = this.boundItem.style.height;
            this.boundItem.style.height = "auto";
            i = Math.max(this.boundItem.offsetHeight, this.boundItem.clientHeight) + "px";
            this.onExpandHandler && this.onExpandHandler();
            this.updateHandler && this.updateHandler();
            this.boundItem.style.height = t;
            this.boundItem.offsetHeight;
            n.hasClass(this.boundItem, this.animatedClass) || n.addClass(this.boundItem, this.animatedClass);
            this.boundItem.style.height = i.toString();
            this.isExpanded = !0
        }, t.prototype.collapse = function () {
            this.expando != null && n.removeClass(this.expando, this.expandedIconOpenedClass);
            this.boundItem.style.height = Math.max(this.boundItem.offsetHeight, this.boundItem.clientHeight).toString() + "px";
            this.boundItem.offsetHeight;
            this.boundItem.style.height = "0";
            this.isExpanded = !1;
            this.onCollapseHandler && this.onCollapseHandler();
            setTimeout(this.updateHandler, this.animationDurationInSeconds * 1e3 + 50)
        }, t.prototype.handleClick = function () {
            var n = !0;
            this.handler != null && (n = this.handler());
            n && this.switchState()
        }, t.prototype.switchState = function () {
            this.isExpanded ? this.collapse() : this.expand()
        }, t
    }();
    n.Expando = t
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function i(n, t, i) {
        var r = new XDomainRequest;
        r.open("GET", n);
        r.onload = function () {
            try {
                r.responseText && t(r.responseText)
            } catch (n) {
                typeof n != "string" && (n = n.toString());
                i(n)
            }
        };
        r.onerror = function () {
            i("unknown xdr error: " + r.responseText)
        };
        r.send()
    }

    function t(n, t, r, u, f) {
        var e = new XMLHttpRequest;
        if (e.open("GET", n, !0), u) {
            if (!("withCredentials" in e) && "XDomainRequest" in window) {
                i(n, t, r);
                return
            }
            e.withCredentials = !0
        }
        e.onreadystatechange = function () {
            if (e.readyState === 4 && e.status === 200) try {
                e.responseText && t(e.responseText)
            } catch (n) {
                typeof n != "string" && (n = n.toString());
                r(n)
            } else e.readyState === 4 ? r("unknown error: " + e.status.toString()) : e.readyState === 3 && f != null && f(e)
        };
        e.send()
    }

    function r(n, i, r, u) {
        t(n, function (n) {
            return i(JSON.parse(n))
        }, r, u)
    }

    function u(n, t, i, r, u) {
        var f = new XMLHttpRequest;
        f.open("POST", n, !0);
        f.setRequestHeader("Content-type", u);
        f.onreadystatechange = function () {
            if (f.readyState == 4 && f.status == 200) try {
                f.responseText && i(f.responseText)
            } catch (n) {
                typeof n != "string" && (n = n.toString());
                r(n)
            } else f.readyState == 4 && r("unknown error: " + f.status.toString())
        };
        f.send(t)
    }
    n.callAjax = t;
    n.callJson = r;
    n.doPost = u
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function t(t) {
        if (n._d.readyState === "complete") n.sb_st(t, 1);
        else {
            var r = null,
  				i = function () {
  				    n._d.addEventListener ? (n._d.removeEventListener("DOMContentLoaded", i, !1), n._w.removeEventListener("load", i, !1)) : n._d.attachEvent && (n._d.detachEvent("onreadystatechange", r), n._w.detachEvent("onload", i));
  				    t()
  				};
            r = function () {
                document.readyState === "complete" && i()
            };
            n._d.addEventListener ? (n._d.addEventListener("DOMContentLoaded", i, !1), n._w.addEventListener("load", i, !1)) : n._d.attachEvent ? (n._d.attachEvent("onreadystatechange", r), n._w.attachEvent("onload", i)) : t()
        }
    }
    n.ready = t
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function t(t, i) {
        n.sendMessage("Navigate", {
            url: t,
            reason: i
        })
    }

    function i(t, i, r) {
        n.sendMessage("AppendHashParameter", {
            key: t,
            value: i,
            reason: r
        })
    }
    n.navigate = t;
    n.appendHashParameter = i
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function i(n) {
        for (var t = n; t && t.tagName && t.tagName.toLowerCase() !== "body";) {
            if (t.tagName.toLowerCase() === "a") return t;
            t = t.parentElement
        }
        return null
    }

    function t(t) {
        var f, r, u;
        if (!t || !t.target || (f = t.target, r = i(f), !r)) return !0;
        if (u = null, u = r.getAttribute("data-nav-href"), !u) {
            if (!r.href || r.href.indexOf("javascript:") === 0 || r.href.indexOf("#") >= 0) return !0;
            u = r.href
        }
        return n.navigate(u, "autoclick"), t.preventDefault(), !1
    }

    function r() {
       // document.onclick = t
    }   
    n.autoNavigationClickHandler = t;
    n.setupAutoNavigation = r
}(ThirdParty || (ThirdParty = {})),
function (n) {
    var t = function () {
        function t() { }
        return t.getTimezone = function () {
            var t = new Date,
  				n;
            return n = this.isDst() ? this.dstUtcOffsetToTimezoneMap[t.getTimezoneOffset().toString()] : this.stdUtcOffsetToTimezoneMap[t.getTimezoneOffset().toString()], n == null ? "" : " " + n
        }, t.stdTimezoneOffset = function () {
            var n = new Date,
  				t = new Date(n.getFullYear(), 0, 1),
  				i = new Date(n.getFullYear(), 6, 1);
            return Math.max(t.getTimezoneOffset(), i.getTimezoneOffset())
        }, t.isDst = function () {
            if (this.isDaylightSavings == null) {
                var n = new Date;
                this.isDaylightSavings = n.getTimezoneOffset() < this.stdTimezoneOffset()
            }
            return this.isDaylightSavings
        }, t.convertDateTimes = function () {
            var r = document.querySelectorAll("[data-date-ticks]"),
  				u;
            if (r && r.length !== 0)
                for (u = 0; u < r.length; u++) {
                    var i = r[u],
  						f = i.getAttribute("data-date-ticks"),
  						o = i.getAttribute("data-date-formatted"),
  						s = i.getAttribute("data-date-format");
                    if (f && f.length !== 0 && o !== "1") {
                        var h = t.chooseFormatFunction(s),
  							c = new Date(parseInt(f)),
  							e = h(c);
                        (e || e.length !== 0) && (n.setText(i, e), i.setAttribute("data-date-formatted", "1"))
                    }
                }
        }, t.getDateTime = function (n) {
            var i = t.getDate(n);
            return i += " ", i += t.getTime(n), t.getCorrectedDate(i, n)
        }, t.getLongMonthDateTime = function (n) {
            var i = t.getLongMonthDate(n);
            return i += " ", i += t.getTime(n), t.getCorrectedDate(i, n)
        }, t.getShortDateTimeWithTimezone = function (n) {
            return this.getShortDateTime(n) + this.getTimezone()
        }, t.getShortDateTime = function (n) {
            var i = t.getShortDate(n);
            return i += " ", i += t.getTime(n), t.getCorrectedDate(i, n)
        }, t.getDate = function (n) {
            return t.daysShort[n.getDay()] + " " + t.monthsShort[n.getMonth()] + " " + n.getDate()
        }, t.getLongMonthDate = function (n) {
            return t.monthsLong[n.getMonth()] + " " + n.getDate() + ", " + n.getFullYear()
        }, t.getShortDate = function (n) {
            return t.monthsShort[n.getMonth()] + " " + n.getDate()
        }, t.getTime = function (n) {
            var i = n.getHours(),
  				r = n.getMinutes(),
  				u = i >= 12,
  				f = u ? " PM" : " AM";
            return t.getHours(i).toString() + ":" + t.getMinutes(r) + f
        }, t.chooseFormatFunction = function (n) {
            return n ? n === t.shortDateString ? t.getShortDate : n === t.timeString ? t.getShortDateTime : t.getDateTime : t.getDateTime
        }, t.getCorrectedDate = function (n, t) {
            var i = n;
            return i.indexOf("NaN") > -1 && (i = t.getFullYear() > 2013 ? t.toLocaleString() : ""), i
        }, t.getHours = function (n) {
            return n > 12 ? n -= 12 : n || (n = 12), n
        }, t.getMinutes = function (n) {
            var t = n.toString();
            return t.length === 1 && (t = "0" + t), t
        }, t.shortDateString = "short", t.timeString = "time", t.monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], t.monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], t.daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], t.isDaylightSavings = null, t.dstUtcOffsetToTimezoneMap = {
            "180": "ADT",
            "480": "AKDT",
            "540": "HADT",
            "240": "EDT",
            "300": "CDT",
            "360": "MDT",
            "-240": "GST",
            "600": "HAST",
            "420": "PDT",
            "0": "UTC"
        }, t.stdUtcOffsetToTimezoneMap = {
            "180": "PYST",
            "480": "PST",
            "540": "AKST",
            "240": "ECT",
            "300": "EST",
            "360": "CST",
            "-240": "GST",
            "600": "HAST",
            "420": "MST",
            "0": "UTC"
        }, t
    }();
    n.DateFormatter = t
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function r(n, r) {
        var u = i(top.location.href),
  			f;
        u[n] = r;
        f = t(u);
        top.location.hash = f
    }

    function t(n) {
        var i = "";
        for (var t in n) n.hasOwnProperty(t) && (i += t + "=" + encodeURI(n[t]) + "&");
        return i
    }

    function i(n) {
        var f = {},
  			h = n.split("#"),
  			e = h.length > 1 ? h[1] : null,
  			i, o, r, t, s, u;
        if (e !== null && e.length > 0)
            for (i = decodeURIComponent, o = e.split("&"), r = 0; r < o.length; r++)
                if (t = o[r].split("="), t.length == 2) f[t[0]] = i(t[1]);
                else if (t.length > 2) {
                    for (s = [], u = 1; u < t.length; u++) s.push(i(t[u]));
                    f[t[0]] = i(s.join("="))
                }
        return f
    }
    n.appendHashToTopLocation = r;
    n.serializeHashParams = t;
    n.extractHashParams = i
}(ThirdParty || (ThirdParty = {})),
function (n) {
    function t() {
        n.logLoad("Main");
        n.setupAutoNavigation();
        n.setupAutoClickHandler()
    }

    function i() {
        document.readyState === "complete" ? setTimeout(t, 1) : n.bindEvent(n._w, "load", t)
    }
    i()
}(ThirdParty || (ThirdParty = {}));

var SpeedTest;
(function (SpeedTest) {
    SpeedTest.Consts = {
        "startMessage": "Start",
        "stopMessage": "Stop",
        "timeUnit": "ms",
        "speedUnit1": "Mbps",
        "speedUnit2": "Kbps",
        "speedUnit3": "bps"
    };
})(SpeedTest || (SpeedTest = {}));
var SpeedTest;

(function (n) {
    var r = ThirdParty._w,
  		t = ThirdParty._ge,
  		u = ThirdParty.bindEvent,      
  		i = function () {
  		 function i() {
  		        this.amount = 0;
  		        this.targetAmount = 0;
  		        this.velocity = 0;
  		        this.springConstant = 377;
  		        this.timeDelta = 1 / 60;
  		        this.value = [0, 1, 5, 10, 20, 30, 50, 75, 100];
  		        this.started = !0;
  		        this.pingCount = 5;
  		        this.bestPing = null;
  		        this.pingClient = null;
  		        this.downloadStartTime = null;
  		        this.downloadClient = null;
  		     //changed amount to data to download 204799;
  		        this.uploadSize = 54799;
  		        this.uploadStartTime = null;
  		        this.uploadClient = null;
  		        this.uploadContent = null;
  		        this.downloadUrl = "https://www.bing.com/speedtest/";
  		        this.uploadUrl = "https://www.bing.com/speedtestupload";
  		        this.pingTime = null;
  		        this.downloadSpeed = null;
  		        this.uploadSpeed = null;
  		        this.movingWindow = [];
  		        this.movingWindowSize = 50;
  		        this.movingWindowIndex = 0;
  		        this.useFullIndex = !1;
  		        this.currentSpeed = [];
  		        this.connection = 3;
  		        this.canvas = null;
  		        this.button = true;
  		        this.speed = null;
  		        this.unit = null;
  		        this.pingBox = null;
  		        this.pingValue = null;
  		        this.downloadBox = null;
  		        this.downloadValue = null;
  		        this.uploadBox = null;
  		        this.uploadValue = null;
  		        this.pingBar = null;
  		        this.bar = null;
  		        this.barFill = null
  		   }
  		 
  		    return i.prototype.run = function () {
  		        try {
  		            this.attachToDom();
  		            this.bindEvents();
  		            this.defineAnimation();
  		            this.initSpeedometer();
  		            ThirdParty.resizeToFitContent(!1)
  		        } catch (n) {
  		            ThirdParty.logError("run: " + n.toString());
  		            throw n;
  		        }
  		    }, i.prototype.attachToDom = function () {
  		        try {
  		            this.canvas = t("canvas");
  		            this.button = t("stbutton");
  		            this.speed = t("speed");
  		            this.unit = t("unit");
  		            this.pingBox = t("pingBox");
  		            this.pingValue = t("pingValue");
  		            this.downloadBox = t("downloadBox");
  		            this.downloadValue = t("downloadValue");
  		            this.uploadBox = t("uploadBox");
  		            this.uploadValue = t("uploadValue");
  		            this.pingBar = t("pingBar");
  		            this.bar = t("bar");
  		            this.barFill = t("barFill")
  		        } catch (n) {
  		            ThirdParty.logError("attachToDom: " + n.toString());
  		            throw n;
  		        }
  		    }, i.prototype.bindEvents = function () {
  		        var t = this;
  		        try {
  		            this.button && u(this.button, "click", function () {
  		                return t.click()
  		            })
  		        } catch (n) {
  		            ThirdParty.logError("bindEvents: " + n.toString());
  		            throw n;
  		        }
  		    }, i.prototype.initSpeedometer = function () {
  		        try {
  		            if (this.canvas) {
  		                var n = this.canvas,
  							i = n.getContext("2d");
  		                this.drawSpeedometer(n, i)
  		            }
  		        } catch (t) {
  		            ThirdParty.logError("initSpeedometer: " + t.toString());
  		            throw t;
  		        }
  		    }, i.prototype.defineAnimation = function () {
  		        try {
  		            this.requestAnimFrame = ThirdParty.requestAnimationFrame()
  		        } catch (n) {
  		            ThirdParty.logError("defineAnimation: " + n.toString());
  		            throw n;
  		        }
  		    }, i.prototype.drawSpeedometer = function (n, t) {
  		        var f = this,
  					i, r;
  		        try {
  		            t.clearRect(0, 0, n.width, n.height);
  		            i = n.width / 2;
  		            r = n.height / 2;
  		            t.beginPath();
  		            t.arc(i, r, n.width / 2 - 2, 130 * (Math.PI / 180), 50 * (Math.PI / 180));
  		            t.lineWidth = 4;
  		            t.strokeStyle = "#005eb8";
  		            t.stroke();
  		            t.beginPath();
  		            t.arc(i, r, n.width / 2 - 42, 130 * (Math.PI / 180), 50 * (Math.PI / 180));
  		            t.lineWidth = 80;
  		            t.strokeStyle = this.started ? "#FAFAFA" : "#F0F0F0";
  		            t.stroke();
  		            t.beginPath();
  		            t.arc(i, r, 20, 0, 2 * Math.PI);
  		            t.fillStyle = "#E6F2FB";
  		            t.fill();
  		            t.beginPath();
  		            t.arc(i, r, 10, 0, 2 * Math.PI);
  		            t.fillStyle = "#005eb8";
  		            t.fill();

  		            this.updateAmount();
  		            this.drawNeedle(n, t, this.amount);
  		            this.requestAnimFrame.call(window, function () {
  		                return f.drawSpeedometer(n, t)
  		            })
  		        } catch (u) {
  		            ThirdParty.logError("drawSpeedometer: " + u.toString());
  		            throw u;
  		        }
  		    }, i.prototype.updateAmount = function () {
  		        try {
  		            var t = (this.targetAmount - this.amount) * this.springConstant,
  						i = -2 * this.velocity * Math.sqrt(this.springConstant);
  		            this.velocity += (t + i) * this.timeDelta;
  		            this.amount += this.velocity * this.timeDelta
  		        } catch (n) {
  		            ThirdParty.logError("updateAmount: " + n.toString());
  		            throw n;
  		        }
  		    }, i.prototype.drawNeedle = function (n, t, i) {
  		        try {
  		            var r = n.width / 2,
  						u = n.height / 2,
  						f = 58,
  						e = (-50 + i * 280) * (Math.PI / 180);
  		            t.beginPath();
  		            t.moveTo(r, u);
  		            t.lineTo(r - Math.cos(e) * f, u - Math.sin(e) * f);
  		            t.strokeStyle = "#005eb8";
  		            t.lineWidth = 4;
  		            t.stroke();
  		            t.beginPath();
  		            t.arc(r, u, n.width / 2 - 42, 130 * (Math.PI / 180), (130 + i * 280) % 360 * (Math.PI / 180));
  		            t.lineWidth = 80;
  		            t.strokeStyle = "#E1EDF6";
  		            t.stroke()
  		        } catch (o) {
  		            ThirdParty.logError("drawNeedle: " + o.toString());
  		            throw o;
  		        }
  		    }, i.prototype.isRunning = function () {
  		        try {
  		            return this.started
  		        } catch (n) {
  		            ThirdParty.logError("isRunning: " + n.toString());
  		            throw n;
  		        }
  		    }, i.prototype.click = function () {
  		        try {
  		            this.started ? this.stop() : this.start()
  		        } catch (n) {
  		            ThirdParty.logError("click: " + n.toString());
  		            throw n;
  		        }
  		    }, i.prototype.start = function () {
  		        try {
  		            this.started = !0;
  		            this.updateUi();
  		            this.resetValue();
  		            this.pingServer(0)
  		        } catch (n) {
  		            ThirdParty.logError("start: " + n.toString());
  		            throw n;
  		        }
  		    }, i.prototype.stop = function () {
  		        try {
  		            this.started = !1;
  		            this.updateUi();
  		            this.instrumentation();
  		            this.resetValue()
  		        } catch (n) {
  		            ThirdParty.logError("stop: " + n.toString());
  		            throw n;
  		        }
  		    }, i.prototype.updateUi = function () {
  		        try {
  		            ThirdParty.setText(this.speed, "");
  		            ThirdParty.setText(this.unit, "");
  		            ThirdParty.hide(this.pingBar);
  		            this.started ? (ThirdParty.setText(this.button, n.Consts.stopMessage), this.updateUiLite(this.pingBox), this.updateUiLite(this.downloadBox), this.updateUiLite(this.uploadBox), ThirdParty.setText(this.pingValue, ""), ThirdParty.setText(this.downloadValue, ""), ThirdParty.setText(this.uploadValue, "")) : (ThirdParty.setText(this.button, n.Consts.startMessage), this.updateUiDark(this.pingBox), this.updateUiDark(this.downloadBox), this.updateUiDark(this.uploadBox))
  		        } catch (t) {
  		            ThirdParty.logError("updateUi: " + t.toString());
  		            throw t;
  		        }
  		    }, i.prototype.updateUiLite = function (n) {
  		        try {
  		            ThirdParty.removeClass(n, "dark");
  		            ThirdParty.addClass(n, "lite")
  		        } catch (t) {
  		            ThirdParty.logError("updateUiLite: " + t.toString());
  		            throw t;
  		        }
  		    }, i.prototype.updateUiDark = function (n) {
  		        try {
  		            ThirdParty.removeClass(n, "lite");
  		            ThirdParty.addClass(n, "dark")
  		        } catch (t) {
  		            ThirdParty.logError("updateUiDark: " + t.toString());
  		            throw t;
  		        }
  		    }, i.prototype.resetValue = function () {
  		        try {
  		            this.targetAmount = 0;
  		            this.bestPing = null;
  		            this.downloadStartTime = null;
  		            this.uploadStartTime = null;
  		            this.pingClient !== null && (this.pingClient.onprogress = function () { }, this.pingClient.onreadystatechange = function () { }, this.pingClient.abort());
  		            this.downloadClient !== null && (this.downloadClient.onprogress = function () { }, this.downloadClient.onreadystatechange = function () { }, this.downloadClient.abort());
  		            this.uploadClient !== null && (this.uploadClient.onprogress = function () { }, this.uploadClient.onreadystatechange = function () { }, this.uploadClient.abort());
  		            this.pingClient = null;
  		            this.downloadClient = null;
  		            this.uploadClient = null;
  		            this.pingTime = null;
  		            this.downloadSpeed = null;
  		            this.uploadSpeed = null;
  		            this.movingWindow = [];
  		            this.movingWindowIndex = 0;
  		            this.useFullIndex = !1;
  		            for (var n = 0; n < this.connection; n++) this.currentSpeed[n] = 0
  		        } catch (t) {
  		            ThirdParty.logError("resetValue: " + t.toString());
  		            throw t;
  		        }
  		    }, i.prototype.pingServer = function (n) {
  		        var i, r, t;
  		        try {
  		            if (!this.started) return;
  		            if (n >= this.pingCount) {
  		                for (this.pingTime = this.bestPing, this.showPingResult(this.bestPing), this.downloadTest(), i = 0; i < this.connection; i++) this.downloadTestDummy(i);
  		                return
  		            }
  		            this.updateUiPingBox(n);
  		            this.pingClient = new XMLHttpRequest;
  		            t = this;
  		            this.pingClient.onreadystatechange = function () {
  		                try {
  		                    if (this.readyState === 2) r = (new Date).getTime();
  		                    else if (this.readyState === 4) {
  		                        var i = (new Date).getTime() - r;
  		                        (t.bestPing === null || i < t.bestPing) && (t.bestPing = i);
  		                        t.pingClient.onprogress = function () { };
  		                        t.pingClient.onreadystatechange = function () { };
  		                        t.pingClient.abort();
  		                        t.pingServer(n + 1)
  		                    }
  		                } catch (u) {
  		                    ThirdParty.logError("pingServer onreadystatechange: " + u.toString());
  		                    throw u;
  		                }
  		            };
  		            this.pingClient.open("GET", this.downloadUrl + "latency.txt?num=" + n + "&dt=" + Math.random() * 10000000000000000, !0);
  		            this.pingClient.responseType = "blob";
  		            this.pingClient.send()
  		        } catch (u) {
  		            ThirdParty.logError("pingServer: " + u.toString());
  		            throw u;
  		        }
  		    }, i.prototype.updateUiPingBox = function (n) {
  		        try {
  		            this.updateUiDark(this.pingBox);
  		            ThirdParty.hide(this.pingBar);
  		            this.barFill.style.width = (n * 20 / this.pingCount).toString() + "%"
  		        } catch (t) {
  		            ThirdParty.logError("updateUiPingBox: " + t.toString());
  		            throw t;
  		        }
  		    }, i.prototype.downloadTest = function () {
  		        try {
  		            if (!this.started) return;
  		            this.updateUiDark(this.downloadBox);
  		            this.downloadClient = new XMLHttpRequest;
  		            var n = this;
  		            this.downloadClient.onprogress = function (t) {
  		                var i, r, u;
  		                try {
  		                    if (t.lengthComputable) {
  		                        if (i = (new Date).getTime() - n.downloadStartTime, i <= 0) return;
  		                        if (i >= 8e3) {
  		                            n.downloadClient.onprogress = function () { };
  		                            n.downloadClient.onreadystatechange = function () { };
  		                            n.downloadClient.abort();
  		                            n.updateTargetAmount(0);
  		                            n.delay(2e3);
  		                            return
  		                        }
  		                        for (r = t.loaded / 125e3 / (i / 1e3), u = 0; u < n.connection; u++) r += n.currentSpeed[u];
  		                        n.updateTargetAmount(r);
  		                        n.movingWindow[n.movingWindowIndex++] = r;
  		                        n.movingWindowIndex >= n.movingWindowSize && (n.useFullIndex = !0, n.movingWindowIndex = 0)
  		                    }
  		                } catch (f) {
  		                    ThirdParty.logError("downloadTest onprogress: " + f.toString());
  		                    throw f;
  		                }
  		            };
  		            this.downloadClient.onreadystatechange = function () {
  		                try {
  		                    this.readyState === 2 ? n.downloadStartTime = (new Date).getTime() : this.readyState === 4 && (n.downloadClient.onprogress = function () { }, n.downloadClient.onreadystatechange = function () { }, n.downloadClient.abort(), n.updateTargetAmount(0), n.delay(2e3))
  		                } catch (t) {
  		                    ThirdParty.logError("downloadTest onreadystatechange: " + t.toString());
  		                    throw t;
  		                }
  		            };
  		            this.downloadClient.open("GET", this.downloadUrl + "extraextralarge.txt?dt=" + Math.random() * 10000000000000000, !0);
  		            this.downloadClient.responseType = "blob";
  		            this.downloadClient.send()
  		        } catch (t) {
  		            ThirdParty.logError("downloadTest: " + t.toString());
  		            throw t;
  		        }
  		    }, i.prototype.downloadTestDummy = function (n) {
  		        try {
  		            if (!this.started) return;
  		            var i, t = new XMLHttpRequest,
  						r = this;
  		            t.onprogress = function (t) {
  		                var u, f;
  		                try {
  		                    if (!r.started) {
  		                        this.onprogress = function () { };
  		                        this.onreadystatechange = function () { };
  		                        this.abort();
  		                        return
  		                    }
  		                    if (t.lengthComputable) {
  		                        if (u = (new Date).getTime() - i, u <= 0) return;
  		                        if (u >= 8e3) {
  		                            this.onprogress = function () { };
  		                            this.onreadystatechange = function () { };
  		                            this.abort();
  		                            return
  		                        }
  		                        f = t.loaded / 125e3 / (u / 1e3);
  		                        r.currentSpeed[n] = f
  		                    }
  		                } catch (e) {
  		                    ThirdParty.logError("downloadTestDummy onprogress: " + e.toString());
  		                    throw e;
  		                }
  		            };
  		            t.onreadystatechange = function () {
  		                try {
  		                    this.readyState === 2 ? i = (new Date).getTime() : this.readyState === 4 && (this.onprogress = function () { }, this.onreadystatechange = function () { }, this.abort())
  		                } catch (n) {
  		                    ThirdParty.logError("downloadTestDummy onreadystatechange: " + n.toString());
  		                    throw n;
  		                }
  		            };
  		            t.open("GET", this.downloadUrl + "extraextralarge.txt?dt=" + Math.random() * 10000000000000000, !0);
  		            t.responseType = "blob";
  		            t.send()
  		        } catch (u) {
  		            ThirdParty.logError("downloadTestDummy: " + u.toString());
  		            throw u;
  		        }
  		    }, i.prototype.updateTargetAmount = function (n) {
  		        var i, r, t;
  		        try {
  		            if (!this.started) return;
  		            if (this.updateUiSpeed(n, this.speed, this.unit), n < 0) this.targetAmount = 0;
  		            else if (n >= 100) this.targetAmount = 1;
  		            else
  		                for (t = 1; t <= 8; t++)
  		                    if (n < this.value[t]) {
  		                        i = (n - this.value[t - 1]) / (this.value[t] - this.value[t - 1]);
  		                        r = (t - 1) / 8;
  		                        this.targetAmount = r + 1 / 8 * i;
  		                        break
  		                    }
  		        } catch (u) {
  		            ThirdParty.logError("updateTargetAmount: " + u.toString());
  		            throw u;
  		        }
  		    }, i.prototype.delay = function (n) {
  		        var t = this;
  		        try {
  		            r.setTimeout(function () {
  		                t.showSpeedResult(t.downloadBox, t.downloadValue)
  		            }, n)
  		        } catch (i) {
  		            ThirdParty.logError("delay: " + i.toString());
  		            throw i;
  		        }
  		    }, i.prototype.uploadTest = function () {
  		        var t, n;
  		        try {
  		            if (!this.started) return;
  		            if ((new Date).getTime() - this.uploadStartTime >= 5e3) {
  		                this.showSpeedResult(this.uploadBox, this.uploadValue);
  		                this.stop();
  		                return
  		            }
  		            this.updateUiDark(this.uploadBox);
  		            t = (new Date).getTime();
  		            this.uploadClient = new XMLHttpRequest;
  		            n = this;
  		            this.uploadClient.onreadystatechange = function () {
  		                var u, i, r;
  		                try {
  		                    if (this.readyState === 4) {
  		                        for (u = (new Date).getTime() - t, i = n.uploadSize / 125e3 / (u / 1e3), r = 0; r < n.connection; r++) i += n.currentSpeed[r];
  		                        n.updateTargetAmount(i);
  		                        n.movingWindow[n.movingWindowIndex++] = i;
  		                        n.movingWindowIndex >= n.movingWindowSize && (n.useFullIndex = !0, n.movingWindowIndex = 0);
  		                        n.uploadClient.onprogress = function () { };
  		                        n.uploadClient.onreadystatechange = function () { };
  		                        n.uploadClient.abort();
  		                        n.uploadTest()
  		                    }
  		                } catch (f) {
  		                    ThirdParty.logError("uploadTest onreadystatechange: " + f.toString());
  		                    throw f;
  		                }
  		            };
  		            this.uploadClient.open("POST", this.uploadUrl + "?dt=" + Math.random() * 10000000000000000, !0);
  		            this.uploadClient.send(this.uploadContent)
  		        } catch (i) {
  		            ThirdParty.logError("uploadTest: " + i.toString());
  		            throw i;
  		        }
  		    }, i.prototype.uploadTestDummy = function (n) {
  		        try {
  		            if (!this.started) return;
  		            if ((new Date).getTime() - this.uploadStartTime >= 5e3) return;
  		            var u = (new Date).getTime(),
  						t = new XMLHttpRequest,
  						i = this;
  		            t.onprogress = function () {
  		                try {
  		                    if (!i.started) {
  		                        this.onprogress = function () { };
  		                        this.onreadystatechange = function () { };
  		                        this.abort();
  		                        return
  		                    }
  		                } catch (n) {
  		                    ThirdParty.logError("uploadTestDummy onprogress: " + n.toString());
  		                    throw n;
  		                }
  		            };
  		            t.onreadystatechange = function () {
  		                try {
  		                    if (this.readyState === 4) {
  		                        var r = (new Date).getTime() - u,
  									f = i.uploadSize / 125e3 / (r / 1e3);
  		                        i.currentSpeed[n] = f;
  		                        this.onprogress = function () { };
  		                        this.onreadystatechange = function () { };
  		                        this.abort();
  		                        i.uploadTestDummy(n)
  		                    }
  		                } catch (t) {
  		                    ThirdParty.logError("uploadTestDummy onreadystatechange: " + t.toString());
  		                    throw t;
  		                }
  		            };
  		            t.open("POST", this.uploadUrl + "?dt=" + Math.random() * 10000000000000000, !0);
  		            t.send(this.uploadContent)
  		        } catch (r) {
  		            ThirdParty.logError("uploadTestDummy: " + r.toString());
  		            throw r;
  		        }
  		    }, i.prototype.showPingResult = function (n) {
  		        try {
  		            if (!this.started) return;
  		            this.updateUiPing(n)
  		        } catch (t) {
  		            ThirdParty.logError("showPingResult: " + t.toString());
  		            throw t;
  		        }
  		    }, i.prototype.updateUiPing = function (t) {
  		        try {
  		            ThirdParty.hide(this.pingBar);
  		            this.updateUiLite(this.pingBox);
  		            t === 0 ? ThirdParty.setText(this.pingValue, "<1 " + n.Consts.timeUnit) : ThirdParty.setText(this.pingValue, t.toString() + " " + n.Consts.timeUnit)
  		        } catch (i) {
  		            ThirdParty.logError("updateUiPing: " + i.toString());
  		            throw i;
  		        }
  		    }, i.prototype.showSpeedResult = function (n, t) {
  		        var u, r, i;
  		        try {
  		            if (!this.started || ThirdParty.getText(t) !== "") return;
  		            if (u = this.useFullIndex ? this.movingWindowSize : this.movingWindowIndex, u > 0) {
  		                for (r = 0, i = 0; i < u; i++) r = Math.max(r, this.movingWindow[i]);
  		                if (this.updateUiLite(n), this.updateUiSpeed(r, t, null), n === this.downloadBox) {
  		                    for (this.downloadSpeed = r * 1e3, this.movingWindow = [], this.movingWindowIndex = 0, this.useFullIndex = !1, i = 0; i < this.connection; i++) this.currentSpeed[i] = 0;
  		                    for (this.uploadContent = this.randomString(this.uploadSize), this.uploadStartTime = (new Date).getTime(), this.uploadTest(), i = 0; i < this.connection; i++) this.uploadTestDummy(i)
  		                } else this.uploadSpeed = r * 1e3
  		            }
  		        } catch (f) {
  		            ThirdParty.logError("showSpeedResult: " + f.toString());
  		            throw f;
  		        }
  		    }, i.prototype.updateUiSpeed = function (t, i, r) {
  		        try {
  		            var u, f;
  		            t >= 1 ? (u = t, f = n.Consts.speedUnit1) : t >= 1 / 1e3 ? (u = t * 1e3, f = n.Consts.speedUnit2) : (u = t * 1e6, f = n.Consts.speedUnit3);
  		            r !== null ? (ThirdParty.setText(i, u.toFixed(2)), ThirdParty.setText(r, f)) : ThirdParty.setText(i, u.toFixed(2) + " " + f)
  		        } catch (e) {
  		            ThirdParty.logError("updateUiSpeed: " + e.toString());
  		            throw e;
  		        }
  		    }, i.prototype.randomString = function (n) {
  		        var t, i, r;
  		        try {
  		            for (t = "", i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", r = 0; r < n; r++) t += i.charAt(Math.floor(Math.random() * i.length));
  		            return t
  		        } catch (u) {
  		            ThirdParty.logError("randomString: " + u.toString());
  		            throw u;
  		        }
  		    }, i.prototype.instrumentation = function () {
  		        try {
  		            ThirdParty.logLoad("SpeedTest", "PingTime", this.pingTime !== null ? this.pingTime.toString() : "", "DownloadSpeed", this.downloadSpeed !== null ? this.downloadSpeed.toString() : "", "UploadSpeed", this.uploadSpeed !== null ? this.uploadSpeed.toString() : "")
  		        } catch (n) {
  		            ThirdParty.logError("instrumentation: " + n.toString());
  		            throw n;
  		        }
  		    }, i
  		}();
    n.SpeedTestRenderer = i;
    
    ThirdParty.ready(function () {
        return (new i).run()
        return t.click();

    })
})(SpeedTest || (SpeedTest = {}));
var ThirdParty;
(function (n) {
    function i() {
        var i = t.performance,
  			r = i && i.timing,
  			e = i && i.navigation,
  			o, u, f;
        if (i && r && e && i.now) {
            o = r.navigationStart + Math.ceil(i.now());
            u = {};
            for (f in r) typeof r[f] == "number" && (u[f] = r[f]);
            u.loadEventEnd = o;
            n.sendMessage("Perf", {
                timing: u,
                navigation: e,
                now: i.now()
            })
        }
    }

    function r() {
        document.readyState === "complete" ? setTimeout(i, 1) : n.bindEvent(t, "load", i)
    }
    var t = window;
    r()
})(ThirdParty || (ThirdParty = {}));

$(window).load(function () {
    //$('#stbutton').click();
    //$('#stbutton').click();
})




