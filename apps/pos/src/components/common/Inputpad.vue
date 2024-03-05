<template>
  <div class="tw-grid tw-grid-cols-4 tw-gap-2 tw-w-full">
    <div
      v-for="n in inputValue"
      :key="n"
      class="tw-bg-white tw-rounded-xl tw-border tw-border-gray-300 tw-px-2 tw-py-3 tw-font-bold tw-text-center tw-cursor-pointer tw-shadow-sm transition duration-100 hover:tw-shadow-none"
      @click="inputAction(n)"
    >
      {{ n }}
    </div>
    <div
      class="tw-bg-white tw-rounded-xl tw-border tw-border-gray-300 tw-px-2 tw-py-3 tw-font-bold tw-flex tw-justify-center tw-cursor-pointer tw-shadow-sm transition duration-100 hover:tw-shadow-none"
      @click="inputAction('c')"
    >
      <svg
        clip-rule="evenodd"
        fill-rule="evenodd"
        stroke-linejoin="round"
        stroke-miterlimit="2"
        viewBox="0 0 24 24"
        class="tw-w-6 tw-h-6"
      >
        <path
          d="m22 6c0-.552-.448-1-1-1h-12.628c-.437 0-.853.191-1.138.523-1.078 1.256-3.811 4.439-4.993 5.815-.16.187-.241.419-.241.651 0 .231.08.463.24.651 1.181 1.38 3.915 4.575 4.994 5.835.285.333.701.525 1.14.525h12.626c.552 0 1-.448 1-1 0-2.577 0-9.423 0-12zm-13.628.5h12.128v11h-12.126l-4.715-5.51zm5.637 4.427 1.71-1.71c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.384-.219.531l-1.711 1.711 1.728 1.728c.147.147.22.339.22.53 0 .427-.349.751-.75.751-.192 0-.384-.073-.531-.219l-1.728-1.729-1.728 1.729c-.146.146-.339.219-.531.219-.401 0-.75-.324-.75-.751 0-.191.073-.383.22-.53l1.728-1.728-1.788-1.787c-.146-.148-.219-.339-.219-.532 0-.425.346-.749.751-.749.192 0 .384.073.53.219z"
          fill-rule="nonzero"
          fill="currentColor"
        />
      </svg>
    </div>
    <div
      class="tw-bg-white tw-rounded-xl tw-border tw-border-gray-300 tw-px-2 tw-py-3 tw-text-primary tw-font-bold tw-text-center tw-cursor-pointer tw-shadow-sm transition duration-100 hover:tw-shadow-none"
      @click="inputAction('ac')"
    >
      AC
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Inputpad',
  data() {
    return {
      inputValue: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      storeAmount: ''
    }
  },
  methods: {
    inputAction(value) {
      if (value == 'ac') {
        this.storeAmount = ''
        this.$emit('store-value', this.storeAmount)
      } else if (value == 'c') {
        if (this.storeAmount != '') {
          let s = this.storeAmount.split('')
          s.pop()
          this.storeAmount = s.join('')
          this.$emit('store-value', this.storeAmount)
        }
      } else {
        let s = this.storeAmount.split('')
        s.push(value)
        this.storeAmount = s.join('')
        this.$emit('store-value', this.storeAmount)
      }
    },

    handleEvent(e) {
      let values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      if (e.key == 'Backspace') {
        this.inputAction('c')
      } else if (values.indexOf(e.key) !== -1) {
        this.inputAction(e.key)
      }
    }
  }
}
</script>

<style></style>
