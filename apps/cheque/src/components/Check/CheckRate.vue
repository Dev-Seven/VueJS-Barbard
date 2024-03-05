<template>
  <div class="rate__holder">
    <div class="">
      <h3 class="mb-4 text-center component-gradient-title">
        How was your overall experience?
      </h3>

      <ul class="rate__list">
        <li v-for="item in rateArr" :key="item">
          <button
            @click="experienceRate = item"
            class="loop"
            :class="[
              'type-' + item,
              {
                activated: experienceRate,
                current: experienceRate === item,
              },
            ]"
          ></button>
        </li>
      </ul>

      <!--
      <h3 class="mb-4 text-center component-gradient-title">
        How happy are you with the end result?
      </h3>

      <ul class="rate__list">
        <li v-for="item in rateArr" :key="item">
          <button
            @click="resultRate = item"
            class="loop"
            :class="[
              'type-' + item,
              {
                activated: resultRate,
                current: resultRate === item,
              },
            ]"
          ></button>
        </li>
      </ul>

      <h3 class="mb-4 text-center component-gradient-title">
        Did Bao explain the products used to you?
      </h3>

      <ul class="rate__list">
        <li v-for="item in rateArr" :key="item">
          <button
            @click="explainRate = item"
            class="loop"
            :class="[
              'type-' + item,
              {
                activated: explainRate,
                current: explainRate === item,
              },
            ]"
          ></button>
        </li>
      </ul>

  -->
      <rate-form @onSubmit="onFormSubmit" :show="show" :rated="rated" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import RateForm from "./RateForm.vue";

import type { Order } from "@barbaard/types";

import { useUserStore } from "@/stores/user";
import { useCheckStore } from "@/stores/check";

import { updateOrderFields } from "@/utils/firebase/firebaseOrderUtils";

const store = useCheckStore();
const props = defineProps<{
  check: Order;
}>();

const rateArr: number[] = [1, 2, 3, 4, 5];

const experienceRate = ref<number | null>(null);
// const resultRate = ref<number | null>(null);
// const explainRate = ref<number | null>(null);

const userStore = useUserStore();
const orderId = computed(() => props.check.id!);
const selectedLocation = computed(() => userStore.getSelectedLocation);

// const ratingOverall = computed(() => {
//   if (!experienceRate.value || !resultRate.value || !explainRate.value)
//     return null;
//   return (
//     (experienceRate.value + resultRate.value + explainRate.value) /
//     3
//   ).toFixed(1);
// });
const ratingOverall = computed(() => experienceRate.value);

const show = computed(
  () => !(!experienceRate.value || experienceRate.value == 5),
);

const rated = computed(() => !!experienceRate.value);

const onFormSubmit = async (
  data: { feedback: string; followUp: boolean } | null,
) => {
  if (data) {
    const dbQuery = selectedLocation.value;

    const fieldsToUpdate = {
      ...(!!data.feedback ? { feedback: data.feedback } : {}),
      ...(!!data.followUp ? { followUp: data.followUp } : {}),
      ...(!!ratingOverall.value ? { ratingOverall: ratingOverall.value } : {}),
    };
    await updateOrderFields(orderId.value, fieldsToUpdate, dbQuery);
  }
  store.set_cehck_step(2);
};
</script>

<style lang="scss" scoped>
.component-gradient-title {
  margin-bottom: 2.9375rem;
  font-size: 1.5rem;
}

.rate {
  &__holder {
    padding: 1.3125rem 0;
    margin: 0 0 5rem;
  }

  &__list {
    display: grid;
    justify-content: center;
    grid-gap: 1.375rem;
    grid-template-columns: repeat(5, 4.875rem);
    margin-bottom: 4.375rem;

    li {
      display: flex;
      justify-content: center;
      height: 4.875rem;
      // width: 100%;
    }

    .loop {
      display: block;
      width: 80%;
      height: 80%;
      border-radius: 50%;
      transition: all 0.35s ease;
      background-repeat: no-repeat;
      background-size: cover;

      &.activated {
        &:not(.current) {
          opacity: 0.4;
        }
      }

      &.type {
        &-1 {
          background-image: url("/assets/images/rate-1.svg");
          // background: var(--color-red);
        }

        &-2 {
          background-image: url("/assets/images/rate-2.svg");
          // background: var(--color-orrange);
        }

        &-3 {
          background-image: url("/assets/images/rate-3.svg");
          // background: var(--color-yellow);
        }

        &-4 {
          background-image: url("/assets/images/rate-4.svg");
          // background: var(--color-green-light);
        }

        &-5 {
          background-image: url("/assets/images/rate-5.svg");
          // background: var(--color-green);
        }
      }
    }
  }
}
</style>
