<template>
  <span class="price" v-if="value">{{ formatCurrency(value) }}</span>
  <span v-else>---</span>
</template>

<script setup lang="ts">
import { currencyFormat } from "@/utils/currencyFormat";
defineProps<{
  value: string | number | undefined;
}>();

const formatCurrency = (value: string | number | undefined): string => {
  if (value) {
    const isNumber = +value;
    if (typeof isNumber === "number") {
      const formattedValue = currencyFormat(isNumber);

      return `${formattedValue}`;
    }
  }
  return "";
};
</script>

<style lang="scss" scoped>
span {
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  font-weight: inherit;
  font-family: inherit;
}
</style>
