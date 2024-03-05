<template>
  <label class="base-checkbox">
    <input type="checkbox" v-model="isChecked" v-bind="$attrs" />
    <span class="custom"></span>
  </label>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";

const props = defineProps(["value"]);
const emit = defineEmits();

const isChecked = computed({
  get() {
    return props.value;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});
</script>

<style lang="scss" scoped>
.base-checkbox {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: 1rem;
  height: 1rem;

  input[type="checkbox"] {
    display: none;
  }

  .custom {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0.1875rem;
    border: 1px solid #fff;

    &:after {
      content: "";
      position: absolute;
      top: -0.3125rem;
      left: -0.25rem;
      width: 1.5625rem;
      height: 1.1652rem;
      opacity: 0;

      background-image: url("/assets/images/checkbox.svg");
      background-size: cover;
    }
  }

  input[type="checkbox"]:checked + .custom:after {
    opacity: 1;
  }
}
</style>
