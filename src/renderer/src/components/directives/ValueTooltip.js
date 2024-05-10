const TOOLTIP_ID = "modv-tooltip";
let tooltip = null;
let pre = null;
let vnode = null;
let setTooltipFromValue = true;
let isVisible = false;

function createTooltip() {
  const existingTooltip = document.getElementById(TOOLTIP_ID);

  if (existingTooltip) {
    tooltip = existingTooltip;
    pre = existingTooltip.querySelector("pre");
    setTooltipVisibility();
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
      document.body.clientWidth - tooltipWidth,
    );
    const y = Math.min(
      Math.max(my, 0),
      document.body.clientHeight - tooltipHeight,
    );

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  });
}

function setPreValue(e) {
  if (!vnode || !vnode.__vue__) {
    return;
  }

  let value = e;
  if (!e) {
    value = vnode.__vue__.value;
  } else if (typeof e === "object" && e.target) {
    value = e.target.value;
  }

  vnode.__vue__.$nextTick(() => {
    const parsedValue = parseFloat(value, 10);

    if (typeof parsedValue === "undefined") {
      return;
    }

    pre.innerHTML = parsedValue.toFixed(3);
  });
}

function cleanUp() {
  if (vnode) {
    vnode.__vue__.$off("input", setPreValue);
  }

  vnode = null;
  window.removeEventListener("mousemove", mouseMove);
  window.removeEventListener("mouseup", mouseUp);

  setTooltipVisibility(false);
}

function mouseUp() {
  cleanUp();
}

function mouseMove(e) {
  setTooltipPosition(e);

  if (setTooltipFromValue) {
    setPreValue();
  }
}

function mouseDown(e) {
  window.addEventListener("mouseup", mouseUp);

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

  createTooltip();
  setTooltipPosition(e);

  setTooltipFromValue = true;
  setPreValue();
}

function mouseOver(e, message) {
  vnode = e.target;
  while (vnode && !vnode.__vue__) {
    vnode = vnode.parentNode;
  }

  if (!vnode) {
    return;
  }

  window.addEventListener("mousemove", mouseMove);

  createTooltip();
  setTooltipPosition(e);

  setTooltipFromValue = false;
  pre.innerHTML = message;
}

function setTooltipVisibility(visible) {
  const visibility = visible ?? isVisible;

  if (tooltip) {
    tooltip.style.display = visibility ? "initial" : "none";
  }
}

export const installValueTooltip = (app) => {
  app.directive("tooltip", {
    inserted(el, { value: { visible, mouseover, message } = {} }) {
      isVisible = visible ?? true;

      if (!mouseover) {
        el.addEventListener("mousedown", mouseDown);
      } else {
        el.addEventListener("mouseover", (e) => mouseOver(e, message));
        el.addEventListener("mouseout", mouseUp);
      }
    },

    update(el, { value: { visible } }) {
      if (isVisible !== visible) {
        isVisible = visible;
      }
    },

    unbind() {
      cleanUp();
    },
  });
};
