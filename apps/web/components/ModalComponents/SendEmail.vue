<template>
  <div
    class="flex flex-col gap-y-4 text-center text-white opacity-60 sm:px-5 md:px-0 max-md:pt-10"
  >
    <p
      class="md:text-sm max-sm:text-[0.875rem] sm:text-[0.875rem] font-montserrat"
    >
      We’ve just send you and email with a login link. Just press the button and
      we will log you in...
    </p>
    <p
      class="md:text-sm max-sm:text-[0.875rem] sm:text-[0.875rem] font-montserrat"
    >
      It’s magic!
    </p>
  </div>
  <button
    @click="setModalState(3)"
    height="72"
    min-width="164"
    color="#CA7728"
    class="max-md:pb-10"
  >
    <p class="text-[#CA7728] font-montserrat text-[0.875rem] font-normal">
      I haven’t received an email
    </p>
  </button>
</template>

<script setup>
const { modalState, setModalState } = useModalState();
</script>

<style lang="scss" scoped></style>
