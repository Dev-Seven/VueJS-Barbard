<template>
  <div class="tip__holder custom-border-top">
    <div class="component-container">
      <h3 class="mb-4 text-center component-title">
        Would you like to include a tip?
      </h3>

      <ul class="tip__list">
        <li v-for="item in tipValues" :key="item.value">
          <button
            class="tip__button base-button yellow"
            @click="setTipAmount(item.value)"
          >
            <currency :value="item.label" />
          </button>
        </li>
        <li>
          <button
            class="tip__button base-button yellow"
            @click="openCustomAmountModal"
          >
            Other
          </button>
        </li>
      </ul>
    </div>
  </div>

  <CheckTipRecipientModal
    v-model="showRewardModal"
    :check="check"
    :servicesArr="servicesArr"
    :amount="tips?.amount ? +tips.amount : 0"
    @onRecipientChoosed="setTipData"
  />

  <base-modal
    v-model="showCustomAmountModal"
    title="Thanks!"
    subTitle="How much of a tip would you like to pay?"
  >
    <div class="mb-4">
      <base-input autofocus type="number" v-model="customTipAmount" />
    </div>
    <div class="grid grid-cols-2 gap-7">
      <div>
        <button
          @click="showCustomAmountModal = false"
          class="w-full base-button yellow"
        >
          Cancel
        </button>
      </div>
      <div>
        <button
          @click="saveCustomTipAmount"
          :disabled="!customTipAmount"
          class="w-full base-button yellow"
        >
          Save
        </button>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { Order, Tips, BarbaardProduct } from "@barbaard/types";

import Currency from "../Currency.vue";
import BaseModal from "../BaseModal.vue";
import BaseInput from "../BaseInput.vue";

import CheckTipRecipientModal from "@/components/Check/CheckTipRecipientModal.vue";

const props = defineProps<{
  check: Order;
}>();

const emit = defineEmits(["onTipSelected"]);

type tip = {
  label: number;
  value: number;
};
const tipValues: tip[] = [
  {
    label: 50000,
    value: 50000,
  },
  {
    label: 100000,
    value: 100000,
  },
  {
    label: 200000,
    value: 200000,
  },
];

const showRewardModal = ref<boolean>(false);
const showCustomAmountModal = ref<boolean>(false);

const customTipAmount = ref<number | null>(null);

const openCustomAmountModal = async () => {
  showCustomAmountModal.value = true;
};

const saveCustomTipAmount = async () => {
  showCustomAmountModal.value = false;
  if (customTipAmount.value) setTipAmount(customTipAmount.value);
};

const servicesArr = props?.check?.products
  ? props?.check?.products?.filter(
      (i: BarbaardProduct) => i.category === "service",
    )
  : [];

let tips: Tips = reactive({
  rewardType: null,
});

const setTipAmount = async (val: number) => {
  tips.amount = +val;
  if (!servicesArr?.length) {
    tips.rewardType = "team";
    giveTips(tips);
    return;
  }
  showRewardModal.value = true;
};

const setTipData = (data: Tips) => {
  tips = { ...data };

  giveTips(tips);
  showRewardModal.value = false;
};

const giveTips = (data: Tips) => {
  emit("onTipSelected", data);
};
</script>

<style lang="scss" scoped>
.tip {
  &__holder {
    padding: 1.0625rem 0 1.625rem;
    font-family: var(--font-1);
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(4, 7.75rem);
    grid-gap: 0.75rem 0.9375rem;
    justify-content: center;
    margin: 0 auto;
  }

  &__button {
    height: 2.75rem;
    width: 100%;
  }
}
</style>
