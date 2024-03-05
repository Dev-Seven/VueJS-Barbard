<template>
  <label
    v-if="locations && locations.length > 1"
    class="flex items-stretch mr-3"
  >
    <span class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >Select an option</span
    >

    <select
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      v-model="selectedLocation"
    >
      <option v-for="i in locations" :key="i" :value="i">
        {{ i }}
      </option>
    </select>
  </label>
</template>

<script lang="ts" setup>
import { useUserStore } from "../stores/user";
import { computed } from "vue";

const userStore = useUserStore();
const user = userStore.getUser;
const locations = computed(() => (user?.locations ? user?.locations : []));

const selectedLocation = computed({
  get() {
    return userStore.getSelectedLocation;
  },
  set(val) {
    userStore.setLocation(val);
  },
});
</script>
