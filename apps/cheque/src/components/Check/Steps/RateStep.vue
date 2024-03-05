<template>
  <div class="flex flex-col items-center flex-auto step rate-step">
    <div class="w-full">
      <!-- flex flex-col flex-auto items-center justify-center -->
      <logo class="mx-auto logo" />

      <check-rate :check="check" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order } from "@barbaard/types";

import Logo from "@/components/Logo.vue";
import CheckRate from "@/components/Check/CheckRate.vue";

defineProps<{
  check: Order;
}>();
</script>

<style lang="scss" scoped>
.rate-step {
  .logo {
    margin-bottom: 7.5rem;
    margin-top: ы;
  }
}
</style>
