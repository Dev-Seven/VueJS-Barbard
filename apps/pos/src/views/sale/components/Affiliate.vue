<template>
  <div class="tw-w-full">
    <div class="tw-flex">
      <input
        v-model="code"
        class="tw-input tw-border tw-w-full tw-rounded-r-none focus:tw-outline-none"
        :class="{ 'tw-border-error': error, 'tw-border-gray-300': !error }"
        placeholder="Scan affiliate code"
        @keyup.enter="onCodeInput"
      />
      <button class="tw-btn tw-btn-primary tw-rounded-l-none" @click="onCodeInput(code)">
        <p v-if="!loading" class="tw-font-normal tw-text-white tw-mb-0">Apply</p>
        <LoadingIcon
          v-else
          class="tw-w-4 tw-h-4 tw-animate-spin dark:tw-text-gray-200 tw-fill-white"
        />
      </button>
    </div>

    <p class="tw-text-error tw-text-sm tw-mb-0" v-if="error">
      {{ error }}
    </p>
  </div>
</template>

<script lang="ts">
import { LoadingIcon } from '@/components/icons'
import { toast, type ToastOptions } from 'vue3-toastify'
import functions from '@/config/firebase/functions'
import { httpsCallable } from 'firebase/functions'
import { mapState } from 'pinia'
import { useSale } from '@/stores'
const options = {
  autoClose: 3000,
  type: toast.TYPE.WARNING,
  transition: toast.TRANSITIONS.SLIDE,
  theme: toast.THEME.LIGHT,
  position: toast.POSITION.BOTTOM_LEFT
} as ToastOptions
export default {
  components: { LoadingIcon },
  data() {
    return {
      code: '',
      loading: false,
      error: ''
    }
  },
  computed: {
    ...mapState(useSale, ['customer'])
  },
  methods: {
    onCodeInput() {
      this.loading = true
      const createAffiliate = httpsCallable(functions, 'CreateAffiliate')
      createAffiliate({ uid: this.customer.userId, code: this.code })
        .then((result) => {
          const data = result.data as Array<string>
          if (data.length) {
            this.error = data[0]
            toast(data[0], options)
          } else {
            toast('Affiliate created successfully.', {
              ...options,
              type: toast.TYPE.SUCCESS
            })
          }
        })
        .then(() => (this.loading = false))
    }
  }
}
</script>
