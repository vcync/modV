import {
  defineComponent as D,
  ref as S,
  openBlock as I,
  createElementBlock as z,
  renderSlot as ne,
  inject as K,
  computed as A,
  unref as B,
  provide as q,
  watch as oe,
  h as re,
  getCurrentInstance as U,
  watchEffect as se,
  createBlock as $,
  readonly as ie,
  nextTick as Z,
  onMounted as le,
  createVNode as M,
  createSlots as ae,
  withCtx as T,
  createElementVNode as H,
  Fragment as ue,
  renderList as ce,
  resolveDynamicComponent as de,
} from "vue";
import { VirtualLayout as pe, LayoutConfig as fe } from "golden-layout";
const me = /* @__PURE__ */ D({
    __name: "GlTemplate",
    setup(e, { expose: r }) {
      const t = S(null),
        d = (m) => m.toString(10) + "px";
      return (
        r({
          setPosAndSize: (m, p, f, s) => {
            if (t.value) {
              const n = t.value;
              (n.style.left = d(m)),
                (n.style.top = d(p)),
                (n.style.width = d(f)),
                (n.style.height = d(s));
            }
          },
          setVisibility: (m) => {
            if (t.value) {
              const p = t.value;
              m ? (p.style.display = "") : (p.style.display = "none");
            }
          },
          setZIndex: (m) => {
            if (t.value) {
              const p = t.value;
              p.style.zIndex = m;
            }
          },
        }),
        (m, p) => (
          I(),
          z(
            "div",
            {
              ref_key: "GlTemplate",
              ref: t,
              style: { position: "absolute", overflow: "hidden" },
            },
            [ne(m.$slots, "default")],
            512,
          )
        )
      );
    },
  }),
  ve = Symbol("layout");
/*!
 * vue-router v4.2.2
 * (c) 2023 Eduardo San Martin Morote
 * @license MIT
 */
const he = typeof window < "u",
  ye = Object.assign,
  we = Array.isArray;
function ge(e) {
  const r = Array.from(arguments).slice(1);
  console.warn.apply(console, ["[Vue Router warn]: " + e].concat(r));
}
function _e(e, r) {
  return (e.aliasOf || e) === (r.aliasOf || r);
}
var W;
(function (e) {
  (e.pop = "pop"), (e.push = "push");
})(W || (W = {}));
var J;
(function (e) {
  (e.back = "back"), (e.forward = "forward"), (e.unknown = "");
})(J || (J = {}));
Symbol(process.env.NODE_ENV !== "production" ? "navigation failure" : "");
var Q;
(function (e) {
  (e[(e.aborted = 4)] = "aborted"),
    (e[(e.cancelled = 8)] = "cancelled"),
    (e[(e.duplicated = 16)] = "duplicated");
})(Q || (Q = {}));
const Ce = Symbol(
    process.env.NODE_ENV !== "production" ? "router view location matched" : "",
  ),
  X = Symbol(process.env.NODE_ENV !== "production" ? "router view depth" : ""),
  Ee = Symbol(process.env.NODE_ENV !== "production" ? "router" : "");
Symbol(process.env.NODE_ENV !== "production" ? "route location" : "");
const Y = Symbol(
    process.env.NODE_ENV !== "production" ? "router view location" : "",
  ),
  Re = /* @__PURE__ */ D({
    name: "RouterView",
    // #674 we manually inherit them
    inheritAttrs: !1,
    props: {
      name: {
        type: String,
        default: "default",
      },
      route: Object,
    },
    // Better compat for @vue/compat users
    // https://github.com/vuejs/router/issues/1315
    compatConfig: { MODE: 3 },
    setup(e, { attrs: r, slots: t }) {
      process.env.NODE_ENV !== "production" && Ve();
      const d = K(Y),
        _ = A(() => e.route || d.value),
        g = K(X, 0),
        E = A(() => {
          let f = B(g);
          const { matched: s } = _.value;
          let n;
          for (; (n = s[f]) && !n.components; ) f++;
          return f;
        }),
        m = A(() => _.value.matched[E.value]);
      q(
        X,
        A(() => E.value + 1),
      ),
        q(Ce, m),
        q(Y, _);
      const p = S();
      return (
        oe(
          () => [p.value, m.value, e.name],
          ([f, s, n], [C, i, O]) => {
            s &&
              ((s.instances[n] = f),
              i &&
                i !== s &&
                f &&
                f === C &&
                (s.leaveGuards.size || (s.leaveGuards = i.leaveGuards),
                s.updateGuards.size || (s.updateGuards = i.updateGuards))),
              f &&
                s && // if there is no instance but to and from are the same this might be
                // the first visit
                (!i || !_e(s, i) || !C) &&
                (s.enterCallbacks[n] || []).forEach((G) => G(f));
          },
          { flush: "post" },
        ),
        () => {
          const f = _.value,
            s = e.name,
            n = m.value,
            C = n && n.components[s];
          if (!C) return F(t.default, { Component: C, route: f });
          const i = n.props[s],
            O = i
              ? i === !0
                ? f.params
                : typeof i == "function"
                  ? i(f)
                  : i
              : null,
            R = re(
              C,
              ye({}, O, r, {
                onVnodeUnmounted: (L) => {
                  L.component.isUnmounted && (n.instances[s] = null);
                },
                ref: p,
              }),
            );
          if (process.env.NODE_ENV !== "production" && he && R.ref) {
            const L = {
              depth: E.value,
              name: n.name,
              path: n.path,
              meta: n.meta,
            };
            (we(R.ref) ? R.ref.map((k) => k.i) : [R.ref.i]).forEach((k) => {
              k.__vrv_devtools = L;
            });
          }
          return (
            // pass the vnode to the slot as a prop.
            // h and <component :is="..."> both accept vnodes
            F(t.default, { Component: R, route: f }) || R
          );
        }
      );
    },
  });
