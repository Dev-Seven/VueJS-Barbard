<template>
  <form @submit.prevent="onFormSubmit" ref="formRef">
    <base-input
      required
      v-model="form.companyName"
      class="mb-4"
      label="Company Name"
    />
    <base-textarea
      required
      v-model="form.companyAdress"
      type="textarea"
      class="mb-4"
      label="Company Adress"
    />
    <base-input
      required
      v-model="form.registrationNumber"
      type="tel"
      class="mb-4"
      label="Registration number"
    />
    <h3 class="component-title">We will send the email to:</h3>
    <base-input
      required
      v-model="form.email"
      class="mb-4"
      label="Email"
      type="email"
    />
    <base-switcher
      v-model="form.saveInfo"
      class="mb-4"
      label="Save this information in my account"
    />

    <div class="text-center">
      <button
        class="w-full base-button yellow"
        type="submit"
        :disabled="loading"
      >
        <svg
          v-if="loading"
          aria-hidden="true"
          role="status"
          class="inline w-4 h-4 mr-3 text-white animate-spin"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="#E5E7EB"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentColor"
          />
        </svg>
        REQUEST RED INVOICE
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { Order } from "@barbaard/types";

import BaseInput from "../BaseInput.vue";
import BaseTextarea from "../BaseTextarea.vue";
import BaseSwitcher from "../BaseSwitcher.vue";

import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore();

const props = defineProps<{
  check: Order;
}>();

const formRef = ref<HTMLFormElement | null>(null);
const form = reactive({
  companyName: ref<string>(""),
  companyAdress: ref<string>(""),
  registrationNumber: ref<string>(""),
  email: ref<string>(""),
  saveInfo: ref<boolean>(true),
});

const loading = ref<boolean>(false);

const emit = defineEmits(["onSubmited"]);

const onFormSubmit = async () => {
  const data = {
    ...form,
  };

  if (!formRef.value?.checkValidity()) return;

  emit("onSubmited");
  await onRedInvoice(data);
};

const onRedInvoice = async (formData: any) => {
  try {
    loading.value = true;
    const userId = props.check.userId;

    // prepare redInvoice param
    const redInvoice = Object.keys(formData).map((i) => {
      return {
        [i]: formData[i],
      };
    });

    // update user data
    if (userId) {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, { redInvoice }, { merge: true });
    }
  } finally {
    loading.value = true;
    emit("onSubmited");
  }
};
</script>

<style lang="scss" scoped>
.component-title {
  margin-bottom: 1.125rem;
}
</style>
