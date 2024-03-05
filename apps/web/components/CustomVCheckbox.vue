<template>
  <div class="flex gap-x-2 cursor-pointer py-1" @click="emit('changeHandler')">
    <img :src="value ? Checked : UnChecked" />
    <p
      class="text-[0.875rem] font-montserrat text-white opacity-60"
      :v-if="label"
    >
      {{ label }}
    </p>
  </div>
</template>

<script setup>
import UnChecked from "@/assets/svg/icons/unChecked.svg";
import Checked from "@/assets/svg/icons/checked.svg";

const { label, value } = defineProps(["label", "value"]);
const emit = defineEmits(["changeHandler"]);

// const isChecked = useState("isChecked", () => false);
</script>

<style lang="scss" scoped></style>
