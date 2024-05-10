const { Menu } = window.remote;

function openContextMenu(e, template) {
  const { clientX: x, clientY: y } = e;

  if (template) {
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ x, y });
  }
}

export const installContextMenu = (app) => {
  app.directive("contextMenu", {
    inserted(el, { value: template }) {
      el.addEventListener("contextmenu", async (e) =>
        openContextMenu(e, await template()),
      );
    },

    unbind() {
      // el.removeEventListener("click", e => openContextMenu(e, template));
    },
  });
};
