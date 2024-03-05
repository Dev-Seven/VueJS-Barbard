<template>
  <div class="flex flex-col gap-y-4 justify-center items-center">
    <div class="flex justify-center">
      <img :src="Stars" />
    </div>
    <p class="text-sm text-white italic w-3/4 text-center">
      {{ slideData.description }}
    </p>
    <h6 class="text-base golden-text font-bebas">{{ slideData.name }}</h6>
  </div>
</template>

<script setup>
import Stars from "@/assets/svg/icons/stars.svg";
const { slideData } = defineProps(["slideData"]);

const range = (n) => {
  return Array.from({ length: n });
};
</script>

<style lang="scss" scoped></style>
