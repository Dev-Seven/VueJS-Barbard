<template>
  <div class="flex flex-col items-center flex-auto">
    <div class="w-full">
      <!-- flex flex-col flex-auto items-center justify-center -->
      <logo class="mx-auto logo" />
    </div>
    <!--
    <h3 class="mb-4 text-center component-gradient-title">
      How would you like to pay?
    </h3>
    <div class="pt-10 pb-20 grid gap-7 grid-cols-4">
      <button
        v-for="item in paymentMethods"
        :key="item"
        class="base-button yellow w-20 uppercase"
      >
        {{ item }}
      </button>
    </div>

    -->
    <h3 class="mt-8 component-title">Please return this tablet to our staff</h3>

    <!-- <div class="w-full pl-3 pr-3">
      <button
        class="flex items-center justify-center w-full base-button yellow"
        :disabled="invoiceInRed"
        @click="showModal = true"
      >
        <input
          class="checkbox"
          type="checkbox"
          readonly
          v-model="checked"
        />
        I WOULD LIKE A RED INVOICE
      </button>
    </div> -->
  </div>

  <!-- <div class="text-center">
    <base-switcher
      class="uppercase color-white"
      v-model="notifyMe"
      label="email my receipt to tomgoedhart@me.com"
    />
  </div> -->

  <!-- <base-modal
    v-model="showModal"
    title="Red Invoice Info"
    subTitle="Please fill in the company information"
  >
    <invoice-form
      :check="check"
      @onSubmited="onSubmited"
    />
  </base-modal> -->
</template>

<script lang="ts" setup>
// import { ref } from "vue";

import type { Order } from "@barbaard/types";

// import BaseSwitcher from "@/components/BaseSwitcher.vue";
import Logo from "@/components/Logo.vue";

defineProps<{
  check: Order;
}>();

// const notifyMe = ref<boolean>(true);

// const paymentMethods: string[] = ["cash", "card", "qr", "momo"];

// import BaseModal from '../BaseModal.vue'
// import InvoiceForm from '../Check/InvoiceForm.vue'

// const checked = ref<boolean>(false)
// const showModal = ref<boolean>(false)
// const invoiceInRed = ref<boolean>(false)

// const onSubmited = () => {
//   invoiceInRed.value = true
//   checked.value = true
//   showModal.value = false
// }
</script>

<style lang="scss" scoped>
.component-title {
  margin-bottom: 2.5625rem;
}

.logo {
  margin-bottom: 7.5rem;
  margin-top: ы;
}

.checkbox {
  background: none;
  width: 1.375rem;
  height: 1.375rem;
  margin-right: 0.625rem;
  background: none;
  position: relative;
  border: none;
  pointer-events: none;

  &:after {
    content: "";
    position: absolute;
    top: 0.1875rem;
    left: 0.1875rem;
    right: 0.1875rem;
    bottom: 0.1875rem;
    border: 1px solid #000000;
    border-radius: 0.1875rem;
  }

  &:checked {
    background: url("/check-box.svg");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: top center;
  }
}
</style>
