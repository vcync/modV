import Vue from "vue";

const TOOLTIP_ID = "modv-tooltip";
let tooltip = null;
let pre = null;
let vnode = null;

function createTooltip() {
  const existingTooltip = document.getElementById(TOOLTIP_ID);

  if (existingTooltip) {
    tooltip = existingTooltip;
    pre = existingTooltip.querySelector("pre");
    tooltip.style.display = "initial";
    return;
  }

  const tooltipEl = document.createElement("span");
  const preEl = document.createElement("pre");

  tooltipEl.setAttribute("id", TOOLTIP_ID);
  tooltipEl.classList.add("tooltip");
  tooltipEl.appendChild(preEl);

  tooltip = tooltipEl;
  pre = preEl;

  document.body.appendChild(tooltip);
}

function setTooltipPosition(e) {
  requestAnimationFrame(() => {
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    const mx = window.pageXOffset + e.clientX + 16;
    const my = window.pageYOffset + e.clientY - 32;

    const x = Math.min(
      Math.max(mx, 0),
      document.body.clientWidth - tooltipWidth
    );
    const y = Math.min(
      Math.max(my, 0),
      document.body.clientHeight - tooltipHeight
    );

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  });
}

function setPreValue() {
  if (!vnode || !vnode.__vue__) {
    return;
  }

  const value = parseFloat(vnode.__vue__.value, 10);

  if (typeof value === "undefined") {
    return;
  }

  pre.innerHTML = value.toFixed(3);
}

function cleanUp() {
  if (vnode) {
    vnode.__vue__.$off("input", setPreValue);
  }

  vnode = null;
  window.removeEventListener("mousemove", mouseMove);
  window.removeEventListener("mouseup", mouseUp);

  if (tooltip) {
    tooltip.style.display = "none";
  }
}

function mouseUp() {
  cleanUp();
}

function mouseMove(e) {
  setTooltipPosition(e);
  setPreValue();
}

function mouseDown(e) {
  if (e.button > 0) {
    return;
  }

  vnode = e.target;
  while (vnode && !vnode.__vue__) {
    vnode = vnode.parentNode;
  }

  if (!vnode) {
    return;
  }

  vnode.__vue__.$on("input", setPreValue);
  window.addEventListener("mousemove", mouseMove);
  window.addEventListener("mouseup", mouseUp);

  createTooltip();
  setTooltipPosition(e);

  setPreValue();
}

Vue.directive("tooltip", {
  inserted(el) {
    el.addEventListener("mousedown", mouseDown);
  },

  unbind() {
    cleanUp();
  }
});
