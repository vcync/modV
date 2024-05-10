<template>
  <div
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Module Gallery Panel' }"
    v-searchTerms="{
      terms: ['gallery'],
      title: 'Gallery',
      type: 'Panel',
    }"
    class="gallery"
  >
    <grid columns="4">
      <c span="1..">
        <TextInput
          ref="searchField"
          v-model="searchTerm"
          class="gallery-search"
          placeholder="Search"
        />
      </c>
      <c span="1.." class="results">
        <grid columns="4">
          <c
            v-for="(modules, renderer) in modulesByRenderer"
            v-show="renderersToShow.indexOf(renderer) > -1"
            :key="renderer"
            class="renderer"
            span="4"
          >
            <div class="title">{{ renderer }}</div>
            <Container
              behaviour="copy"
              group-name="modules"
              :get-child-payload="
                (e) => getChildPayload('modulesByRenderer', e, renderer)
              "
              class="fluid"
            >
              <Draggable
                v-for="(module, name) in modules"
                v-show="modulesToShow.indexOf(name) > -1"
                :key="name"
                ghost-class="ghost"
                tabindex="0"
                @keydown.enter="
                  /* at the moment this does not work as Draggable doesn't pass through native events */
                  addModuleToFocusedGroup(module)
                "
              >
                <GalleryItem
                  v-if="groupId"
                  v-searchTerms="{
                    terms: [name, 'module'],
                    title: name,
                    focusElement: true,
                    type: 'Module',
                  }"
                  :module-name="name"
                  :group-id="groupId"
                />
              </Draggable>
            </Container>
          </c>

          <c v-show="!renderersToShow.length && searchTerm.length" span="1..">
            <h2>Couldn't find {{ searchTerm }}.</h2>
          </c>
        </grid>
      </c>
    </grid>
  </div>
</template>

<script>
import { Container, Draggable } from "vue3-smooth-dnd";
import constants from "../application/constants";
import GalleryItem from "./GalleryItem.vue";

export default {
  components: {
    Container,
    Draggable,
    GalleryItem,
  },

  data() {
    return {
      iVTitle: "Module Gallery",
      iVBody:
        "The Module Gallery displays all available Modules. A module can be dragged into a Group. Double clicking a Module will add it to the currently focused Group.",
      groupId: null,
      searchTerm: "",
      renderers: {},
      renderersToShow: [],
      modulesToShow: [],
    };
  },

  computed: {
    registeredModules() {
      return this.$modV.store.state.modules.registered;
    },

    modulesByRenderer() {
      return Object.keys(this.registeredModules)
        .sort((a, b) =>
          this.registeredModules[a].meta.name.localeCompare(
            this.registeredModules[b].meta.name,
          ),
        )
        .reduce((obj, key) => {
          const module = this.registeredModules[key];
          const { type, name } = module.meta;

          if (!(type in obj)) {
            obj[type] = {};
          }

          obj[type][name] = module;

          return obj;
        }, {});
    },
  },

  watch: {
    registeredModules: {
      handler() {
        this.updateModulesAndRenderersToShow();
      },
      deep: true,
    },

    searchTerm() {
      this.updateModulesAndRenderersToShow();
    },
  },

  async mounted() {
    const group = await this.$modV.store.dispatch("groups/createGroup", {
      name: constants.GALLERY_GROUP_NAME,
      hidden: true,
      enabled: true,
      clearing: true,
    });

    this.groupId = group.id;
    this.updateModulesAndRenderersToShow();

    window.addEventListener("keydown", this.keyDownListener.bind(this));
  },

  beforeUnmount() {
    // this.$modV.store.commit("groups/REMOVE_GROUP", this.groupId);
    window.removeEventListener("keydown", this.keyDownListener.bind(this));
  },

  methods: {
    getChildPayload(group, index, renderer) {
      const moduleName =
        this[group][renderer][Object.keys(this[group][renderer])[index]].meta
          .name;

      return { moduleName, collection: "gallery" };
    },

    search(textIn, termIn) {
      const text = textIn.toLowerCase().trim();
      const term = termIn.toLowerCase().trim();
      if (termIn.length < 1) {
        return true;
      }

      return text.indexOf(term) > -1;
    },

    updateModulesAndRenderersToShow() {
      const { search, searchTerm, registeredModules } = this;
      this.modulesToShow = [];
      this.renderersToShow = [];

      const registeredModulesKeys = Object.keys(registeredModules);
      for (let i = 0, len = registeredModulesKeys.length; i < len; i++) {
        const moduleKey = registeredModulesKeys[i];

        const module = registeredModules[moduleKey];
        const { name, type } = module.meta;

        if (search(name, searchTerm)) {
          this.modulesToShow.push(name);
          if (this.renderersToShow.indexOf(type) < 0) {
            this.renderersToShow.push(type);
          }
        }
      }
    },

    keyDownListener(e) {
      if (
        e.keyCode === 114 ||
        ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.keyCode === 70)
      ) {
        e.preventDefault();
        this.$refs.searchField.focus();
        this.$refs.searchField.select();
      }
    },

    async addModuleToFocusedGroup(moduleIn) {
      const groupId = this.$store.state["uiGroups"].focused;
      if (!groupId) {
        return;
      }

      const module = await this.$modV.store.dispatch(
        "modules/makeActiveModule",
        { moduleName: moduleIn.meta.name },
      );

      this.$modV.store.commit("groups/ADD_MODULE_TO_GROUP", {
        moduleId: module.$id,
        groupId,
        position: this.$modV.store.state.groups.groups.find(
          (group) => group.id === groupId,
        ).modules.length,
      });
    },
  },
};
</script>

<style lang="css" scoped>
.hidden {
  display: none !important;
}

.smooth-dnd-container.vertical {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  display: grid;
  gap: 8px;
}

.smooth-dnd-container.vertical > .smooth-dnd-draggable-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 16/9;
  background-color: black;
}

div.gallery {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  height: 100%;
}

div.gallery > grid {
  height: 100%;
}

.results {
  height: 100%;
  overflow-y: scroll;
}

.results grid {
  margin-right: 8px;
}

.title {
  font-size: 24px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.gallery-search {
  display: flex;
  padding: 4px 16px;
  background: #363636;
  border-radius: 50px;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #9a9a9a;
  height: auto;
}
</style>
import { reactive } from "vue";
