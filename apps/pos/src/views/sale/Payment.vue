<template>
  <div class="tw-container tw-max-w-screen-xl tw-pt-10 tw-px-4 sm:tw-px-12">
    <print ref="bill" />
    <div class="open-table">
      <h2
        class="tw-text-secondary tw-border-b tw-border-primary tw-py-1 tw-font-bold tw-w-max tw-mb-4"
      >
        Make Payment
      </h2>
      <div class="tw-flex tw-flex-col tw-gap-4 sm:tw-flex-row">
        <div
          class="tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-lg tw-bg-white tw-w-full sm:tw-w-5/12 xl:tw-w-4/12"
        >
          <div class="tw-overflow-y-auto sm:tw-h-[60vh]">
            <SaleItem v-for="(item, index) in order.products" :key="index" :item="item" />

            <div class="tw-px-4 tw-border-b tw-border-gray-300">
              <div class="tw-flex tw-justify-between tw-py-3">
                <h6 class="tw-mb-0 tw-font-bold tw-mr-2">SubTotal</h6>
                <h6 class="tw-mb-0 tw-font-bold">₫{{ numberWithCommas(subTotal) }}</h6>
              </div>
            </div>

            <div class="tw-px-4 tw-border-b tw-border-gray-300" v-if="visibleSaleDiscount?.amount">
              <div class="tw-flex tw-justify-between tw-py-3">
                <h6 class="tw-mb-0 tw-font-bold tw-mr-2">
                  {{ visibleSaleDiscount?.promotion?.name || 'Sale Discount' }}
                </h6>
                <h6 class="tw-mb-0 tw-font-bold">
                  ₫{{ numberWithCommas(visibleSaleDiscount?.amount) }}
                </h6>
              </div>
            </div>

            <div class="tw-px-4 tw-border-b tw-border-gray-300">
              <div class="tw-flex tw-justify-between tw-py-3">
                <h6 class="tw-mb-0 tw-font-bold tw-mr-2">Sale Total</h6>
                <h6 class="tw-mb-0 tw-font-bold">₫{{ numberWithCommas(totalPayableAmount) }}</h6>
              </div>
            </div>

            <div
              class="tw-px-4 tw-border-b tw-border-gray-300"
              v-for="(payment, index) in payments"
              :key="`sale-paid-${index}`"
            >
              <div class="tw-flex tw-justify-between tw-py-3">
                <h6 class="tw-mb-0 tw-font-bold tw-mr-2">{{ payment.method }}</h6>
                <h6 class="tw-mb-0 tw-font-bold">₫{{ numberWithCommas(payment.amount) }}</h6>
              </div>
            </div>

            <div class="tw-px-4 tw-border-b tw-border-gray-300">
              <div class="tw-flex tw-justify-between tw-py-3">
                <h6 class="tw-mb-0 tw-font-bold tw-mr-2">To Pay</h6>
                <h6 class="tw-mb-0 tw-font-bold">₫{{ numberWithCommas(partialAmount) }}</h6>
              </div>
            </div>
          </div>
        </div>

        <div class="tw-w-full sm:tw-w-7/12 xl:tw-w-8/12">
          <div
            class="tw-border tw-border-gray-300 tw-shadow-lg tw-rounded-lg tw-p-5 tw-bg-white tw-flex tw-flex-col tw-gap-4"
          >
            <div class="tw-flex tw-flex-col tw-gap-4 xl:tw-flex-row">
              <div class="tw-w-full xl:tw-w-3/12">
                <p class="tw-border-b tw-border-primary tw-font-bold tw-w-max tw-mb-0">
                  Amount To Pay
                </p>
              </div>
              <div class="tw-text-right tw-w-full xl:tw-w-9/12">
                <div class="tw-w-full tw-flex tw-mb-2">
                  <input
                    :value="partialAmount"
                    @input="
                      partialAmount = parseFloat(
                        ($event.target as HTMLInputElement).value.replace(/,/g, '')
                      )
                    "
                    v-number="{
                      decimal: '.',
                      separator: ',',
                      precision: 2
                    }"
                    pattern="[0-9]*"
                    class="tw-input tw-text-right tw-w-full tw-px-3 tw-rounded-r-none tw-rounded-l-lg tw-border-r-0 tw-border-l tw-border-y tw-border-gray-300 focus:tw-outline-none"
                  />
                  <div
                    class="tw-font-bold tw-w-10 tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-rounded-r-lg tw-border tw-border-gray-300 tw-shrink-0 tw-flex tw-items-center"
                  >
                    ₫
                  </div>
                </div>
                <p v-if="amountLeft < partialAmount" class="tw-font-bold tw-text-right tw-mb-2">
                  Return {{ numberWithCommas(amountToReturn) }} vnd to guest
                </p>

                <div
                  v-if="amountLeft > 0"
                  class="tw-grid tw-grid-cols-2 tw-gap-2 md:tw-grid-cols-4"
                >
                  <button
                    v-for="amount in helperAmounts"
                    :key="amount"
                    class="tw-btn tw-btn-sm tw-bg-[#e9ecef] tw-text-black hover:tw-text-white"
                    @click="partialAmount = amount"
                  >
                    {{ numberWithCommas(amount) }}
                  </button>
                </div>
              </div>
            </div>

            <div class="tw-flex tw-gap-2">
              <Voucher @apply="applyVoucher" />
              <Affiliate />
            </div>

            <AffiliateCodes />

            <div
              v-if="payments.length"
              class="tw-flex tw-flex-col tw-flex-wrap tw-gap-4 sm:tw-flex-row"
            >
              <div class="tw-flex tw-flex-col tw-items-center tw-gap-4 tw-w-full md:tw-flex-row">
                <p class="tw-w-max tw-font-bold tw-mb-0 tw-border-b tw-border-primary">
                  Selected Payment Method:
                </p>

                <button
                  class="tw-btn tw-btn-primary tw-text-white tw-font-normal tw-shadow-lg tw-ml-auto"
                  @click="resetPaymentMethod"
                >
                  change
                </button>
              </div>

              <PaymentCard
                v-for="(payment, index) in payments"
                :key="`applied-payment-${index}`"
                :amount="payment.amount"
                :method="payment.method"
              >
                <template v-if="payment.method === agreementMethodName" #content>
                  <p
                    class="tw-text-xs tw-opacity-80 tw-mb-1"
                    v-for="(info, index) in agreementPaymentInfo"
                    :key="`applied-agreement-${index}`"
                  >
                    {{ info }}
                  </p>
                </template>
              </PaymentCard>
            </div>

            <div v-if="shouldShowComplete" class="tw-flex tw-flex-col tw-gap-4">
              <p class="tw-text-error tw-mb-0" v-if="error">
                {{ error }}
              </p>

              <button
                :disabled="loading"
                class="tw-btn tw-btn-block tw-shadow-lg tw-text-white tw-font-normal tw-flex tw-gap-2"
                :class="{
                  'tw-btn-primary': !loading,
                  'tw-btn-secondary': loading
                }"
                @click="completePurchase"
              >
                <LoadingIcon
                  v-if="loading"
                  class="tw-w-4 tw-h-4 tw-animate-spin dark:tw-text-gray-200 tw-fill-white"
                />
                <span class="tw-text-white">{{
                  loading ? 'Completing the sale..' : 'Complete Purchase'
                }}</span>
              </button>

              <button
                v-show="shouldShowComplete"
                class="tw-btn tw-btn-primary tw-btn-block tw-shadow-lg tw-text-white tw-font-normal"
                @click="printBill"
              >
                Print
              </button>
            </div>

            <div v-if="!shouldShowComplete">
              <div
                v-if="shouldShowAgreements"
                class="tw-w-full tw-grid tw-grid-flow-col tw-auto-cols-fr tw-gap-4"
              >
                <div tabindex="0" class="tw-collapse">
                  <div
                    class="tw-collapse-title tw-text-white tw-font-normal tw-shadow-lg tw-rounded-lg tw-bg-primary tw-text-center tw-p-3 tw-min-h-0 tw-flex tw-justify-center tw-items-center"
                  >
                    <p class="tw-mb-0">Use Agreement</p>
                  </div>
                  <div
                    class="tw-collapse-content tw-p-0 tw-flex tw-flex-col tw-gap-4 tw-pt-4 tw-pb-0"
                  >
                    <AgreementCard
                      v-for="agreement in agreements"
                      :key="agreement._id"
                      :agreement="agreement"
                    >
                      <template #content>
                        <b class="tw-ml-2" v-if="agreement.type === 'upgrades'">
                          {{ agreement.upgradeName }}
                          {{ agreement.left || 0 }} left
                        </b>

                        <p v-else class="tw-mt-1 tw-text-sm tw-opacity-70">
                          <b>{{ agreement.redeemed }}</b> Redeemed &#8226;
                          <b> {{ agreement.amount - agreement.redeemed }} </b> Left
                        </p>
                      </template>

                      <template #footer>
                        <p class="tw-mt-1 tw-text-sm tw-font-bold">Gentleman’s Agreement</p>
                      </template>
                    </AgreementCard>

                    <AgreementCard
                      v-for="agreement in merchantAgreement"
                      :key="agreement._id"
                      :agreement="agreement"
                    >
                      <template #content>
                        <p class="tw-mt-1 tw-text-sm tw-opacity-70">
                          <b> {{ agreement.redeemed }}</b> Redeemed &#8226;
                          <b> {{ agreement.amount - agreement.redeemed }} </b> Left
                        </p>
                      </template>
                    </AgreementCard>

                    <AgreementCard
                      v-for="agreement in kingsAgreements"
                      :key="agreement._id"
                      :agreement="agreement"
                    >
                      <template #content>
                        <p class="tw-mt-1 tw-text-sm tw-opacity-70">
                          <b> {{ agreement.redeemed }}</b> redeemed &#8226; Expiring at
                          <b>
                            {{ new Date(agreement.expiryDate.seconds * 1000).toDateString() }}
                          </b>
                        </p>
                      </template>
                    </AgreementCard>

                    <AgreementCard
                      v-for="agreement in emperorAgreements"
                      :key="agreement._id"
                      :agreement="agreement"
                    >
                      <template #content>
                        <p class="tw-mt-1 tw-text-sm tw-opacity-70">
                          <b> {{ agreement.redeemed }}</b> redeemed &#8226; Expiring at
                          <b>
                            {{ new Date(agreement.expiryDate.seconds * 1000).toDateString() }}
                          </b>
                        </p>
                      </template>
                    </AgreementCard>
                  </div>
                </div>
              </div>

              <div v-if="amountLeft > 0" class="tw-grid tw-grid-cols-2 tw-gap-4 md:tw-grid-cols-3">
                <button
                  v-for="(method, index) in shownPaymentMethods"
                  :key="`${method.key}-${index}`"
                  class="tw-btn tw-btn-primary tw-text-white tw-font-normal"
                  @click="addPayment(method.key)"
                >
                  {{ method.name }}
                </button>
              </div>

              <div
                v-if="amountLeft < 0"
                class="tw-grid tw-grid-cols-1 tw-gap-4 tw-mt-4 md:tw-grid-cols-2"
              >
                <button
                  class="tw-btn tw-btn-primary tw-text-white tw-font-normal"
                  @click="addPayment('Cash')"
                >
                  Return {{ numberWithCommas(-1 * partialAmount) }} vnd cash
                </button>
                <button
                  class="tw-btn tw-btn-primary tw-text-white tw-font-normal"
                  @click="addPayment('Tip')"
                >
                  {{ numberWithCommas(-1 * partialAmount) }} Tip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import database from '@/config/firebase/database'
