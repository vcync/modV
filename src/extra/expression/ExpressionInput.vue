<template>
  <modal
    name='expression-input'
    :classes="['v--modal', 'expression-input']"
    :width="300"
    :height="300"
  >
    <h1>Expression editor</h1>
    <h3>{{ `${moduleName}.${controlVariable}` }}</h3>
    <textarea class='expression-textarea' v-model='expression'></textarea>
  </modal>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';

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
        getAssignment: 'assignment'
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
          if(!this.assignment) return 'value';
          return this.assignment.expression;
        },
        set(expression) {
          this.addExpression({
            expression,
            moduleName: this.moduleName,
            controlVariable: this.controlVariable
          });
        }
      }
    },
    methods: {
      ...mapActions('expression', [
        'addExpression'
      ])
    }
  };
</script>

<style lang='scss'>
  .expression-input {
    padding: 1em;

    h1 {
      margin: 0;
    }
  }

  .expression-textarea {
    font-family: monospace;
    width: 100%;
    height: 64%;
    box-sizing: border-box;
  }
</style>