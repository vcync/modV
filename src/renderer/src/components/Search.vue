<template>
  <div ref="search" class="search h1">
    <figure
      class="search-highlight"
      :class="{ hide: !showHighlight }"
      :style="searchHighlightStyle"
    ></figure>

    <div v-show="showSearch" class="search-box-container">
      <input
        ref="searchBox"
        v-model="searchTerm"
        type="text"
        class="search-box"
        :class="{ 'has-results': resultsKeys.length }"
        placeholder="Search"
        @keypress.enter="selectKeyboardHighlightedItem"
        @keydown.prevent.up="decrementKeyboardIndex"
        @keydown.prevent.down="incrementKeyboardIndex"
      />

      <ul ref="results" class="results h3">
        <li
          v-for="(key, index) in resultsKeys"
          :key="key"
          :class="{
            selected: index === keyboardSelectedIndex,
          }"
          @mousedown="select(results[key].id)"
          @mousemove="mouseMoveHandler(results[key].id, index)"
        >
          {{ results[key].type }}: {{ results[key].title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showSearch: false,
      searchTerm: "",
      results: {},
      showHighlight: false,
      searchHighlightStyle: { transform: "", width: "", height: "" },

      keyboardSelectedIndex: 0,
    };
  },

  computed: {
    resultsKeys() {
      return Object.keys(this.results);
    },
  },

  watch: {
    searchTerm(term) {
      this.results = this.$store.getters["search/search"](term);
      if (term.length) {
        this.highlight(this.resultsKeys[this.keyboardSelectedIndex]);
      } else {
        this.keyboardSelectedIndex = 0;
      }
    },
  },

  mounted() {
    window.addEventListener("keydown", this.keyDownListener);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.keyDownListener);
    window.removeEventListener("mousedown", this.mouseDownListener);
  },

  methods: {
    closeSearch(showHighlight = false) {
      window.removeEventListener("mousedown", this.mouseDownListener);

      this.showSearch = false;
      this.showHighlight = showHighlight;
      this.searchTerm = "";
    },

    keyDownListener(e) {
      if (
        e.keyCode === 114 ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 70)
      ) {
        window.addEventListener("mousedown", this.mouseDownListener);

        this.showSearch = true;

        this.$nextTick(() => {
          this.$refs.searchBox.focus();
        });
      }

      if (e.keyCode === 27 && this.showSearch) {
        this.closeSearch();
      }
    },

    mouseDownListener(e) {
      if (!this.$refs.search.contains(e.target)) {
        this.closeSearch();
      }
    },

    select(id) {
      const { isGLElement } = this.results[id];
      const el = document.querySelector(`*[data-searchId="${id}"]`);
      let vnode = el.__vue__;

      if (isGLElement) {
        while (!vnode.glObject) {
          vnode = vnode.$parent;
        }
      }

      const requiresFocus = !this.highlight(id);

      if (requiresFocus) {
        vnode.focus();
        this.highlight(id);
      }

      this.closeSearch(requiresFocus);

      if (requiresFocus) {
        setTimeout(() => {
          this.showHighlight = false;
        }, 600);
      }
    },

    highlight(id) {
      const el = document.querySelector(`*[data-searchId="${id}"]`);
      if (!el) {
        return;
      }

      let vnode = el.__vue__;

      const { focusElement, isGLElement, focusParent } = this.results[id];

      if (!focusElement && isGLElement) {
        while (!vnode.glObject) {
          vnode = vnode.$parent;
        }
      } else if (!isGLElement && focusParent) {
        vnode = vnode.$parent;
      }

      vnode.$el.scrollIntoView({ block: "nearest" });

      const rect = vnode.$el.getBoundingClientRect();

      this.showHighlight = !(
        rect.top === 0 &&
        rect.left === 0 &&
        rect.width === 0 &&
        rect.height === 0
      );

      if (this.showHighlight) {
        this.searchHighlightStyle.transform = `translateY(${rect.top}px) translateX(${rect.left}px)`;
        this.searchHighlightStyle.width = `${rect.width}px`;
        this.searchHighlightStyle.height = `${rect.height}px`;
      }

      return this.showHighlight;
    },

    selectKeyboardHighlightedItem() {
      this.select(this.resultsKeys[this.keyboardSelectedIndex]);
    },

    incrementKeyboardIndex() {
      if (this.keyboardSelectedIndex + 1 < this.resultsKeys.length) {
        this.keyboardSelectedIndex += 1;
        this.scrollSelectedItemIntoView();
      }

      this.highlight(this.resultsKeys[this.keyboardSelectedIndex]);
    },

    decrementKeyboardIndex() {
      if (this.keyboardSelectedIndex - 1 > -1) {
        this.keyboardSelectedIndex -= 1;
        this.scrollSelectedItemIntoView();

        this.highlight(this.resultsKeys[this.keyboardSelectedIndex]);
      }
    },

    mouseMoveHandler(id, index) {
      if (this.keyboardSelectedIndex === index) {
        return;
      }

      this.keyboardSelectedIndex = index;
      this.highlight(id);
    },

    scrollSelectedItemIntoView() {
      this.$nextTick(() => {
        const { results } = this.$refs;
        const selected = results.querySelector(".selected");

        if (selected) {
          selected.scrollIntoView({ block: "nearest" });
        }
      });
    },
  },
};
</script>

<style scoped>
.search {
  position: fixed;
  top: 33%;
  left: 0;
  right: 0;
  height: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  margin: 0;
  z-index: 1;
}

.search .search-box-container {
  background: var(--background-color-1);
  border-radius: 5px;
  padding: 0.5rem;
  z-index: 1;
}

.search .search-box-container .search-box {
  color: var(--background-color);
  background: var(--foreground-color-1);
  border-radius: 5px;
  width: 100%;
  padding-left: var(--baseline);
  padding-right: var(--baseline);
}

.search .search-box-container .search-box.has-results {
  border-radius: 5px 5px 0 0;
}

.search .search-box-container .results {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 40vh;
  overflow-y: scroll;
}

.search .search-box-container .results li {
  margin: 0;
  padding: calc(var(--baseline) / 3);
  padding-left: var(--baseline);
  padding-right: var(--baseline);
}
.search .search-box-container .results:last-child {
  border-radius: 0 0 5px 5px;
}

.search .search-box-container .results .selected {
  background: var(--foreground-color-1);
}

.search .search-highlight {
  border: 2px var(--focus-color) solid;
  background-color: rgba(var(--focus-color-rgb), 0.1);
  position: fixed;
  top: 0;
  left: 0;
  opacity: 1;
  will-change: transform, width, height;

  transition:
    all 200ms,
    opacity 600ms;

  pointer-events: none;
}

.search .search-highlight.hide {
  opacity: 0;
}
</style>
