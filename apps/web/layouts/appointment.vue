<template>
  <div class="modal-main grid grid-cols-2">
    <div class="modal-left">
      <div class="flex flex-col justify-between h-full">
        <h3 class="text-2xl text-center text-white">Your next appointment</h3>
        <slot />
        <p class="text-[0.6875rem] text-white text-center">
          If you are creating a new account, Terms & Conditions and Privacy
          Policy will apply. You can also set up your communication preferences
        </p>
      </div>
    </div>
    <div>
      <img :src="StandingMan" class="w-full" />
    </div>
  </div>
</template>

<script setup>
import StandingMan from "@/assets/images/standing-man.png";
</script>

<style lang="scss" scoped>
.modal-main {
  border-radius: 0.625rem;
  background: radial-gradient(
    11733.82% 50% at 50% -0%,
    #15172c 0%,
    #0a0a1c 100%
  );
  overflow: hidden;
}

div.modal-main > * {
  font-family: Montserrat !important;
}

.modal-left {
  padding: 6.75rem 3rem 1.63rem;
}

.v-overlay__scrim {
  opacity: 0.7;
}
</style>
