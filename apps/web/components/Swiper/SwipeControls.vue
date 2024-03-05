<template>
  <button
    @click="swiper.slidePrev()"
    class="swiper-button-prev"
    :class="isBg && 'bg-set'"
    ref="prevButton"
  >
    <img alt="prev" :src="PrevIcon" />
  </button>
  <button
    @click="swiper.slideNext()"
    class="swiper-button-next"
    :class="isBg && 'bg-set'"
    ref="nextButton"
  >
    <img alt="next" :src="NextIcon" />
  </button>
</template>

<script setup>
import { ref, onMounted } from "vue";
import NextIcon from "@/assets/svg/icons/next-icon.svg";
import PrevIcon from "@/assets/svg/icons/prev-icon.svg";

// Other imports...
const { isBg = true } = defineProps(["isBg"]);

const prevButton = ref(null);
const nextButton = ref(null);

onMounted(() => {
  const mainContainer = document.querySelector(".main-container1");
});

const swiper = useSwiper();
</script>

<style lang="css">
.swiper-button-prev:after,
.swiper-button-next:after {
  content: "" !important;
}
.swiper-button-prev,
.swiper-button-next {
  background-color: #0a0a1c;
  padding: 0px;
}

.swiper-button-prev {
  left: -2px !important;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.swiper-button-next {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  right: -2px !important;
}

@media only screen and (max-width: 599px) {
  .swiper-button-prev,
  .swiper-button-next {
    background-color: #0a0a1c;
    padding: 0px;
    scale: 1.2;
  }

  .swiper-button-prev {
    left: -1px !important;
  }

  .swiper-button-next {
    right: -1px !important;
  }
}
</style>
