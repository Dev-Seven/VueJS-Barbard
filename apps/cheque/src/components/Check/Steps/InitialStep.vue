<template>
  <div class="step">
    <check-head />

    <check-details :check="check" v-if="check" />

    <!-- <check-services /> -->

    <check-tip
      @onTipSelected="onTipSelected"
      :check="check"
      v-if="!tipSelected"
    />

    <div class="fixed bottom-8 w-5/6 left-1/2 transform -translate-x-1/2">
      <div class="custom-border-top pt-6">
        <div class="component-container">
          <button
            class="base-button w-full"
            @click="onConfirmClick"
            :class="{ yellow: tipSelected, green: !tipSelected }"
          >
            I CONFIRM ALL INFORMATION IS CORRECT
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Order } from "@barbaard/types";

// import CheckTip from "../../../components/Check/CheckTip.vue";
import CheckHead from "../../../components/Check/CheckHead.vue";
import CheckDetails from "../../../components/Check/CheckDetails.vue";
// import CheckServices from "../../../components/Check/CheckServices.vue";

import { useCheckStore } from "../../../stores/check";
import { useUserStore } from "../../../stores/user";

import { updateOrderField } from "../../../utils/firebase/firebaseOrderUtils";

import { OrderStatuses } from "@/variables";

const store = useCheckStore();

const props = defineProps<{
  check: Order;
}>();

const tipSelected = ref<{} | null>(null);

const orderId = computed(() => props.check.id!);

const userStore = useUserStore();
const selectedLocation = computed(() => userStore.getSelectedLocation);

const onTipSelected = async (payload: any) => {
  tipSelected.value = payload;
  const dbQuery = selectedLocation.value;
  await updateOrderField(orderId.value, "tip", payload, dbQuery);
};
const onConfirmClick = async () => {
  const dbQuery = selectedLocation.value;
  await updateOrderField(orderId.value, "confirmed_by_user", true, dbQuery);
  await updateOrderField(
    orderId.value,
    "status",
    OrderStatuses.chequeConfirmed,
    dbQuery,
  );
  store.set_cehck_step(3);
};
</script>
