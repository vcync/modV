<template>
  <div class="modal-card expression-editor">
    <header class="modal-card-head">
      <p class="modal-card-title">Expression editor</p>
    </header>
    <section class="modal-card-body">
      <h3>{{ `${moduleName}.${controlVariable}` }}</h3>

      <button @click="addNewScopeItem" class="button">Add item to scope</button>
      <ul>
        <scope-item
          v-for="addition, key in additionalScope"
          :contents="addition"
          :name="key"
          :key="key"
          @updateName="updateScopeItemName"
          @updateContents="updateScopeItemContents"
        ></scope-item>
      </ul>

      <b-field label="Expression">
        <b-input type="textarea" v-model="expression"></b-input>
      </b-field>
    </section>
    <!-- <footer class="modal-card-foot"></footer> -->
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  import scopeItem from './ScopeItem';

  export default {
    name: 'expression',
    props: [],
    data() {
      return {

      };
    },
    computed: {
      ...mapGetters('expression', {
        activeControlData: 'activeControlData',
        getAssignment: 'assignment',
      }),
      moduleName() {
        return this.activeControlData.moduleName;
      },
      controlVariable() {
        return this.activeControlData.controlVariable;
      },
      assignment() {
        return this.getAssignment(this.moduleName, this.controlVariable) || false;
      },
      expression: {
        get() {
          if (!this.assignment) return 'value';
          return this.assignment.expression;
        },
        set(expression) {
          this.addExpression({
            expression,
            moduleName: this.moduleName,
            controlVariable: this.controlVariable,
          });
        },
      },
      additionalScope: {
        get() {
          if (!this.assignment) return {};
          return this.assignment.additionalScope;
        },
        set(expression) {
          this.addExpression({
            expression,
            moduleName: this.moduleName,
            controlVariable: this.controlVariable,
          });
        },
      },
    },
    methods: {
      ...mapActions('expression', [
        'addExpression',
        'addToScope',
        'renameScopeItem',
        'updateScopeItem',
      ]),
      addNewScopeItem() {
        const scopeAdditions = {};
        scopeAdditions.newItem = 'function a(x) { return x * 2 }';
        this.addToScope({
          moduleName: this.moduleName,
          controlVariable: this.controlVariable,
          scopeAdditions,
        });
      },
      updateScopeItemName(oldName, newName) {
        this.renameScopeItem({
          oldName,
          newName,
          moduleName: this.moduleName,
          controlVariable: this.controlVariable,
        });
      },
      updateScopeItemContents(name, contents) {
        this.updateScopeItem({
          name,
          contents,
          moduleName: this.moduleName,
          controlVariable: this.controlVariable,
        });
      },
    },
    components: {
      scopeItem,
    },
  };
</script>

<style lang="scss">
  .expression-editor textarea {
    font-family: monospace;
  }
</style>
