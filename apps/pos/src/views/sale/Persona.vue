<template>
  <div class="tw-container tw-max-w-screen-xl tw-pt-10 tw-px-4 sm:tw-px-12">
    <div class="open-table">
      <h2
        class="tw-text-secondary tw-border-b tw-border-primary tw-py-1 tw-font-bold tw-w-max tw-mb-4"
      >
        Payment received
      </h2>
      <div class="tw-flex">
        <div
          class="tw-mx-0 tw-p-2 tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-lg tw-bg-white tw-w-full sm:tw-w-5/12 xl:tw-w-4/12"
        >
          <div class="tw-py-2 tw-px-2 tw-h-[68vh] tw-overflow-y-auto">
            <SaleItem v-for="(item, index) in order.products" :key="index" :item="item" />
            <div class="tw-flex tw-justify-between tw-border-b tw-border-gray-300 tw-py-3">
              <h6 class="tw-mb-0 tw-font-normal tw-mr-2">SubTotal</h6>
              <h6 class="tw-mb-0 tw-font-normal">₫{{ numberWithCommas(order.totalOrderValue) }}</h6>
            </div>

            <div class="tw-flex tw-justify-between tw-border-b tw-border-gray-300 tw-py-3">
              <h5 class="tw-mb-0 tw-font-bold tw-mr-2">Sale Total</h5>
              <h6 class="tw-mb-0 tw-font-bold">₫{{ numberWithCommas(order.totalOrderValue) }}</h6>
            </div>

            <div
              v-for="(payment, index) in payments"
              :key="`sale-paid-${index}`"
              class="tw-flex tw-justify-between tw-border-b tw-border-gray-300 tw-py-3"
            >
              <h6 class="tw-mb-0 tw-font-normal tw-mr-2">
                {{ payment.method }}
              </h6>
              <h6 class="tw-mb-0 tw-font-normal">₫{{ numberWithCommas(payment.amount) }}</h6>
            </div>

            <div class="tw-flex tw-justify-between tw-border-b tw-border-gray-300 tw-py-3">
              <h5 class="tw-mb-0 tw-font-bold tw-mr-2">To Pay</h5>
              <h6 class="tw-mb-0 tw-font-bold">₫0</h6>
            </div>
          </div>
        </div>
        <div class="tw-mt-4 tw-p-0 tw-w-full sm:tw-w-7/12 xl:tw-w-8/12 lg:tw-px-3 lg:tw-mt-0">
          <div
            class="tw-border tw-border-gray-300 tw-shadow-lg tw-rounded-lg tw-px-3 tw-py-5 tw-bg-white"
          >
            <h5 class="tw-mb-0 tw-font-bold tw-text-center tw-mb-8">
              <span class="tw-text-primary">{{ customer.fullName }}</span>
              is a
            </h5>
            <div class="tw-grid tw-grid-cols-2 tw-gap-4">
              <button
                v-for="trait in traits"
                :key="trait.key"
                class="tw-btn tw-btn-block tw-text-white tw-font-normal"
                :class="{
                  'tw-btn-primary': persona.includes(trait.key),
                  'tw-btn-secondary': !persona.includes(trait.key)
                }"
                @click="addTraitToPersona(trait)"
              >
                {{ trait.name }}
              </button>
            </div>
          </div>
          <div class="tw-mt-4">
            <p class="tw-text-error tw-mb-0" v-if="error">
              {{ error }}
            </p>

            <button
              class="tw-btn tw-btn-primary tw-btn-block tw-text-white tw-font-normal"
              @click="completePersona"
            >
              Complete sale
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { numberWithCommas } from '@/utilities/utility'
import { indexOf } from 'lodash'
import { mapState, mapActions } from 'pinia'
import { PersonaTraits, type TraitType } from '@/utilities/constants'
import SaleItem from './components/SaleItem.vue'
import { usePayment } from '@/stores/payment'

export default {
  components: { SaleItem },
  data() {
    return {
      error: null
    }
  },

  computed: {
    ...mapState(usePayment, ['persona', 'orderId', 'customer', 'order', 'payments']),
    traits() {
      return PersonaTraits
    },
    userPersona() {
      return this.customer.persona || []
    },
    persona() {
      return this.traits.filter((t) => this.userPersona.includes(t.key)).map((t) => t.key)
    }
  },

  methods: {
    numberWithCommas,
    ...mapActions(usePayment, ['setPaymentPersona', 'updatePersona']),

    async completePersona() {
      this.$router.push({ name: 'home' })
    },

    async addTraitToPersona(trait: TraitType) {
      const index = indexOf(this.persona, trait.key)
      const persona = [...this.persona]

      if (index === -1) {
        persona.push(trait.key)
      } else {
        persona.splice(index, 1)
      }

      this.setPaymentPersona({
        orderId: this.orderId,
        customer: {
          ...this.customer,
          persona
        },
        order: this.order,
        payments: this.payments
      })

      await this.updatePersona(persona, this.customer.userId)
    }
  },

  mounted() {
    this.$emit('setOption', 'backButtonOptionNavabar')
  }
}
</script>
