<template>
  <div class="slider-section">
    <div class="component-container">
      <h3 class="text-center component-title">
        include one of the products Used in your service?
      </h3>
      <base-carousel :items="services">
        <template v-slot="item">
          <div class="services__item">
            <span class="services__item--title"
              >HAIR STYLING
              {{ item }}
            </span>
            <div class="services__item--preview">
              <img
                class="mx-auto logo mb-7"
                src="/assets/images/service.svg"
                alt="service"
              />
            </div>
            <span class="services__item--sub-title">Reuzel Fiber Pomade</span>
            <span class="services__item--price">&#8363;480.000</span>
          </div>
        </template>
      </base-carousel>

      <!-- <div class="services__list"></div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import BaseCarousel from "../BaseCarousel.vue";

withDefaults(
  defineProps<{
    services?: [] | any;
  }>(),
  {
    services: [
      {
        id: 1,
      },
      {
        id: 2,
      },
      {
        id: 3,
      },
      {
        id: 5,
      },
      {
        id: 6,
      },
    ],
  },
);
</script>

<style lang="scss" scoped>
.component-title {
  margin: 0 0 1.375rem;
}
.slider-section {
  overflow: hidden;
  position: relative;
  margin: 0 -0.9375rem;
  padding: 0 0 1.9375rem;
  &:after {
    content: "";
    z-index: 10;
    pointer-events: none;
    position: absolute;
    top: 0;
    bottom: 0;

    width: 5rem;
  }
  &:after {
    left: auto;
    right: 0;
    background: linear-gradient(270deg, #000000 0%, rgba(0, 0, 0, 0) 100%);
  }
}
:deep(.swiper) {
  overflow: visible !important;
}
.services {
  &__list {
    display: flex;
    grid-gap: 1.25rem;
    width: 100%;
    overflow-y: auto;
    align-items: center;
    justify-content: center;
  }
  &__item {
    flex: 0 0 11.25rem;
    width: 11.25rem;
    font-family: var(--font-1);
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0px 0.25rem 0.25rem rgba(0, 0, 0, 0.25);
    border-radius: 0.3125rem;
    padding: 0.375rem 0.625rem 0.5rem 0.625rem;
    &--title {
      font-size: 0.75rem;
      text-align: center;
      color: var(--color-beige);
      display: block;
      margin-bottom: 0.625rem;
    }
    &--preview {
      margin-bottom: 0.3125rem;
      height: 6.3125rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
        margin: 0 auto;
      }
    }
    &--sub-title {
      display: block;
    }
    &--price {
      display: block;
    }
  }
}
</style>
