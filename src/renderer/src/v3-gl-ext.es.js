import { defineComponent as D, ref as S, openBlock as I, createElementBlock as z, renderSlot as oe, inject as K, computed as A, unref as B, provide as q, watch as re, h as se, getCurrentInstance as U, watchEffect as ie, createBlock as $, readonly as le, nextTick as Z, onMounted as ae, createVNode as M, createSlots as ue, withCtx as T, createElementVNode as H, Fragment as ce, renderList as de, resolveDynamicComponent as pe } from "vue";
import { VirtualLayout as fe, LayoutConfig as me } from "golden-layout";
const ve = /* @__PURE__ */ D({
  __name: "GlTemplate",
  setup(e, { expose: r }) {
    const t = S(null), a = (p) => p.toString(10) + "px";
    return r({
      setPosAndSize: (p, y, n, u) => {
        if (t.value) {
          const s = t.value;
          s.style.left = a(p), s.style.top = a(y), s.style.width = a(n), s.style.height = a(u);
        }
      },
      setVisibility: (p) => {
        if (t.value) {
          const y = t.value;
          p ? y.style.display = "" : y.style.display = "none";
        }
      },
      setZIndex: (p) => {
        if (t.value) {
          const y = t.value;
          y.style.zIndex = p;
        }
      }
    }), (p, y) => (I(), z("div", {
      ref_key: "GlTemplate",
      ref: t,
      style: { position: "absolute", overflow: "hidden" }
    }, [
      oe(p.$slots, "default")
    ], 512));
  }
}), he = Symbol("layout");
/*!
  * vue-router v4.2.2
  * (c) 2023 Eduardo San Martin Morote
  * @license MIT
  */
