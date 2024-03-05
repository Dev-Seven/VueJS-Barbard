<template>
  <div>
    <Navigation v-if="user" />
    <ChequeList v-if="selectedLocation && showContent" />
  </div>
</template>
<script setup lang="ts">
import Navigation from "../components/Navigation.vue";
import ChequeList from "../components/ChequeList.vue";

import { useUserStore } from "../stores/user";
import { computed, ref, nextTick, watch } from "vue";

import { useCurrentUser } from "vuefire";

const userStore = useUserStore();

const user = useCurrentUser();
const selectedLocation = computed(() => userStore.getSelectedLocation);

const showContent = ref(true);
watch(
  () => selectedLocation.value,
  async () => {
    showContent.value = false;
    await nextTick;
    showContent.value = true;
  },
);
</script>
