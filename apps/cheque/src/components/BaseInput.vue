<template>
  <input
    v-if="type === 'number'"
    ref="inputRef"
    v-bind="$attrs"
    class="input form-field"
    :placeholder="label"
    v-model="value"
    type="text"
    v-maska="bindedObject"
    data-maska="9.99#"
    data-maska-tokens="9:[0-9]:repeated"
    data-maska-reversed
  />
  <input
    v-else
    ref="inputRef"
    v-bind="$attrs"
    class="input form-field"
    :placeholder="label"
    v-model="value"
    type="text"
  />
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  reactive,
  onMounted,
  defineProps,
  defineEmits,
} from "vue";
import { vMaska } from "maska";

const props = defineProps({
  modelValue: {
    required: true,
  },
  type: {
    type: String,
    default: "text",
  },
  autofocus: Boolean,
  label: String,
});

const emit = defineEmits(["update:modelValue"]);

const inputRef = ref<HTMLInputElement | null>(null);

const focus = () => {
  inputRef?.value?.focus();
};

onMounted(() => {
  if (props.autofocus) {
    setTimeout(() => {
      focus();
    }, 100);
  }
});

const bindedObject: {
  masked: string;
  unmasked: string;
  completed: boolean;
} = reactive({
  masked: "",
  unmasked: "",
  completed: true,
});

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value: any) {
    if (props.type === "number") {
      emit("update:modelValue", bindedObject.unmasked);
    } else emit("update:modelValue", value);
  },
});
</script>
