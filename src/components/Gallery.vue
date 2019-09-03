<template>
  <div class="gallery">
    <div
      v-for="(modules, renderer) in modulesByRenderer"
      :key="renderer"
      class="renderer"
    >
      <h1>{{ renderer }}</h1>
      <Container
        behaviour="copy"
        group-name="modules"
        :get-child-payload="
          e => getChildPayload('modulesByRenderer', e, renderer)
        "
        tag="div"
        class="modules"
      >
        <Draggable v-for="(module, name) in modules" class="module" :key="name">
          {{ name }}
          <GalleryItem :moduleName="name" :groupId="groupId" />
        </Draggable>
      </Container>

      <!-- <div class="modules">
        <div v-for="(module, name) in modules" :key="name" class="module">
          {{ name }}
        </div>
      </div> -->
    </div>
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
      groupId: ""
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

  async created() {
    const group = await this.$modV.store.dispatch("groups/createGroup", {
      name: "modV internal Gallery Group",
      hidden: true,
      enabled: true,
      clearing: true
    });

    this.groupId = group.id;
  },

  beforeDestroy() {
    this.$modV.store.commit("groups/REMOVE_GROUP", this.groupId);
  },

  methods: {
    getChildPayload(group, index, renderer) {
      const moduleName = this[group][renderer][
        Object.keys(this[group][renderer])[index]
      ].meta.name;
      console.log(group, index, renderer, moduleName);

      return { moduleName, collection: "gallery" };
    }
  }
};
</script>

<style lang="css" scoped>
div.gallery {
  font-family: monospace;
  position: fixed;
  top: 0;
  left: 0;

  padding: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);

  display: flex;
  width: 100%;
  flex-direction: column;
  height: 50%;

  overflow-y: auto
}

div.modules {
  display: flex;
  justify-content: space-around;
  align-content: space-around;
  flex-wrap: wrap;
}

div.module {
  width: 15%;
}
</style>
