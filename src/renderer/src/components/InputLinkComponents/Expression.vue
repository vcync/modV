<template>
  <grid columns="4" v-infoView="{ title: iVTitle, body: iVBody, id: iVID }">
    <c span="1..">
      <grid columns="4">
        <c span="2+2">
          <Textarea v-model="expression" @change="updateExpression" />
        </c>
      </grid>
    </c>
  </grid>
</template>

<script>
export default {
  props: {
    inputId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      iVTitle: "Expression",
      iVBody:
        "Expressions allow assigned input values to be shaped with JavaScript syntax and math. Multiplication, division, custom intensity curves - whatever goes. `value` is the incoming number, want to make everything 3 times as punchy? `value * 3`. Need to soften things a little? `value / 2`. More examples can be found on modV's website under Guides, Expression.",
      iVID: "Expression",

      expression: "value",
      expressionId: null
    };
  },

  created() {
    this.restoreExpressionValues();
  },

  methods: {
    async updateExpression() {
      const { inputId, expression, expressionId } = this;

      if (expressionId) {
        this.expressionId = await this.$modV.store.dispatch(
          "expressions/update",
          {
            id: expressionId,
            expression
          }
        );
      } else {
        this.expressionId = await this.$modV.store.dispatch(
          "expressions/create",
          {
            expression,
            inputId
          }
        );
      }
    },

    restoreExpressionValues(inputId = this.inputId) {
      const expressionAssignment = this.$modV.store.getters[
        "expressions/getByInputId"
      ](inputId);

      if (expressionAssignment) {
        this.expression = expressionAssignment.expression;
        this.expressionId = expressionAssignment.id;
      } else {
        this.expression = "value";
        this.expressionId = null;
      }
    }
  },

  watch: {
    inputId(inputId) {
      this.restoreExpressionValues(inputId);
    }
  }
};
</script>

<style scoped></style>
