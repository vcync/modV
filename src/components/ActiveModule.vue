<template>
  <div class="active-module">
    <div class="head">
      <div class="checkbox">
        <input type="checkbox" v-model="enabled" :id="id" />
      </div>
      <div class="label">
        <label :for="id">{{ name }}</label>
      </div>
      <div class="handle"></div>
      <div class="show-more">
        <button @click="showMore = !showMore">
          {{ showMore ? "▲" : "▼" }}
        </button>
      </div>
    </div>

    <div class="controls">
      <div>
        <label
          >Alpha<input type="range" v-model="alpha" min="0" max="1" step="0.01"
        /></label>
      </div>
      <div>
        <label
          >Blend<select v-model="blendMode">
            <optgroup
              v-for="group in blendModes"
              :label="group.label"
              :key="group.label"
            >
              <option
                v-for="mode in group.children"
                :value="mode.value"
                :key="mode.label"
                >{{ mode.label }}</option
              >
            </optgroup>
          </select></label
        >
      </div>
      <span v-if="module.props && showMore">
        <Control v-for="key in getProps(id)" :id="id" :prop="key" :key="key" />
      </span>
    </div>
  </div>
</template>

<script>
import Control from "@/components/Control";
import blendModes from "../util/composite-operations";

export default {
  props: ["id"],

  data() {
    return {
      blendModes,
      showMore: false
    };
  },

  computed: {
    module() {
      return this.$modV.store.state.modules.active[this.id];
    },

    alpha: {
      get() {
        return this.$modV.store.state.modules.active[this.id].meta.alpha;
      },
      set(value) {
        this.$modV.store.commit("modules/UPDATE_ACTIVE_MODULE_META", {
          id: this.id,
          metaKey: "alpha",
          data: value
        });
      }
    },

    blendMode: {
      get() {
        return (
          this.$modV.store.state.modules.active[this.id].meta
            .compositeOperation || "normal"
        );
      },
      set(value) {
        this.$modV.store.commit("modules/UPDATE_ACTIVE_MODULE_META", {
          id: this.id,
          metaKey: "compositeOperation",
          data: value
        });
      }
    },

    enabled: {
      get() {
        return this.$modV.store.state.modules.active[this.id].meta.enabled;
      },
      set(value) {
        this.$modV.store.commit("modules/UPDATE_ACTIVE_MODULE_META", {
          id: this.id,
          metaKey: "enabled",
          data: value
        });
      }
    },

    name() {
      return this.module.meta.name;
    }
  },

  components: {
    Control
  },

  methods: {
    getProps(id) {
      const module = this.$modV.store.state.modules.active[id];

      return Object.keys(this.module.props).filter(
        key =>
          module.props[key].type === "int" ||
          module.props[key].type === "float" ||
          module.props[key].type === "text" ||
          module.props[key].type === "bool" ||
          module.props[key].type === "color" ||
          module.props[key].type === "vec2" ||
          module.props[key].type === "tween"
      );
    }
  }
};
</script>

<style scoped>
.active-module .head {
  display: flex;
}

.active-module .head .label {
  font-size: 16px;
  flex-grow: 1;
  margin: 0 5px;
}

.active-module .show-more {
  align-self: flex-end;
}

input[type="checkbox"] {
  margin: 0;
}

.handle {
  font-size: 20px;
  vertical-align: middle;
  width: 16px;
  border: 1px solid;
  border-radius: 50%;
  cursor: -webkit-grab;
}
</style>

<style>
body .active-module .animated .handle {
  cursor: -webkit-grabbing !important;
}
</style>
