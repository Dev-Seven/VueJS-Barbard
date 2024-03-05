<template>
  <div class="check__page" v-if="cheque">
    <rate-step v-if="activeStep === 1" :check="cheque" />

    <initial-step v-if="activeStep === 2" :check="cheque" />

    <check-invoice v-if="activeStep === 3" :check="cheque" />
  </div>
</template>

<script setup lang="ts">
import type { Order } from "@barbaard/types";
import { computed, type Ref, onUnmounted } from "vue";

import { getOrderById } from "@/utils/firebase/firebaseOrderUtils";

import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useCheckStore } from "@/stores/check";

import RateStep from "@/components/Check/Steps/RateStep.vue";
import CheckInvoice from "@/components/Check/CheckInvoice.vue";
import InitialStep from "@/components/Check/Steps/InitialStep.vue";

const userStore = useUserStore();
const selectedLocation = computed(() => userStore.getSelectedLocation);

const checkStore = useCheckStore();
const activeStep = computed(() => checkStore.activeStep);
const route = useRoute();
const orderId: string = route.params.orderId as string;
const cheque: Ref<Order> = getOrderById({
  orderId,
  dbQuery: selectedLocation.value,
});

onUnmounted(() => {
  checkStore.set_cehck_step(1);
});
</script>

<style>
.check__page {
  margin: 0;
}
</style>
