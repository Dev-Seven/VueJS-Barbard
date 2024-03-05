<template>
  <div class="tw-flex tw-flex-col tw-gap-4">
    <assigned-guest-card v-if="customer.userId" />
    <search-and-assign-guest v-else @selected="setGuestToTheSale" />

    <div class="tw-flex tw-gap-4">
      <div className="tw-dropdown tw-w-full">
        <label
          tabIndex="{0}"
          className="tw-btn tw-btn-primary tw-text-white tw-font-normal tw-btn-block tw-mb-0"
        >
          {{ order.amountOfGuest }} guests

          <svg
            class="tw-h-4 tw-w-4 tw-ml-1"
            clip-rule="evenodd"
            fill-rule="evenodd"
            stroke-linejoin="round"
            stroke-miterlimit="2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="m16.843 10.211c.108-.141.157-.3.157-.456 0-.389-.306-.755-.749-.755h-8.501c-.445 0-.75.367-.75.755 0 .157.05.316.159.457 1.203 1.554 3.252 4.199 4.258 5.498.142.184.36.29.592.29.23 0 .449-.107.591-.291 1.002-1.299 3.044-3.945 4.243-5.498z"
            />
          </svg>
        </label>
        <ul
          v-if="isOptionShown"
          tabIndex="{0}"
          className="tw-z-50 tw-dropdown-content tw-menu tw-flex-nowrap tw-shadow tw-rounded-lg tw-w-full tw-max-h-96 tw-overflow-auto tw-bg-white"
        >
          <li v-for="(guest, index) in 20" :key="index" @click="onSetGuestCount(guest)">
            <a>{{ guest }}</a>
          </li>
        </ul>
      </div>

      <button
        v-if="!customer.userId"
        class="tw-btn tw-btn-warning tw-text-white tw-font-normal"
        @click="isModalShown = true"
      >
        Add new guest
      </button>

      <add-new-guest v-model:isShown="isModalShown" @created="onNewGuestAdded" />
    </div>

    <div
      v-if="order.orderNote"
      class="tw-flex tw-items-center tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm tw-bg-warning"
    >
      <svg
        class="tw-h-4 tw-w-4 tw-mr-2"
        clip-rule="evenodd"
        fill-rule="evenodd"
        stroke-linejoin="round"
        stroke-miterlimit="2"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="m12.002 21.534c5.518 0 9.998-4.48 9.998-9.998s-4.48-9.997-9.998-9.997c-5.517 0-9.997 4.479-9.997 9.997s4.48 9.998 9.997 9.998zm0-1.5c-4.69 0-8.497-3.808-8.497-8.498s3.807-8.497 8.497-8.497 8.498 3.807 8.498 8.497-3.808 8.498-8.498 8.498zm0-6.5c-.414 0-.75-.336-.75-.75v-5.5c0-.414.336-.75.75-.75s.75.336.75.75v5.5c0 .414-.336.75-.75.75zm-.002 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"
          fill-rule="nonzero"
        />
      </svg>
      <p class="tw-mb-0 tw-whitespace-pre-line">
        {{ order.orderNote }}
      </p>
    </div>

    <div
      class="tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-sm tw-bg-white tw-flex tw-flex-col tw-gap-4 tw-pb-4"
      :style="{ height: order.orderNote ? '62vh' : '68vh' }"
    >
      <div
        v-if="order.products.length"
        id="ordersOpenSales"
        class="tw-overflow-y tw-overflow-x-hidden tw-flex-1"
      >
        <div
          v-if="ItemsAddedInCart.length"
          id="ordersOpenSales"
          class="tw-overflow-y tw-overflow-x-hidden tw-flex-1"
        >
          <component
            :is="item.component"
            v-for="(item, index) in ItemsAddedInCart"
            ref="items"
            :key="item.item.uuid"
            :index="index"
            :item="item.item"
            class="my-1"
          />
        </div>
      </div>
      <p
        v-else
        class="tw-border-b tw-border-gray-300 tw-m-auto tw-pt-3 tw-text-center tw-font-bold"
      >
        Add Something to your order
      </p>

      <hr class="tw-border-t tw-border-gray-300 tw-border-b-none tw-my-0" />

      <div
        v-for="(promotion, index) in promotionToDisplay"
        :key="`applied-promotion-${index}`"
        class="tw-flex tw-items-center tw-px-4 tw-gap-4"
      >
        <h6 class="tw-mb-0">{{ promotion.name }}</h6>
        <h6 class="tw-mb-0 tw-ml-auto">{{ numberWithCommas(promotion.promotionDiscount) }} ₫</h6>
        <svg
          class="tw-w-4 tw-h-4 tw-cursor-pointer tw-text-error"
          clip-rule="evenodd"
          fill-rule="evenodd"
          stroke-linejoin="round"
          stroke-miterlimit="2"
          viewBox="0 0 24 24"
          fill="currentColor"
          @click="removePromotion(promotion)"
        >
          <path
            d="m20.015 6.506h-16v14.423c0 .591.448 1.071 1 1.071h14c.552 0 1-.48 1-1.071 0-3.905 0-14.423 0-14.423zm-5.75 2.494c.414 0 .75.336.75.75v8.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-8.5c0-.414.336-.75.75-.75zm-4.5 0c.414 0 .75.336.75.75v8.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-8.5c0-.414.336-.75.75-.75zm-.75-5v-1c0-.535.474-1 1-1h4c.526 0 1 .465 1 1v1h5.254c.412 0 .746.335.746.747s-.334.747-.746.747h-16.507c-.413 0-.747-.335-.747-.747s.334-.747.747-.747zm4.5 0v-.5h-3v.5z"
            fill-rule="nonzero"
          />
        </svg>
      </div>

      <div v-if="salePromotion.amount" class="tw-flex tw-items-center tw-px-4 tw-gap-4">
        <h6 class="tw-mb-0">{{ salePromotion.promotion.name }}</h6>
        <h6 class="tw-mb-0 tw-ml-auto">
          {{ numberWithCommas(salePromotion.amount) }} ₫ ({{ salePromotion.percentage }})
        </h6>
        <svg
          class="tw-w-4 tw-h-4 tw-cursor-pointer tw-text-error"
          clip-rule="evenodd"
          fill-rule="evenodd"
          stroke-linejoin="round"
          stroke-miterlimit="2"
          viewBox="0 0 24 24"
          fill="currentColor"
          @click="removePromotion(salePromotion.promotion)"
        >
          <path
            d="m20.015 6.506h-16v14.423c0 .591.448 1.071 1 1.071h14c.552 0 1-.48 1-1.071 0-3.905 0-14.423 0-14.423zm-5.75 2.494c.414 0 .75.336.75.75v8.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-8.5c0-.414.336-.75.75-.75zm-4.5 0c.414 0 .75.336.75.75v8.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-8.5c0-.414.336-.75.75-.75zm-.75-5v-1c0-.535.474-1 1-1h4c.526 0 1 .465 1 1v1h5.254c.412 0 .746.335.746.747s-.334.747-.746.747h-16.507c-.413 0-.747-.335-.747-.747s.334-.747.747-.747zm4.5 0v-.5h-3v.5z"
            fill-rule="nonzero"
          />
        </svg>
      </div>

      <div v-if="visibleSaleDiscount?.amount" class="tw-flex tw-items-center tw-px-4 tw-gap-4">
        <h6 class="tw-mb-0">
          {{ visibleSaleDiscount.promotion?.name || 'Special Discount' }}
        </h6>
        <h6 class="tw-mb-0 tw-ml-auto">
          - {{ numberWithCommas(visibleSaleDiscount.amount) }} ₫
          <span v-if="visibleSaleDiscount.type == 'percentage'">
            ({{ visibleSaleDiscount.percentage }})%
          </span>
        </h6>
        <svg
          class="tw-w-4 tw-h-4 tw-cursor-pointer tw-text-error"
          clip-rule="evenodd"
          fill-rule="evenodd"
          stroke-linejoin="round"
          stroke-miterlimit="2"
          viewBox="0 0 24 24"
          fill="currentColor"
          @click="resetDiscount"
        >
          <path
            d="m20.015 6.506h-16v14.423c0 .591.448 1.071 1 1.071h14c.552 0 1-.48 1-1.071 0-3.905 0-14.423 0-14.423zm-5.75 2.494c.414 0 .75.336.75.75v8.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-8.5c0-.414.336-.75.75-.75zm-4.5 0c.414 0 .75.336.75.75v8.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-8.5c0-.414.336-.75.75-.75zm-.75-5v-1c0-.535.474-1 1-1h4c.526 0 1 .465 1 1v1h5.254c.412 0 .746.335.746.747s-.334.747-.746.747h-16.507c-.413 0-.747-.335-.747-.747s.334-.747.747-.747zm4.5 0v-.5h-3v.5z"
            fill-rule="nonzero"
          />
        </svg>
      </div>

      <div v-if="totalPointsEarned" class="tw-flex tw-items-center tw-h-8 tw-px-4 tw-bg-sky-500">
        <div class="tw-h-5 tw-w-5 tw-pl-1 tw-pt-1 tw-bg-amber-500 tw-pl-1 tw-pt-1 tw-rounded-full">
          <StarFillIcon class="tw-h-3 tw-w-3 tw-text-amber-300" />
        </div>
        <div class="tw-mx-2 tw-text-sm tw-text-white">
          <span class="tw-font-bold">
            {{ totalPointsEarned }}
          </span>
          Coins earned with this sale!
        </div>
      </div>

      <div class="tw-flex tw-flex-col tw-gap-4 tw-px-4 lg:tw-flex-row">
        <div class="tw-w-full">
          <button
            class="tw-btn tw-btn-sm tw-btn-secondary tw-btn-block tw-text-white tw-font-normal"
            @click="isDiscountModalShown = true"
          >
            <PercentageIcon class="tw-h-5 tw-w-5" />
          </button>
          <discount v-model:isShown="isDiscountModalShown" />
        </div>

        <div class="tw-w-full">
          <button
            class="tw-btn tw-btn-sm tw-btn-secondary tw-btn-block tw-text-white tw-font-normal"
            @click="isPromotionModalShown = true"
          >
            <GiftIcon class="tw-h-5 tw-w-5" />
          </button>
          <promotion v-model:isShown="isPromotionModalShown" />
        </div>

        <div class="tw-w-full">
          <button
            class="tw-btn tw-btn-sm tw-btn-secondary tw-btn-block tw-text-white tw-font-normal"
            @click="isAffiliateModalShown = true"
          >
            <CouponIcon class="tw-h-5 tw-w-7" fill="white" />
          </button>
          <affiliate v-model:isShown="isAffiliateModalShown" />
        </div>

        <div class="tw-w-full">
          <button
            class="tw-btn tw-btn-sm tw-btn-secondary tw-btn-block tw-text-white tw-font-normal tw-relative"
            @click="isNoteModalShown = true"
          >
            <ClipBoard class="tw-h-5 tw-w-5" />
            <div
              v-if="order.orderNote"
              class="tw-bg-success tw-rounded-full tw-w-4 tw-h-4 tw-absolute -tw-top-1 -tw-right-1"
            ></div>
          </button>
          <add-note v-model:isShown="isNoteModalShown" />
        </div>

        <div class="tw-w-full">
          <button
            class="tw-btn tw-btn-sm tw-btn-secondary tw-btn-block tw-text-white tw-font-normal tw-relative"
            @click="isSplitSaleModalShown = true"
          >
            <CutIcon class="tw-h-5 tw-w-5" />
          </button>
          <split-sale v-model:isShown="isSplitSaleModalShown" @split="onOrderSplit" />
        </div>
      </div>

      <p v-if="error" class="tw-text-error tw-mb-0 tw-px-4">
        {{ error }}
      </p>

      <div
        class="tw-grid tw-grid-flow-row tw-items-center lg:tw-grid-flow-col tw-gap-4 tw-px-4 tw-max-w-full"
      >
        <button class="tw-btn tw-btn-primary tw-text-white tw-font-normal" @click="printTheSale">
          <PrintIcon class="tw-h-5 tw-w-5 tw-text-white" />
        </button>
        <button
          class="tw-btn tw-btn-primary tw-text-white tw-font-normal tw-btn-block"
          @click="redirectToPayment"
        >
          Confirm Sale
        </button>

        <h1 class="tw-text-lg tw-font-bold">
          ₫ {{ totalPayableAmount ? numberWithCommas(totalPayableAmount) : 0 }}
        </h1>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import AddNote from '@/components/modal/AddNote.vue'
