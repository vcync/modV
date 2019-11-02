<template>
  <div class="gallery">
    <grid columns="4">
      <c span="1..">
        <input type="text" placeholder="search" v-model="searchTerm" />
      </c>
      <c span="1.." class="results">
        <grid columns="4">
          <c
            v-for="(modules, renderer) in modulesByRenderer"
            :key="renderer"
            class="renderer"
            span="4"
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
              >
                <GalleryItem
                  v-if="groupId"
                  :moduleName="name"
                  :groupId="groupId"
                />
              </Draggable>
            </Container>
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
      renderers: {}
    };
  },

  computed: {
    registeredModules() {
      return this.$modV.store.state.modules.registered;
    },

    modulesByRenderer() {
      return Object.keys(this.registeredModules).reduce((obj, key) => {
        const module = this.registeredModules[key];
        const { search, searchTerm } = this;
        const { type, name } = module.meta;

        if (!search(name, searchTerm)) {
          return obj;
        }

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
  },

  beforeDestroy() {
    // this.$modV.store.commit("groups/REMOVE_GROUP", this.groupId);
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
