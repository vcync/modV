<template>
  <modal
    name='expression-input'
    :classes="['v--modal', 'expression-input']"
    :width='500'
    :height='500'
    :resizable='true'
    draggable='.window-header'
    :minWidth='500'
    :minHeight='500'
  >
    <div class='window-header'>Expression editor</div>
    <h3>{{ `${moduleName}.${controlVariable}` }}</h3>

    <button @click='addNewScopeItem'>Add item to scope</button>
    <ul>
      <scope-item
        v-for='addition, key in additionalScope'
        :contents='addition'
        :name='key'
        :key='key'
        @updateName='updateScopeItemName'
        @updateContents='updateScopeItemContents'
      ></scope-item>
    </ul>

    <textarea class='expression-textarea' v-model='expression'></textarea>
  </modal>
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

<style lang='scss'>
  .expression-input {
    padding: 1em;
    border-radius: 7px;
    box-shadow: rgba(43, 43, 43, 0.34) 0px 12px 20px 6px;

    h1 {
      margin: 0;
    }
  }

  .expression-textarea {
    font-family: monospace;
    width: 100%;
    height: 63%;
    box-sizing: border-box;
    resize: none;
  }

  .window-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 22px;
    padding: 7px;
    box-sizing: border-box;
    text-align: center;
    font-size: 14px;
    line-height: 9px;
    background-color: #ddd;
    cursor: default;
  }
</style>
