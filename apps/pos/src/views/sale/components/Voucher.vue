<template>
  <div class="tw-w-full">
    <div class="tw-flex">
      <input
        v-model="voucher"
        class="tw-input tw-border tw-w-full tw-rounded-r-none focus:tw-outline-none"
        :class="{
          'tw-border-error': error,
          'tw-border-gray-300': !error
        }"
        placeholder="Enter gift voucher code"
        @input="onVoucherInput(($event.target as HTMLInputElement).value)"
      />
      <button class="tw-btn tw-btn-primary tw-rounded-l-none" @click="addVoucher">
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
import { mapState } from 'pinia'
import { useSale } from '@/stores'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import database from '@/config/firebase/database'
import { isEmpty } from 'lodash'
export default {
  components: { LoadingIcon },
  data() {
    return {
      voucher: '',
      loading: false,
      error: '',
      voucherDocument: {}
    }
  },
  computed: {
    ...mapState(useSale, ['customer'])
  },
  methods: {
    onVoucherInput(value: string) {
      if (value) {
        this.error = ''
        return
      }
      this.error = 'Gift cheque number is required'
    },
    async addVoucher() {
      if (!this.voucher) {
        this.error = 'Gift cheque number is required'
        return
      }
      try {
        this.loading = true
        const voucherQuery = query(
          collection(database, `giftcheques`),
          where('code', '==', `${this.voucher}`),
          limit(1)
        )
        const snapshot = await getDocs(voucherQuery)
        if (snapshot.size !== 1) {
          console.log(`Voucher:: ${this.voucher} is not found`)
          this.error = 'Gift code invalid'
          return
        }
        snapshot.forEach((v) => {
          const voucher: any = { _id: v.id, ...v.data() }
          if (voucher.active) {
            this.voucherDocument = voucher
          }
        })
        if (!isEmpty(this.voucherDocument)) {
          this.$emit('apply', this.voucherDocument)
        } else {
          console.log(`Voucher:: ${this.voucher} is empty or invalid`)
          this.error = 'Gift code invalid or expired'
          return
        }
      } catch (e: any) {
        console.log(`Voucher:: error ${e.message} while applying voucher ${this.voucher}`)
        this.error = 'Error applying Gift code, try again!'
      } finally {
        this.loading = false
        setTimeout(() => {
          this.error = ''
        }, 3000)
      }
    }
  }
}
</script>