import Print from '@/components/common/Print.vue'

import { getDoc, doc } from 'firebase/firestore'
import { findIndex, isEmpty, map, reduce } from 'lodash'
import { mapActions, mapState } from 'pinia'
import { numberWithCommas } from '@/utilities/utility'
import { ref, onValue } from 'firebase/database'
import rtdb from '@/config/firebase/realtime-database'
import { generateOrder } from '@/stores/sale/order'
import SaleItem from './components/SaleItem.vue'
import { STORE_CREDIT_AGREEMENT } from '@/utilities/constants'
import { LoadingIcon } from '@/components/icons'
import AgreementCard from './components/AgreementCard.vue'
import PaymentCard from './components/PaymentCard.vue'
import Affiliate from './components/Affiliate.vue'
import AffiliateCodes from './components/AffiliateCodes.vue'
import Voucher from './components/Voucher.vue'
import { useSale } from '@/stores/sale/sale'
import { useRegister } from '@/stores/register'
import { useApp } from '@/stores/app'
import { useAgreement } from '@/stores/agreement'
import { usePayment } from '@/stores/payment'
import { toast } from 'vue3-toastify'
import { ProductTypes } from '@/stores/sale/saleable'

export default {
  name: 'Payment',
  components: {
    Print,
    SaleItem,
    LoadingIcon,
    AgreementCard,
    PaymentCard,
    Affiliate,
    AffiliateCodes,
    Voucher
  },
  data() {
    return {
      loading: false,
      error: '',
      paid: 0,

      voucher: {} as any,
      partialAmount: 0,
      payments: [] as Array<{ method: string; amount: number; agreements?: Array<any> }>,

      agreements: [] as Array<any>,
      merchantAgreement: [] as Array<any>,
      kingsAgreements: [] as Array<any>,
      emperorAgreements: [] as Array<any>,

      agreementMethodName: 'Store Credit - Agreement'
    }
  },

  computed: {
    ...mapState(useSale, [
      'order',
      'customer',
      'appliedAgreements',
      'totalPayableAmount',
      'agreementTotal',
      'subTotal',
      'visibleSaleDiscount'
    ]),
    ...mapState(useRegister, ['register', 'registerId', 'location']),
    ...mapState(useApp, {
      paymentMethods: 'payments'
    }),

    appliedAgreementIds() {
      return map(this.appliedAgreements, (a) => a.agreement._id)
    },

    agreementPaymentInfo() {
      return reduce(
        this.appliedAgreements,
        (info, applied) => {
          const _applied = applied.agreement
          switch (_applied.type) {
            case ProductTypes.KingsAgreement:
              info.push(`King's Agreement (${_applied.redeemed + 1} Redeemed)`)
              break
            case ProductTypes.EmperorsAgreement:
              info.push(`Emperor's Agreement (${_applied.redeemed + 1} Redeemed)`)
              break
            default:
              info.push(`${_applied.serviceName}(${_applied.left - 1} left)`)
              break
          }

          return info
        },
        [] as Array<string>
      )
    },

    amountLeft() {
      return this.totalPayableAmount - this.cleared
    },

    amountToReturn() {
      return this.partialAmount - this.amountLeft
    },

    helperAmounts() {
      const nearest = [2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000]

      return [
        this.amountLeft,
        ...nearest.map((n) => {
          return Math.ceil(this.amountLeft / n) * n
        })
      ].filter((a, i, arr) => a !== this.partialAmount && i === arr.findIndex((j) => j === a))
    },

    shouldShowComplete() {
      return this.totalPayableAmount === 0 || this.totalPayableAmount - this.cleared === 0
    },

    shouldShowAgreements() {
      return (
        this.agreements.length ||
        this.merchantAgreement.length ||
        this.kingsAgreements.length ||
        this.emperorAgreements.length
      )
    },

    cleared() {
      return this.payments.reduce((total, current) => total + current.amount, 0)
    },

    shownPaymentMethods() {
      return this.paymentMethods.filter((method) => {
        if (!method.active) return false
        if (!method.locations) return true
        if (method.key === 'On Account' && !this.customer?.onAccount) {
          return false
        }
        return method.locations.includes(this.location)
      })
    }
  },

  watch: {
    totalPayableAmount: function (amount) {
      this.partialAmount = amount - this.cleared
    },

    cleared: function (amount) {
      this.partialAmount = this.totalPayableAmount - amount
    },

    agreementTotal: function (amount, _oldAmount) {
      const index = findIndex(
        this.payments,
        (payment: any) => payment.method === STORE_CREDIT_AGREEMENT
      )

      if (amount && index !== -1) {
        this.payments.splice(index, 1, {
          amount,
          method: STORE_CREDIT_AGREEMENT,
          agreements: map(this.appliedAgreements, (a) => a.agreement)
        })
      } else if (!amount && index !== -1) {
        this.payments.splice(index, 1)
      } else if (amount && index === -1) {
        this.payments.push({
          amount,
          method: STORE_CREDIT_AGREEMENT,
          agreements: map(this.appliedAgreements, (a) => a.agreement)
        })
      }
    }
  },

  methods: {
    numberWithCommas,
    map,
    ...mapActions(usePayment, ['setPaymentPersona']),
    ...mapActions(useSale, [
      'complete',
      'revertAllAppliedAgreements',
      'fromSale',
      'flushAppliedAgreements'
    ]),
    ...mapActions(useAgreement, ['fetchAgreements']),
    ...mapActions(useApp, ['setNavbarOption']),

    async init() {
      const { gentleman, merchant, king, emperor } = await this.fetchAgreements()
      this.agreements = gentleman
      this.kingsAgreements = king
      this.merchantAgreement = merchant
      this.emperorAgreements = emperor
    },

    resetPaymentMethod(): void {
      this.revertAllAppliedAgreements()

      this.partialAmount = this.totalPayableAmount
      this.payments = []
      this.paid = 0
    },

    async applyVoucher(voucher: any) {
      const credit = parseInt(voucher.storeCredit)
      if (credit < this.partialAmount) {
        this.partialAmount = credit
      }
      this.addPayment('giftcheque')
    },

    addPayment(method: string, _args = {}) {
      if (!this.partialAmount) return

      this.payments.push({
        amount: this.partialAmount,
        method
      })

      this.partialAmount = this.totalPayableAmount - this.cleared
    },

    printBill() {
      let child: any = this.$refs.bill
      // TODO migrate from distributedPayment
      child.printBill(this.payments)
    },

    async completePurchase() {
      this.loading = true

      const personaParams = {
        orderId: this.order.orderId,
        customer: { ...this.customer },
        order: { ...this.order },
        payments: this.payments
      }

      const data = {
        payments: this.payments,
        voucher: this.voucher
      }

      if (personaParams?.customer?.userId) {
        const customer = await getDoc(doc(database, `users/${personaParams.customer.userId}`))
        if (customer.exists()) {
          personaParams.customer = {
            ...personaParams.customer,
            ...customer.data(),
            _id: customer.id
          }
        }
      }

      try {
        await this.complete(data)
      } catch (e) {
        console.log()
      }

      if (isEmpty(personaParams.customer?.userId)) {
        this.$router.push({ name: 'home' })
      } else {
        this.setPaymentPersona(personaParams)

        this.$router.push({
          name: 'persona',
          params: { orderId: personaParams.orderId }
        })
      }
    }
  },

  mounted() {
    this.setNavbarOption('backButtonOptionNavabar')
    this.flushAppliedAgreements()

    const ordersRef = ref(rtdb, `${this.location}/${this.$route.params.orderId}`)
    onValue(ordersRef, (snapshot) => {
      const order = snapshot.val()
      if (!order && !this.loading) {
        toast.warning('The order has been marked as complete or removed from active orders.')

        this.$router.push({ name: 'home' })

        return
      }

      this.fromSale({ ...generateOrder(), ...order })
    })

    this.init()
      .then(() => console.log('Agreements:: Hydration complete'))
      .catch(console.log)

    this.partialAmount = this.totalPayableAmount
  }
}
</script>