import Discount from '@/components/modal/Discount.vue'
import Promotion from '@/components/modal/Promotion.vue'
import Affiliate from '@/components/modal/Affiliate.vue'
import SplitSale from '@/components/modal/SplitSale.vue'
import AddNewGuest from '@/components/modal/AddNewGuest.vue'
import { mapActions, mapState } from 'pinia'
import { isEmpty, has, isObject, some } from 'lodash'
import { getInitials, numberWithCommas } from '@/utilities/utility'
import AssignedGuestCard from '../customer/AssignedGuestCard.vue'
import SearchAndAssignGuest from '../customer/SearchAndAssignGuest.vue'
import { GiftIcon, PercentageIcon, CutIcon, ClipBoard, StarFillIcon } from '@/components/icons'
import { toast } from 'vue3-toastify'
import { ProductTypes } from '@/stores/sale/saleable/product'
import { useSale } from '@/stores/sale/sale'
import { useStaff } from '@/stores/staff'
import { useInventory } from '@/stores/inventory/inventory'
import { useEvents } from '@/stores/events'
import { useRegister } from '@/stores/register'
import ItemCard from './ItemCard.vue'
import GentlemanAgreementCard from './GentlemanAgreementCard.vue'
import KingsAgreementCard from './KingsAgreementCard.vue'
import MerchantsAgreementCard from './MerchantsAgreementCard.vue'
import LockerBoxCard from './LockerBoxCard.vue'
import GiftChequeCard from './GiftChequeCard.vue'
import PrintIcon from '@/components/icons/PrintIcon.vue'
import CouponIcon from '@/components/icons/CouponIcon.vue'

