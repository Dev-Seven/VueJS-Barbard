<template>
  <div class="container py-5 mx-auto">
    <div class="grid grid-cols-4 grid-rows-4 gap-2">
      <div
        class="w-40 shadow-xl shadow-gray card"
        v-for="order in orders"
        :key="order.id"
        @click="$router.push('/cheques/' + order.id)"
      >
        <div class="card-body text-black dark:text-white">
          <h2 class="card-title text-black dark:text-white">
            {{ order.tableName }}
          </h2>
          <p>{{ order.userName }}</p>
          <div class="justify-end card-actions">
            <div class="badge badge-outline">
              {{ order.amountOfGuests }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, computed } from "vue";
import type { Order } from "@barbaard/types";
import { useUserStore } from "../stores/user";
import { queryOrdersByStatus } from "../utils/firebase/firebaseOrderUtils.js";

const userStore = useUserStore();
const selectedLocation = computed(() => userStore.getSelectedLocation);

const orders: Ref<Order[]> = queryOrdersByStatus(selectedLocation.value);
</script>
