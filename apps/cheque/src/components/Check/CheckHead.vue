<template>
  <div class="text-center check__head">
    <logo class="mx-auto logo mb-7" />
    <h2 class="text-4xl component-gradient-title pt-5">
      Thank you for your visit
    </h2>
    <h3 class="component-title text-sm">Please check your receipt below</h3>
  </div>
</template>

<script setup lang="ts">
import Logo from "@/components/Logo.vue";
</script>

<style lang="scss" scoped>
.check__head {
  margin-bottom: 0;
}

.component-gradient-title {
  font-size: 1.5rem;
}

.component-title {
  font-size: 1rem;
}

.logo {
  max-width: 6.5625rem;
}
</style>
