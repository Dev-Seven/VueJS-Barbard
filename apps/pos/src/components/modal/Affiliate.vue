<template>
  <Modal max-width-class="tw-max-w-screen-sm" :isShown="isShown">
    <div
      class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
    >
      <h6 class="tw-mb-0">Redeem Affiliate Code</h6>
      <CloseIcon class="tw-w-4 tw-h-4 tw-cursor-pointer" @click="$emit('update:isShown', false)" />
    </div>

    <div class="tw-flex tw-flex-col tw-p-6 tw-gap-4 tw-justify-center">
      <input
        type="text"
        class="tw-input tw-w-full tw-px-3 tw-border tw-border-gray-300 focus:tw-outline-none"
        placeholder="Scan or enter affiliate code"
        @change="onCodeInput(($event.target as HTMLInputElement).value)"
      />
      <p class="tw-text-error tw-text-sm tw-mb-0" v-if="error">
        {{ error }}
      </p>
    </div>

    <div class="tw-px-6 tw-pb-6 tw-flex tw-justify-end">
      <button class="tw-btn tw-btn-primary tw-text-white tw-font-normal" @click="onCodeInput(code)">
        Check
        <LoadingIcon
          v-if="loading"
          class="tw-w-5 tw-h-5 tw-animate-spin dark:tw-text-gray-400 tw-fill-white"
        />
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { find, isEmpty } from 'lodash'
import Modal from '@/components/common/Modal.vue'
import { CloseIcon, LoadingIcon } from '@/components/icons'
import { useSale } from '@/stores/sale/sale'
import { toast, type ToastOptions } from 'vue3-toastify'
import functions from '@/config/firebase/functions'
import { httpsCallable } from 'firebase/functions'
import { usePromotion } from '@/stores'
import { mapActions } from 'pinia'
export default {
  components: {
    Modal,
    LoadingIcon,
    CloseIcon
  },
  props: {
    isShown: [Boolean]
  },
  data() {
    return {
      code: '',
      loading: false,
      error: ''
    }
  },
  computed: {
    ...mapState(useSale, ['customer']),
    ...mapState(usePromotion, ['promotions'])
  },
  methods: {
    isEmpty,
    ...mapActions(useSale, ['applyPromotion']),
    onCodeInput(code: string) {
      this.code = code
      this.loading = true
      const checkAffiliate = httpsCallable(functions, 'CheckAffiliate')
      checkAffiliate({ uid: this.customer.userId, code })
        .then((result) => {
          const data = result.data as Array<string>
          if (data.length) {
            this.error = data[0]
            toast(data[0], {
              autoClose: 3000,
              type: toast.TYPE.WARNING,
              transition: toast.TRANSITIONS.SLIDE,
              theme: toast.THEME.LIGHT,
              position: toast.POSITION.BOTTOM_LEFT
            } as ToastOptions)
          } else {
            setTimeout(() => {
              const promotion = find(this.promotions, (p: any) => {
                return p?.voucher && p.users.includes(this.customer.userId)
              })
              if (promotion) {
                this.applyPromotion(promotion)
              }
              this.$emit('update:isShown', false)
            }, 2000)
          }
        })
        .then(() => {
          this.loading = false
        })
    }
  }
}
</script>