function F(e, r) {
  if (!e) return null;
  const t = e(r);
  return t.length === 1 ? t[0] : t;
}
const be = Re;
function Ve() {
  const e = U(),
    r = e.parent && e.parent.type.name,
    t = e.parent && e.parent.subTree && e.parent.subTree.type;
  if (
    r &&
    (r === "KeepAlive" || r.includes("Transition")) &&
    typeof t == "object" &&
    t.name === "RouterView"
  ) {
    const d = r === "KeepAlive" ? "keep-alive" : "transition";
    ge(`<router-view> can no longer be used directly inside <transition> or <keep-alive>.
Use slot props instead:

<router-view v-slot="{ Component }">
  <${d}>
    <component :is="Component" />
  </${d}>
</router-view>`);
  }
}
function ee() {
  return K(Ee);
}
const xe = { style: { display: "none" } },
  Se = /* @__PURE__ */ D({
    __name: "SlotExtr",
    setup(e, { expose: r }) {
      var t;
      return (
        r({
          slots: (t = U()) == null ? void 0 : t.slots,
        }),
        (d, _) => (I(), z("i", xe, "Slots extraction"))
      );
    },
  }),
  Ie = /* @__PURE__ */ D({
    __name: "FixedRoute",
    props: {
      route: {
        type: String,
        required: !0,
      },
    },
    setup(e) {
      const r = e,
        t = ee();
      let d = t.resolve(r.route);
      return (
        se(() => (d = t.resolve(r.route))),
        (_, g) => (I(), $(B(be), { route: B(d) }, null, 8, ["route"]))
      );
    },
  }),
  Ge = { style: { position: "relative" } },
  Le = { style: { position: "absolute", width: "100%", height: "100%" } },
  Ne = /* @__PURE__ */ D({
    __name: "GoldenLayout",
    props: {
      config: {
        type: Object,
        default: () => ({}),
      },
      router: {
        type: Boolean,
        default: !1,
      },
    },
    setup(e, { expose: r }) {
      const t = e,
        d = S(null),
        _ = ie(S("glc_")),
        g = /* @__PURE__ */ new Map(),
        E = S(/* @__PURE__ */ new Map()),
        m = [],
        p = U(),
        f = p.slots,
        s = S(),
        n = {},
        C = ee();
      let i;
      t.router &&
        C.afterEach((l) => {
          var u;
          const v = l.fullPath;
          if (v && v !== "/")
            if (n[v]) {
              const h =
                (u = Array.from(g.entries()).find(
                  ([b, w]) => w.refId === n[l.fullPath],
                )) == null
                  ? void 0
                  : u[0];
              h && h.focus(!0);
            } else
              L(
                "route",
                l.meta.title || l.name || l.path.split("/").pop() || "[Route]",
                { url: v },
              );
        });
      let O = 0,
        G;
      q(ve, p == null ? void 0 : p.exposed);
      const R = async (l, v) => {
          var b;
          const u = f[l] || ((b = s.value) == null ? void 0 : b.slots)[l];
          if (!u)
            throw new Error(
              `addComponent: Component '${l}' not found in slots`,
            );
          let h = O;
          return (
            m.length > 0 ? (h = m.pop()) : O++,
            E.value.set(h, () => u(v)),
            t.router && l === "route" && (n[v.url] = h),
            h
          );
        },
        L = async (l, v, u = void 0) => {
          if (l.length == 0)
            throw new Error("addGlComponent: Component's type is empty");
          const h = await R(l, u);
          await Z(), i.addComponent(l, { refId: h, ...(u || {}) }, v);
        },
        P = async (l) => {
          i.clear(), E.value.clear();
          const v = l.resolved ? fe.fromResolved(l) : l;
          let u = [v.root.content],
            h = 0;
          for (; u.length > 0; ) {
            const b = u.shift();
            for (let w of b)
              w.type == "component"
                ? ((h = await R(w.componentType, w.componentState)),
                  typeof w.componentState == "object"
                    ? (w.componentState.refId = h)
                    : (w.componentState = { refId: h }))
                : w.content.length > 0 && u.push(w.content);
          }
          await Z(), i.loadLayout(v);
        },
        k = () => i.saveLayout();
      return (
        le(() => {
          if (d.value == null)
            throw new Error("Golden Layout can't find the root DOM!");
          const l = () => {
            const o = d.value;
            let a = o ? o.offsetWidth : 0,
              c = o ? o.offsetHeight : 0;
            i.setSize(a, c);
          };
          window.addEventListener("resize", l, { passive: !0 });
          const v = (o) => {
              G = d.value.getBoundingClientRect();
            },
            u = (o, a, c) => {
              const y = g.get(o);
              if (!y || !(y != null && y.glc))
                throw new Error(
                  "handleContainerVirtualRectingRequiredEvent: Component not found",
                );
              const N = o.element.getBoundingClientRect(),
                V = N.left - G.left,
                x = N.top - G.top;
              y.glc.setPosAndSize(V, x, a, c);
            },
            h = (o, a) => {
              const c = g.get(o);
              if (!c || !(c != null && c.glc))
                throw new Error(
                  "handleContainerVirtualVisibilityChangeRequiredEvent: Component not found",
                );
              c.glc.setVisibility(a);
            },
            b = (o, a, c) => {
              const y = g.get(o);
              if (!y || !(y != null && y.glc))
                throw new Error(
                  "handleContainerVirtualZIndexChangeRequiredEvent: Component not found",
                );
              y.glc.setZIndex(c);
            },
            w = (o, a) => {
              let c = -1;
              if (a && a.componentState) c = a.componentState.refId;
              else
                throw new Error(
                  "bindComponentEventListener: component's ref id is required",
                );
              const y = _.value + c,
                N = p == null ? void 0 : p.refs[y];
              return (
                g.set(o, { refId: c, glc: N[0] }),
                (o.virtualRectingRequiredEvent = (V, x, j) => u(V, x, j)),
                (o.virtualVisibilityChangeRequiredEvent = (V, x) => h(V, x)),
                (o.virtualZIndexChangeRequiredEvent = (V, x, j) => b(V, x, j)),
                {
                  component: N,
                  virtual: !0,
                }
              );
            },
            te = (o) => {
              const a = g.get(o);
              if (!a || !(a != null && a.glc))
                throw new Error(
                  "handleUnbindComponentEvent: Component not found",
                );
              g.delete(o),
                E.value.delete(a.refId),
                m.push(a.refId),
                Object.entries(n).find(([c, y]) =>
                  y === a.refId ? (delete n[c], !0) : !1,
                );
            };
          (i = new pe(d.value, w, te)),
            t.router &&
              i.on("activeContentItemChanged", (o) => {
                var c;
                let a =
                  o.componentType === "route"
                    ? (c = o.container.state) == null
                      ? void 0
                      : c.url
                    : "/";
                C.currentRoute.value.fullPath !== a && C.replace(a);
              }),
            (i.beforeVirtualRectingEvent = v),
            t.config && P(t.config);
        }),
        S({}),
        r({
          addGlComponent: L,
          loadGLLayout: P,
          getLayoutConfig: k,
        }),
        (l, v) => (
          I(),
          z("div", Ge, [
            M(
              Se,
              {
                ref_key: "predef",
                ref: s,
              },
              ae({ _: 2 }, [
                t.router
                  ? {
                      name: "route",
                      fn: T(({ url: u }) => [
                        M(Ie, { route: u }, null, 8, ["route"]),
                      ]),
                      key: "0",
                    }
                  : void 0,
              ]),
              1536,
            ),
            H(
              "div",
              {
                ref_key: "GLRoot",
                ref: d,
                style: { position: "absolute", width: "100%", height: "100%" },
              },
              null,
              512,
            ),
            H("div", Le, [
              (I(!0),
              z(
                ue,
                null,
                ce(
                  E.value,
                  (u) => (
                    I(),
                    $(
                      me,
                      {
                        key: u[0],
                        ref_for: !0,
                        ref: B(_) + u[0],
                      },
                      {
                        default: T(() => [(I(), $(de(u[1])))]),
                        _: 2,
                      },
                      1024,
                    )
                  ),
                ),
                128,
              )),
            ]),
          ])
        )
      );
    },
  });
export { Ne as GoldenLayout };
