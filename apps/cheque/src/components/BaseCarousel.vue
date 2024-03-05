<template>
  <swiper
    v-if="items.length"
    :slidesPerView="'auto'"
    :spaceBetween="20"
    :freeMode="true"
  >
    <swiper-slide v-for="item in items" :key="item.id" class="swiper-slide">
      <slot :item="item"></slot>
    </swiper-slide>
  </swiper>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { defineProps, withDefaults } from "vue";

import "swiper/css";
import "swiper/css/free-mode";

withDefaults(
  defineProps<{
    items: { value: string; id: string }[];
  }>(),
  {},
);
</script>

<style lang="scss" scoped>
.swiper-slide {
  width: fit-content;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