const ye = typeof window < "u", we = Object.assign, ge = Array.isArray;
function _e(e) {
  const r = Array.from(arguments).slice(1);
  console.warn.apply(console, ["[Vue Router warn]: " + e].concat(r));
}
function Ce(e, r) {
  return (e.aliasOf || e) === (r.aliasOf || r);
}
var W;
(function(e) {
  e.pop = "pop", e.push = "push";
})(W || (W = {}));
var J;
(function(e) {
  e.back = "back", e.forward = "forward", e.unknown = "";
})(J || (J = {}));
Symbol(process.env.NODE_ENV !== "production" ? "navigation failure" : "");
var Q;
(function(e) {
  e[e.aborted = 4] = "aborted", e[e.cancelled = 8] = "cancelled", e[e.duplicated = 16] = "duplicated";
})(Q || (Q = {}));
const Ee = Symbol(process.env.NODE_ENV !== "production" ? "router view location matched" : ""), X = Symbol(process.env.NODE_ENV !== "production" ? "router view depth" : ""), Re = Symbol(process.env.NODE_ENV !== "production" ? "router" : "");
Symbol(process.env.NODE_ENV !== "production" ? "route location" : "");
const Y = Symbol(process.env.NODE_ENV !== "production" ? "router view location" : ""), be = /* @__PURE__ */ D({
  name: "RouterView",
  // #674 we manually inherit them
  inheritAttrs: !1,
  props: {
    name: {
      type: String,
      default: "default"
    },
    route: Object
  },
  // Better compat for @vue/compat users
  // https://github.com/vuejs/router/issues/1315
  compatConfig: { MODE: 3 },
  setup(e, { attrs: r, slots: t }) {
    process.env.NODE_ENV !== "production" && xe();
    const a = K(Y), w = A(() => e.route || a.value), G = K(X, 0), _ = A(() => {
      let n = B(G);
      const { matched: u } = w.value;
      let s;
      for (; (s = u[n]) && !s.components; )
        n++;
      return n;
    }), p = A(() => w.value.matched[_.value]);
    q(X, A(() => _.value + 1)), q(Ee, p), q(Y, w);
    const y = S();
    return re(() => [y.value, p.value, e.name], ([n, u, s], [C, f, g]) => {
      u && (u.instances[s] = n, f && f !== u && n && n === C && (u.leaveGuards.size || (u.leaveGuards = f.leaveGuards), u.updateGuards.size || (u.updateGuards = f.updateGuards))), n && u && // if there is no instance but to and from are the same this might be
      // the first visit
      (!f || !Ce(u, f) || !C) && (u.enterCallbacks[s] || []).forEach((k) => k(n));
    }, { flush: "post" }), () => {
      const n = w.value, u = e.name, s = p.value, C = s && s.components[u];
      if (!C)
        return F(t.default, { Component: C, route: n });
      const f = s.props[u], g = f ? f === !0 ? n.params : typeof f == "function" ? f(n) : f : null, R = se(C, we({}, g, r, {
        onVnodeUnmounted: (L) => {
          L.component.isUnmounted && (s.instances[u] = null);
        },
        ref: y
      }));
      if (process.env.NODE_ENV !== "production" && ye && R.ref) {
        const L = {
          depth: _.value,
          name: s.name,
          path: s.path,
          meta: s.meta
        };
        (ge(R.ref) ? R.ref.map((O) => O.i) : [R.ref.i]).forEach((O) => {
          O.__vrv_devtools = L;
        });
      }
      return (
        // pass the vnode to the slot as a prop.
        // h and <component :is="..."> both accept vnodes
        F(t.default, { Component: R, route: n }) || R
      );
    };
  }
});
function F(e, r) {
  if (!e)
    return null;
  const t = e(r);
  return t.length === 1 ? t[0] : t;
}
const Ve = be;
function xe() {
  const e = U(), r = e.parent && e.parent.type.name, t = e.parent && e.parent.subTree && e.parent.subTree.type;
  if (r && (r === "KeepAlive" || r.includes("Transition")) && typeof t == "object" && t.name === "RouterView") {
    const a = r === "KeepAlive" ? "keep-alive" : "transition";
    _e(`<router-view> can no longer be used directly inside <transition> or <keep-alive>.
Use slot props instead:

<router-view v-slot="{ Component }">
  <${a}>
    <component :is="Component" />
  </${a}>
</router-view>`);
  }
}
function ee() {
  return K(Re);
}
const Se = { style: { display: "none" } }, Ie = /* @__PURE__ */ D({
  __name: "SlotExtr",
  setup(e, { expose: r }) {
    var t;
    return r({
      slots: (t = U()) == null ? void 0 : t.slots
    }), (a, w) => (I(), z("i", Se, "Slots extraction"));
  }
}), Ge = /* @__PURE__ */ D({
  __name: "FixedRoute",
  props: {
    route: {
      type: String,
      required: !0
    }
  },
  setup(e) {
    const r = e, t = ee();
    let a = t.resolve(r.route);
    return ie(() => a = t.resolve(r.route)), (w, G) => (I(), $(B(Ve), { route: B(a) }, null, 8, ["route"]));
  }
}), Le = { style: { position: "relative" } }, Oe = { style: { position: "absolute", width: "100%", height: "100%" } }, De = /* @__PURE__ */ D({
  __name: "GoldenLayout",
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    router: {
      type: Boolean,
      default: !1
    }
  },
  emits: ["state"],
  setup(e, { expose: r, emit: t }) {
    const a = e, w = S(null), G = le(S("glc_")), _ = /* @__PURE__ */ new Map(), p = S(/* @__PURE__ */ new Map()), y = [], n = U(), u = n.slots, s = S(), C = {}, f = ee();
    let g;
    a.router && f.afterEach((i) => {
      var c;
      const m = i.fullPath;
      if (m && m !== "/")
        if (C[m]) {
          const v = (c = Array.from(_.entries()).find(([b, E]) => E.refId === C[i.fullPath])) == null ? void 0 : c[0];
          v && v.focus(!0);
        } else
          P(
            "route",
            i.meta.title || i.name || i.path.split("/").pop() || "[Route]",
            { url: m }
          );
    });
    let k = 0, R;
    q(he, n == null ? void 0 : n.exposed);
    const L = async (i, m) => {
      var b;
      const c = u[i] || ((b = s.value) == null ? void 0 : b.slots)[i];
      if (!c)
        throw new Error(`addComponent: Component '${i}' not found in slots`);
      let v = k;
      return y.length > 0 ? v = y.pop() : k++, p.value.set(v, () => c(m)), a.router && i === "route" && (C[m.url] = v), v;
    }, P = async (i, m, c = void 0) => {
      if (i.length == 0)
        throw new Error("addGlComponent: Component's type is empty");
      const v = await L(i, c);
      await Z(), g.addComponent(i, { refId: v, ...c || {} }, m);
    }, O = async (i) => {
      g.clear(), p.value.clear();
      const m = i.resolved ? me.fromResolved(i) : i;
      let c = [m.root.content], v = 0;
      for (; c.length > 0; ) {
        const b = c.shift();
        for (let E of b)
          E.type == "component" ? (v = await L(
            E.componentType,
            E.componentState
          ), typeof E.componentState == "object" ? E.componentState.refId = v : E.componentState = { refId: v }) : E.content.length > 0 && c.push(
            E.content
          );
      }
      await Z(), g.loadLayout(m);
    }, te = () => g.saveLayout();
    return ae(() => {
      if (w.value == null)
        throw new Error("Golden Layout can't find the root DOM!");
      const i = () => {
        const o = w.value;
        let l = o ? o.offsetWidth : 0, d = o ? o.offsetHeight : 0;
        g.setSize(l, d);
      };
      window.addEventListener("resize", i, { passive: !0 });
      const m = (o) => {
        R = w.value.getBoundingClientRect();
      }, c = (o, l, d) => {
        const h = _.get(o);
        if (!h || !(h != null && h.glc))
          throw new Error(
            "handleContainerVirtualRectingRequiredEvent: Component not found"
          );
        const N = o.element.getBoundingClientRect(), V = N.left - R.left, x = N.top - R.top;
        h.glc.setPosAndSize(V, x, l, d);
      }, v = (o, l) => {
        const d = _.get(o);
        if (!d || !(d != null && d.glc))
          throw new Error(
            "handleContainerVirtualVisibilityChangeRequiredEvent: Component not found"
          );
        d.glc.setVisibility(l);
      }, b = (o, l, d) => {
        const h = _.get(o);
        if (!h || !(h != null && h.glc))
          throw new Error(
            "handleContainerVirtualZIndexChangeRequiredEvent: Component not found"
          );
        h.glc.setZIndex(d);
      }, E = (o, l) => {
        let d = -1;
        if (l && l.componentState)
          d = l.componentState.refId;
        else
          throw new Error(
            "bindComponentEventListener: component's ref id is required"
          );
        const h = G.value + d, N = n == null ? void 0 : n.refs[h];
        return _.set(o, { refId: d, glc: N[0] }), o.virtualRectingRequiredEvent = (V, x, j) => c(
          V,
          x,
          j
        ), o.virtualVisibilityChangeRequiredEvent = (V, x) => v(
          V,
          x
        ), o.virtualZIndexChangeRequiredEvent = (V, x, j) => b(
          V,
          x,
          j
        ), {
          component: N,
          virtual: !0
        };
      }, ne = (o) => {
        const l = _.get(o);
        if (!l || !(l != null && l.glc))
          throw new Error("handleUnbindComponentEvent: Component not found");
        _.delete(o), p.value.delete(l.refId), y.push(l.refId), Object.entries(C).find(([d, h]) => h === l.refId ? (delete C[d], !0) : !1);
      };
      g = new fe(
        w.value,
        E,
        ne
      ), a.router && g.on("activeContentItemChanged", (o) => {
        var d;
        let l = o.componentType === "route" ? (d = o.container.state) == null ? void 0 : d.url : "/";
        f.currentRoute.value.fullPath !== l && f.replace(l);
      }), g.beforeVirtualRectingEvent = m, g.on("stateChanged", () => {
        t("state", g.saveLayout());
      }), a.config && O(a.config);
    }), S({}), r({
      addGlComponent: P,
      loadGLLayout: O,
      getLayoutConfig: te
    }), (i, m) => (I(), z("div", Le, [
      M(Ie, {
        ref_key: "predef",
        ref: s
      }, ue({ _: 2 }, [
        a.router ? {
          name: "route",
          fn: T(({ url: c }) => [
            M(Ge, { route: c }, null, 8, ["route"])
          ]),
          key: "0"
        } : void 0
      ]), 1536),
      H("div", {
        ref_key: "GLRoot",
        ref: w,
        style: { position: "absolute", width: "100%", height: "100%" }
      }, null, 512),
      H("div", Oe, [
        (I(!0), z(ce, null, de(p.value, (c) => (I(), $(ve, {
          key: c[0],
          ref_for: !0,
          ref: B(G) + c[0]
        }, {
          default: T(() => [
            (I(), $(pe(c[1])))
          ]),
          _: 2
        }, 1024))), 128))
      ])
    ]));
  }
});
export {
  De as GoldenLayout
};
