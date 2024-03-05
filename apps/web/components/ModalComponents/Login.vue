<template>
  <v-form @submit.prevent class="flex flex-col gap-y-4">
    <v-text-field
      label="Your email address"
      class="custom-textField"
      v-model="email"
    ></v-text-field>
    <p class="text-white font-montserrat text-[0.8rem]" v-if="isError">
      *Please Enter Email
    </p>
    <button type="submit" class="btn-primary" @click="SendLink">
      <p class="m-0">Continue</p>
    </button>
  </v-form>
  <div class="sm:mt-0 md:mt-[7rem] flex justify-center">
    <v-switch inset :label="'Remember Me'" class="max-w-[60%]"></v-switch>
  </div>
</template>

<script setup>
import { sendSignInLinkToEmail } from "firebase/auth";

const { modalState, setModalState } = useModalState();

let email = ref("");
let isError = ref(false);

const user = useCurrentUser();
const auth = useFirebaseAuth();

const SendLink = async () => {
  if (email.value) {
    isError.value = false;
    let actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };
    if (!user.value) {
      await sendSignInLinkToEmail(auth, email.value, actionCodeSettings);
      // Obtain emailLink from the user.
      setModalState(modalState.value + 1);
      localStorage.setItem("email", email.value);
    }
  } else {
    isError.value = true;
  }
};
</script>

<style lang="scss" scoped></style>
