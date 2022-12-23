<template>
  <div ref="fontComponent">
    <input
      ref="fontComponentInput"
      :value="searchTerm"
      @input="input"
      @focus="openFontList"
      @keypress.enter="selectHighlightedItem"
      @keydown.prevent.up="decrementKeyboardIndex"
      @keydown.prevent.down="incrementKeyboardIndex"
      :style="{ fontFamily: value }"
    />

    <ul class="searchable-select" v-show="showFontList">
      <li
        v-for="(font, index) in fontsToShow"
        :value="font"
        :key="font"
        @click="clickItem(font)"
        :class="{
          selected: value === font || index === keyboardSelectedIndex,
          keyboardSelected: index === keyboardSelectedIndex
        }"
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
    value: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      showFontList: false,
      searchTerm: "",
      keyboardSelectedIndex: -1,
      fuse: null
    };
  },

  async created() {
    this.searchTerm = this.value;
    this.setupFuse();
  },

  mounted() {
    this.scrollSelectedItemIntoView();
  },

  beforeDestroy() {
    window.removeEventListener("click", this.checkClick);
  },

  computed: {
    fonts() {
      return this.$modV._store.getters["fonts/fonts"];
    },

    fontsToShow() {
      const { fonts, fuse, searchTerm, value } = this;
      if (value === searchTerm || !searchTerm) {
        return fonts;
      }

      return fuse
        .search(searchTerm)
        .sort((a, b) => a.score - b.score)
        .map(result => result.item);
    }
  },

  methods: {
    input(e) {
      const {
        target: { value }
      } = e;

      this.searchTerm = value;
    },

    setFont(font) {
      this.$emit("input", font);
      this.searchTerm = font;
    },

    openFontList() {
      this.showFontList = true;
      window.addEventListener("click", this.checkClick);
      this.keyboardSelectedIndex = this.fonts.indexOf(this.value);
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

      // eslint-disable-next-line no-for-each/no-for-each
      fonts.forEach(fontName => fuse.add(fontName));
      this.fuse = fuse;
    }
  },

  watch: {
    fonts(fonts) {
      this.setupFuse(fonts);
    }
  }
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
