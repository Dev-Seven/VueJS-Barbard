<template>
  <label class="check">
    <input class="check__input" type="checkbox" v-model="model" />

    <span class="check__custom"></span>
    <span class="check__label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  modelValue: Boolean,
  label: String,
});

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});
</script>

<style lang="scss" scoped>
.check {
  display: inline-flex;
  align-items: center;
  &__input {
    height: 0;
    width: 0;
    visibility: hidden;
    opacity: 0;
    &:checked {
      & + .check__custom {
        background: #f6d69a;
        &:after {
          left: calc(100% - 0.1875rem);
          transform: translateX(-100%);
          background: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
  &__custom {
    cursor: pointer;
    text-indent: -9999px;
    width: 2.5rem;
    height: 1.375rem;
    display: block;
    position: relative;

    background: gray;
    opacity: 0.8;
    border: 1px solid rgba(255, 255, 255, 0.7);
    box-shadow: inset 0.25rem 0.25rem 0.25rem rgba(0, 0, 0, 0.25);
    border-radius: 1.25rem;
    &:after {
      content: "";
      position: absolute;
      top: 0.125rem;
      left: 0.1875rem;
      width: 1rem;
      height: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transition: 0.3s;
    }
  }
  &__label {
    display: block;
    padding-left: 1.0625rem;
    font-family: var(--font-1);
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>
