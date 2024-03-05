<template>
  <Modal max-width-class="tw-max-w-screen-sm" :isShown="isShown">
    <div
      class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
    >
      <h6 class="tw-mb-0">Add Discount</h6>

      <CloseIcon class="tw-w-4 tw-h-4 tw-cursor-pointer" @click="$emit('update:isShown', false)" />
    </div>

    <div class="tw-flex tw-flex-col tw-p-6 tw-gap-4">
      <div class="tw-w-full tw-flex">
        <input
          class="tw-input tw-w-full tw-px-3 tw-rounded-r-none tw-rounded-l-lg tw-border-r-0 tw-border-l tw-border-y tw-border-gray-300 focus:tw-outline-none"
          type="text"
          :value="amount ? amount : null"
          @input="onAmountInput"
          autofocus
          placeholder="0"
        />
        <div
          class="tw-font-bold tw-w-10 tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-rounded-r-lg tw-border tw-border-gray-300 tw-shrink-0 tw-flex tw-items-center"
        >
          {{ isCash ? '₫' : '%' }}
        </div>
      </div>

      <div class="tw-flex tw-flex-col">
        <p class="tw-mb-0">Discount by</p>

        <div class="tw-flex tw-gap-4">
          <label className="tw-label tw-cursor-pointer">
            <input
              v-model="isCash"
              type="radio"
              name="is-cash"
              className="tw-radio tw-border-gray-700 tw-mr-1"
              v-bind:value="false"
            />
            <span className="tw-label-text tw-text-gray-600">Percentage</span>
          </label>
          <label className="tw-label tw-cursor-pointer">
            <input
              v-model="isCash"
              type="radio"
              name="is-cash"
              className="tw-radio tw-border-gray-700 tw-mr-1"
              v-bind:value="true"
            />
            <span className="tw-label-text tw-text-gray-600">Amount</span>
          </label>
        </div>
      </div>

      <input-pad @store-value="setDiscountAmount" />

      <p class="tw-text-secondary tw-mb-0 tw-text-center tw-text-sm" v-if="discount.amount">
        Customer is saving {{ numberWithCommas(discount.amount) }} ₫
        <span v-if="!isCash">( {{ discount.percentage }} %)</span> on the sale
      </p>

      <p class="tw-text-error tw-mb-0 tw-text-sm tw-text-center" v-if="error">
        {{ error }}
      </p>
    </div>

    <div class="tw-px-6 tw-pb-6 tw-flex tw-justify-end tw-gap-4">
      <button class="tw-btn tw-btn-secondary tw-text-white tw-font-normal" @click="onCancel">
        Cancel
      </button>
      <button class="tw-btn tw-btn-primary tw-text-white tw-font-normal" @click="onSubmit">
        Submit
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import InputPad from '@/components/common/Inputpad.vue'
import { numberWithCommas } from '@/utilities/utility'
import { mapState, mapActions } from 'pinia'
import Modal from '@/components/common/Modal.vue'
import { round } from 'lodash'
import { useSale } from '@/stores/sale/sale'
import { CloseIcon } from '../icons'

export default {
  props: {
    isShown: [Boolean]
  },

  components: { InputPad, Modal, CloseIcon },

  data() {
    return {
      error: '',
      isCash: false,
      amount: 0,
      discount: {
        type: 'percentage',
        percentage: 0,
        amount: 0,
        manual: false,
        promotion: false
      }
    }
  },

  computed: {
    ...mapState(useSale, ['order']),
    ...mapState(useSale, ['total', 'subTotal', 'products'])
  },

  methods: {
    numberWithCommas,

    ...mapActions(useSale, ['applyDiscount', 'resetDiscount']),

    onCancel() {
      this.resetDiscount()
      this.$emit('update:isShown', false)
    },

    setDiscountAmount(value) {
      const _val = parseInt(value)
      this.amount = _val ? _val : 0
    },

    onSubmit() {
      if (this.amount > 100 && !this.isCash) {
        this.error = 'Percentage should not be grater than to 100%'
        return
      } else {
        const discount = {
          amount: this.isCash ? this.amount : round((this.total / 100) * this.amount),
          percentage: this.isCash ? (this.amount / this.total) * 100 : this.amount,
          type: this.isCash ? 'money' : 'percentage',
          manual: true,
          promotion: false
        }

        this.discount = discount
        this.applyDiscount(discount)
      }

      this.$emit('update:isShown', false)
    },

    onAmountInput(el: any) {
      const value = +el.target.value

      if (value > 100 && !this.isCash) {
        this.error = 'Percentage should not be grater than to 100%'
      } else {
        this.error = ''
      }

      this.amount = value
    }
  },

  mounted() {
    const { discount } = this.order
    this.discount = discount
    this.isCash = discount.type === 'money'
    this.amount = discount.type === 'money' ? discount.amount : discount.percentage
  }
}
</script>

<style></style>
