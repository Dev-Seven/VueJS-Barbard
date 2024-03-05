<template>
  <textarea
    v-model="value"
    v-bind="$attrs"
    class="form-field textarea"
    :placeholder="label"
    type="text"
    :style="{ height: height }"
  />
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label: string;
    height?: string;
  }>(),
  {
    height: "6.1875rem",
  },
);

const emit = defineEmits(["update:modelValue"]);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});
</script>

<style lang="scss" scoped>
textarea.form-field {
  resize: none;
}
</style>
