<template>
  <div ref="fontComponent">
    <input
      ref="fontComponentInput"
      :value="searchTerm"
      :style="{ fontFamily: modelValue }"
      @input="input"
      @focus="openFontList"
      @keypress.enter="selectHighlightedItem"
      @keydown.prevent.up="decrementKeyboardIndex"
      @keydown.prevent.down="incrementKeyboardIndex"
    />

    <ul v-show="showFontList" ref="fontList" class="searchable-select">
      <li
        v-for="(font, index) in fontsToShow"
        :key="font"
        :value="font"
        :class="{
          selected: modelValue === font || index === keyboardSelectedIndex,
          keyboardSelected: index === keyboardSelectedIndex,
        }"
        @click="clickItem(font)"
      >
        <span :style="{ fontFamily: font }">{{ font }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import Fuse from "fuse.js";

export default {
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],

  data() {
    return {
      showFontList: false,
      searchTerm: "",
      keyboardSelectedIndex: -1,
      fuse: null,
    };
  },

  computed: {
    fonts() {
      return this.$modV._store.getters["fonts/fonts"];
    },

    fontsToShow() {
      const { fonts, fuse, searchTerm, modelValue } = this;
      if (modelValue === searchTerm || !searchTerm) {
        return fonts;
      }

      return fuse
        .search(searchTerm)
        .sort((a, b) => a.score - b.score)
        .map((result) => result.item);
    },
  },

  watch: {
    fonts(fonts) {
      this.setupFuse(fonts);
    },
  },

  async created() {
    this.searchTerm = this.modelValue;
    this.setupFuse();
  },

  mounted() {
    this.scrollSelectedItemIntoView();
  },

  beforeUnmount() {
    window.removeEventListener("click", this.checkClick);
  },

  methods: {
    input(e) {
      const {
        target: { value },
      } = e;

      this.searchTerm = value;
      this.$nextTick(() => {
        this.$refs.fontList.scrollTo(0, 0);
      });
    },

    setFont(font) {
      this.$emit("update:modelValue", font);
      this.searchTerm = font;
    },

    openFontList() {
      this.showFontList = true;
      window.addEventListener("click", this.checkClick);
      this.keyboardSelectedIndex = this.fonts.indexOf(this.modelValue);
      this.scrollSelectedItemIntoView();
    },

    checkClick(e) {
      const { fontComponent } = this.$refs;

      if (e.target !== fontComponent && !fontComponent.contains(e.target)) {
        this.hideFontList();
      }
    },

    hideFontList() {
      this.showFontList = false;
      this.$refs.fontComponentInput.blur();
      window.removeEventListener("click", this.checkClick);
    },

    search(textIn, termIn) {
      const text = textIn.toLowerCase().trim();
      const term = termIn.toLowerCase().trim();
      if (termIn.length < 1) {
        return true;
      }

      return text.indexOf(term) > -1;
    },

    selectHighlightedItem() {
      let index = 0;

      if (this.keyboardSelectedIndex > -1) {
        index = this.keyboardSelectedIndex;
      }

      this.setFont(this.fontsToShow[index]);
      this.hideFontList();
    },

    incrementKeyboardIndex() {
      if (this.keyboardSelectedIndex + 1 < this.fontsToShow.length) {
        this.keyboardSelectedIndex += 1;

        this.scrollSelectedItemIntoView();
      }
    },

    decrementKeyboardIndex() {
      if (this.keyboardSelectedIndex - 1 > -1) {
        this.keyboardSelectedIndex -= 1;
        this.scrollSelectedItemIntoView();
      }
    },

    clickItem(font) {
      this.setFont(font);
      this.hideFontList();
    },

    scrollSelectedItemIntoView() {
      this.$nextTick(() => {
        const { fontComponent } = this.$refs;
        const selected = fontComponent.querySelector(".keyboardSelected");

        if (selected) {
          selected.scrollIntoView({ block: "nearest" });
        }
      });
    },

    setupFuse(fontsIn) {
      const fonts = fontsIn ?? this.fonts;

      const fuse = new Fuse([], { includeScore: true });

      fonts.forEach((fontName) => fuse.add(fontName));
      this.fuse = fuse;
    },
  },
};
</script>

<style>
.searchable-select {
  height: 100px;
  overflow-y: scroll;
  padding: 0;
}

.searchable-select li {
  list-style: none;
  margin: 0;
}

.searchable-select li.selected,
.searchable-select li:hover {
  background-color: var(--foreground-color-3);
}
</style>
