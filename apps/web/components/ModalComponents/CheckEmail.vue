<template>
  <div class="flex flex-col gap-y-6">
    <p class="text-white text-center font-montserrat opacity-60">
      Double check your email address:
    </p>
    <v-form @submit.prevent class="flex flex-col gap-y-6">
      <v-text-field
        class="custom-textField"
        v-model="email"
        type="email"
      ></v-text-field>
      <button
        class="btn-primary"
        type="submit"
        @click="SendLinkAgain"
        :disabled="sent"
      >
        <p class="m-0">{{ sent ? "Sent" : "Resend email" }}</p>
      </button>
    </v-form>
  </div>
</template>

<script setup>
import { sendSignInLinkToEmail } from "firebase/auth";

// let email = "tomgoedhart@me.com";
const { modalState, setModalState } = useModalState();
let email = ref(localStorage.getItem("email") ?? "");
let sent = ref(false);
const auth = useFirebaseAuth();

const SendLinkAgain = async () => {
  if (email.value) {
    let actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email.value, actionCodeSettings);
    sent.value = true;
    // setModalState(modalState.value + 1);
    localStorage.setItem("email", email.value);
  }
};
</script>

<style lang="scss" scoped></style>