export default {
  name: 'DisplayOpenSales',
  components: {
    ItemCard,
    GentlemanAgreementCard,
    MerchantsAgreementCard,
    KingsAgreementCard,
    LockerBoxCard,
    GiftChequeCard,
    AddNote,
    Discount,
    Promotion,
    AddNewGuest,
    SplitSale,
    AssignedGuestCard,
    SearchAndAssignGuest,
    GiftIcon,
    PercentageIcon,
    CutIcon,
    ClipBoard,
    PrintIcon,
    StarFillIcon,
    CouponIcon,
    Affiliate
  },

  props: {
    mode: {
      type: Object
    }
  },

  data: () => {
    return {
      error: '',
      isLoading: false,
      isModalShown: false,
      isSplitSaleModalShown: false,
      isOptionShown: true,
      isDiscountModalShown: false,
      isPromotionModalShown: false,
      isNoteModalShown: false,
      isAffiliateModalShown: false
    }
  },

  computed: {
    ProductTypes() {
      return ProductTypes
    },
    ...mapState(useSale, [
      'order',
      'products',
      'total',
      'customer',
      'visibleSaleDiscount',
      'promotionToDisplay',
      'salePromotion',
      'totalPayableAmount',
      'totalPointsEarned'
    ]),
    ...mapState(useStaff, ['active']),
    ...mapState(useRegister, ['location']),
    ...mapState(useInventory, ['FnBProducts']),

    ItemsAddedInCart(): Array<any> {
      const card = (type: string) => {
        switch (type) {
          case ProductTypes.GentlemanAgreement:
            return 'GentlemanAgreementCard'
          case ProductTypes.MerchantsAgreement:
          case ProductTypes.GrandMerchantsAgreement:
            return 'MerchantsAgreementCard'
          case ProductTypes.KingsAgreement:
          case ProductTypes.EmperorsAgreement:
            return 'KingsAgreementCard'
          case ProductTypes.LockerBox:
            return 'LockerBoxCard'
          case ProductTypes.GiftCheque:
            return 'GiftChequeCard'
          default:
            return 'ItemCard'
        }
      }
      return this.products.map((item) => ({
        component: card(item.type),
        item
      }))
    }
  },

  methods: {
    getInitials,
    numberWithCommas,
    isEmpty,
    isObject,
    some,

    ...mapActions(useSale, [
      'assignCustomer',
      'setGuestCount',
      'resetDiscount',
      'removePromotion',
      'updateStatus'
    ]),
    ...mapActions(useEvents, ['setFoodandDrink']),

    onOrderSplit(orderId: string) {
      this.$router.replace({
        name: 'sale',
        params: { orderId }
      })
    },

    async redirectToPayment(): void {
      let shouldProceed = true

      this.$refs.items.forEach((ref) => {
        if (has(ref, 'validator')) {
          shouldProceed = ref.validator()
        }
      })

      if (!shouldProceed) {
        return
      }

      let valid = true
      this.products.forEach((p) => {
        if (p.category === ProductTypes.Service) {
          if (!p?.complimentaryDrink || !p?.complimentaryFood) {
            valid = false
          }
        }
      })

      if (!valid) {
        toast('You have to select complimentary drink and food!', {
          type: toast.TYPE.WARNING,
          transition: toast.TRANSITIONS.SLIDE,
          theme: toast.THEME.LIGHT,
          position: toast.POSITION.BOTTOM_LEFT
        })
        return
      }

      if (!this.customer.userId && !isEmpty(this.order.manualPromotion)) {
        toast('Customer should exist if you want to apply promotion', {
          type: toast.TYPE.WARNING,
          transition: toast.TRANSITIONS.SLIDE,
          theme: toast.THEME.LIGHT,
          position: toast.POSITION.BOTTOM_LEFT
        })
        return
      }

      if (!isEmpty(this.order.eventItem)) {
        this.setFoodandDrink({
          location: this.location,
          _id: this.order.eventItem._id,
          food: this.order.eventItem.food || '',
          drink: this.order.eventItem.drink || ''
        })
      }

      await this.updateStatus('cheque-requested')

      toast('Cheque has been Requested', {
        type: toast.TYPE.SUCCESS,
        transition: toast.TRANSITIONS.SLIDE,
        theme: toast.THEME.LIGHT,
        position: toast.POSITION.BOTTOM_LEFT
      })

      this.$router.push({
        name: 'payment',
        params: { orderId: this.order.orderId }
      })
    },

    printTheSale() {
      this.$emit('printTheSale')
      this.error = ''
    },

    onNewGuestAdded(data: any): void {
      this.setGuestToTheSale({ ...data, phone: data.phoneNumber })
    },

    setGuestToTheSale(user: any) {
      this.assignCustomer(user)
    },

    onSetGuestCount(count: number) {
      this.isOptionShown = false
      this.setGuestCount(count)

      setTimeout(() => {
        this.isOptionShown = true
      }, 300)
    }
  },

  mounted() {
    if (!isEmpty(this.order.eventItem)) {
      // TODO Unknown code block to investigate
      // this.getComplimentaryItems()
      // if (this.order.eventItem.food) {
      //   this.food = this.order.eventItem.food
      // }
      // if (this.order.eventItem.drink) {
      //   this.drink = this.order.eventItem.drink
      // }
    }
  }
}
</script>
