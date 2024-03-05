<template>
  <div
    class="tw-card tw-shadow-md tw-bg-white tw-border tw-border-[#dfdfdf] tw-h-44 tw-min-h-full tw-cursor-pointer hover:tw-opacity-80"
    @click="create"
  >
    <div class="tw-card-body tw-flex tw-justify-center tw-items-center">
      <svg
        class="tw-w-10 tw-h-10 tw-block tw-text-primary"
        clip-rule="evenodd"
        fill-rule="evenodd"
        stroke-linejoin="round"
        stroke-miterlimit="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m11 11h-7.25c-.414 0-.75.336-.75.75s.336.75.75.75h7.25v7.25c0 .414.336.75.75.75s.75-.336.75-.75v-7.25h7.25c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-7.25v-7.25c0-.414-.336-.75-.75-.75s-.75.336-.75.75z"
          fill-rule="nonzero"
          fill="currentColor"
        />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    create() {
      this.$router.push({ name: 'sale.create' })
    }
  }
}
</script>
