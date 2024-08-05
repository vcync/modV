/* eslint-disable vue/no-reserved-component-names */
import Button from "./Button.vue";
import Checkbox from "./Checkbox.vue";
import Number from "./Number.vue";
import Range from "./Range.vue";
import Select from "./Select.vue";
import Textarea from "./Textarea.vue";
import TextInput from "./TextInput.vue";

export const installInputs = (app) => {
  app.component("Button", Button);
  app.component("Checkbox", Checkbox);
  app.component("Number", Number);
  app.component("Range", Range);
  app.component("Select", Select);
  app.component("Textarea", Textarea);
  app.component("TextInput", TextInput);
};
