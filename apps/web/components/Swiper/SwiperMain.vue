<script setup>
const { slidesPerView, spaceBetween = 0 } = defineProps([
  "slidesPerView",
  "spaceBetween",
]);
const emit = defineEmits(["SlideChange"]);
</script>

<template>
  <div class="">
    <Swiper
      :modules="[SwiperAutoplay, SwiperNavigation]"
      :slides-per-view="slidesPerView"
      :space-between="spaceBetween"
      :onSlideChange="(swiper) => emit('SlideChange', swiper)"
    >
      <slot />
      <SwipeControls />
    </Swiper>
  </div>
</template>

<style>
.swiper {
  height: 100%;
}

.swiper-slide {
  display: flex !important;
  justify-content: center;
  align-items: center;
  font-size: 18px;

  font-size: 2rem;
  font-weight: bold;
  font-family: "Roboto", sans-serif;
}

.swiper-wrapper {
}

.swiper-cards {
  width: 240px;
  height: 240px;
}

.swiper-cards .swiper-slide {
  border-radius: 6px;
  border: 1px solid black;
}
</style>
