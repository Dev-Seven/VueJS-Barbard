<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useCurrentUser } from "vuefire";
import { useRouter, useRoute } from "vue-router";
import { themeChange } from "theme-change";

const user = useCurrentUser();
const router = useRouter();
const route = useRoute();

watch(user, async (currentUser: any, previousUser: any) => {
  if (!currentUser && previousUser) {
    return router.push({ name: "login" });
  }
  if (currentUser && typeof route.query.redirect === "string") {
    return router.push(route.query.redirect);
  }
});

const offline = ref(false);

const handleOffline = () => {
  console.log("handleOffline");
  offline.value = true;
};

const handleOnline = () => {
  console.log("handleOnline");
  offline.value = false;
};

onMounted(() => {
  themeChange(false);
  document.documentElement.dataset.theme
    ? (document.documentElement.className =
        document.documentElement.dataset.theme)
    : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? (document.documentElement.className = "dark")
      : (document.documentElement.className = "light");
  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnline);
});

onUnmounted(() => {
  window.removeEventListener("offline", handleOffline);
  window.removeEventListener("online", handleOnline);
});
</script>

<template>
  <div v-if="offline" class="offline-message">Internet connection lost.</div>
  <RouterView />
</template>

<style lang="scss">
@import "./theme/variables.scss";
.offline-message {
  background-color: var(--color-red);
  color: var(--color-white);
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  margin: 1rem;
}
</style>
