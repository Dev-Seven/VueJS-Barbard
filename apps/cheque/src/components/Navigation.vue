<template>
  <div class="border-black navbar bg-base-100">
    <div class="flex-1">
      <a class="text-xl normal-case btn btn-ghost text-black dark:text-white"
        >Barbaard Cheque</a
      >
    </div>
    <base-location-select />
    <select
      v-model="theme"
      data-choose-theme
      @change="tailwindDarkmode"
      class="max-w-xs select bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
    <div class="flex-none">
      <ul class="px-1 menu menu-horizontal">
        <li class="dark:text-white text-black">
          {{ user?.displayName }}
        </li>
        <li>
          <a @click="logout" class="dark:text-white text-black">Logout</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useCurrentUser } from "vuefire";
import { onMounted, ref } from "vue";
import { themeChange } from "theme-change";

import BaseLocationSelect from "../components/BaseLocationSelect.vue";
import { useUserStore } from "../stores/user";

const theme = ref("light");

const userStore = useUserStore();

const use = useCurrentUser();
onMounted(() => {
  themeChange(false);
  document.documentElement.dataset.theme
    ? (theme.value = document.documentElement.dataset.theme)
    : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? (theme.value = "dark")
      : (theme.value = "light");
});

const tailwindDarkmode = (e) => {
  document.documentElement.className = e.target.value;
};

// function logout that uses signout from firebase
const logout = () => {
  userStore.logout();
};
</script>
