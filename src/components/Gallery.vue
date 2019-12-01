<template>
  <div class="gallery">
    <grid columns="4">
      <c span="1..">
        <input
          type="text"
          placeholder="search"
          v-model="searchTerm"
          ref="searchField"
        />
      </c>
      <c span="1.." class="results">
        <grid columns="4">
          <c
            v-for="(modules, renderer) in modulesByRenderer"
            :key="renderer"
            class="renderer"
            span="4"
            v-show="renderersToShow.indexOf(renderer) > -1"
          >
            <h1>{{ renderer }}</h1>
            <Container
              behaviour="copy"
              group-name="modules"
              :get-child-payload="
                e => getChildPayload('modulesByRenderer', e, renderer)
              "
              tag="grid"
              columns="4"
            >
              <Draggable
                v-for="(module, name) in modules"
                :key="name"
                tag="c"
                ghost-class="ghost"
                v-show="modulesToShow.indexOf(name) > -1"
                tabindex="0"
                @keydown.native.enter="addModuleToFocusedGroup(module)"
              >
                <GalleryItem
                  v-if="groupId"
                  :moduleName="name"
                  :groupId="groupId"
                />
              </Draggable>
            </Container>
          </c>

          <c span="1.." v-show="!renderersToShow.length && searchTerm.length">
            <h2>Couldn't find {{ searchTerm }}.</h2>
          </c>
        </grid>
      </c>
    </grid>
  </div>
</template>

<script>
import { Container, Draggable } from "vue-smooth-dnd";
import GalleryItem from "./GalleryItem";

export default {
  components: {
    Container,
    Draggable,
    GalleryItem
  },

  data() {
    return {
      groupId: null,
      searchTerm: "",
      renderers: {},
      renderersToShow: [],
      modulesToShow: []
    };
  },

  computed: {
    registeredModules() {
      return this.$modV.store.state.modules.registered;
    },

    modulesByRenderer() {
      return Object.keys(this.registeredModules).reduce((obj, key) => {
        const module = this.registeredModules[key];
        const { type, name } = module.meta;

        if (!(type in obj)) {
          obj[type] = {};
        }

        obj[type][name] = module;

        return obj;
      }, {});
    }
  },

  async mounted() {
    const group = await this.$modV.store.dispatch("groups/createGroup", {
      name: "modV internal Gallery Group",
      hidden: true,
      enabled: true,
      clearing: true
    });

    this.groupId = group.id;
    this.updateModulesAndRenderersToShow();

    window.addEventListener("keydown", this.keyDownListener.bind(this));
  },

  beforeDestroy() {
    // this.$modV.store.commit("groups/REMOVE_GROUP", this.groupId);
    window.removeEventListener("keydown", this.keyDownListener.bind(this));
  },

  methods: {
    getChildPayload(group, index, renderer) {
      const moduleName = this[group][renderer][
        Object.keys(this[group][renderer])[index]
      ].meta.name;

      return { moduleName, collection: "gallery" };
    },

    search(textIn, termIn) {
      const text = textIn.toLowerCase().trim();
      const term = termIn.toLowerCase().trim();
      if (termIn.length < 1) return true;

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
      if (e.keyCode === 114 || ((e.ctrlKey || e.metaKey) && e.keyCode === 70)) {
        e.preventDefault();
        this.$refs.searchField.focus();
        this.$refs.searchField.select();
      }
    },

    async addModuleToFocusedGroup(moduleIn) {
      const groupId = this.$store.state["ui-groups"].focused;
      if (!groupId) {
        return;
      }

      const module = await this.$modV.store.dispatch(
        "modules/makeActiveModule",
        { moduleName: moduleIn.meta.name }
      );

      this.$modV.store.commit("groups/ADD_MODULE_TO_GROUP", {
        moduleId: module.$id,
        groupId,
        position: this.$modV.store.state.groups.groups.find(
          group => group.id === groupId
        ).modules.length
      });
    }
  },

  watch: {
    searchTerm() {
      this.updateModulesAndRenderersToShow();
    }
  }
};
</script>

<style lang="css" scoped>
.hidden {
  display: none !important;
}

div.gallery {
  padding: 1em;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);

  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  overflow-y: auto;
  height: 100%;
}

div.gallery > grid {
  height: 100%;
}

.results {
  height: 100%;
  overflow-y: scroll;
}
</style>
