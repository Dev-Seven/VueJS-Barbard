<template>
  <div class="tw-container tw-max-w-screen-xl tw-pt-10 tw-px-4 sm:tw-px-12">
    <print ref="bill" />
    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-5 tw-gap-4 tw-justify-between">
      <div
        v-if="customer.customerAlert"
        class="tw-alert tw-alert-warning tw-flex tw-justify-start tw-shadow-lg tw-py-3 tw-rounded-lg tw-col-span-1 md:tw-col-span-5"
      >
        <WarningIcon class="tw-w-4 tw-h-4" />
        {{ customer.customerAlert }}
      </div>
      <div class="md:tw-col-span-3">
        <product-search class="tw-mb-4" />

        <router-view />

        <InventoryTabs :tabs="tabs" @change="onTabChanged" ref="inventory">
          <template #f-n-b>
            <FnBProducts
              v-if="currentFandBCategory"
              @closed-category-products="currentFandBCategory = 0"
              :category="currentFandBCategory"
            />
            <div class="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-3" v-else>
              <div v-for="(FB, index) in availableFnBBrands" :key="index">
                <div
                  class="tw-font-bold tw-flex tw-items-center tw-justify-center tw-text-center tw-border tw-rounded-lg tw-shadow-sm tw-cursor-pointer tw-h-40 hover:tw-border-primary hover:tw-bg-primary hover:tw-bg-opacity-10 hover:tw-text-primary"
                  @click="currentFandBCategory = Number(FB.id)"
                >
                  <span>
                    <strong>{{ FB.title }}</strong>
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template #products>
            <Products
              v-if="currentProductCategory"
              @closed-category-products="currentProductCategory = 0"
              :category="currentProductCategory"
            />
            <div class="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-3" v-else>
              <div v-for="(brand, index) in availableBrands" :key="index">
                <div
                  class="tw-font-bold tw-flex tw-items-center tw-justify-center tw-text-center tw-border tw-rounded-lg tw-shadow-sm tw-cursor-pointer tw-h-40 hover:tw-border-primary hover:tw-bg-primary hover:tw-bg-opacity-10 hover:tw-text-primary"
                  @click="currentProductCategory = Number(brand.id)"
                >
                  {{ brand.title }}
                </div>
              </div>
            </div>
          </template>

          <template #services>
            <div class="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2">
              <div v-if="showServices" class="tw-col-span-2">
                <Services @closed-category-products="closeCategory" />
              </div>
              <SaleCard
                v-if="isMainTab"
                :class="{ 'text-dark bg-warning border-0': isAgreementActive }"
                @click="openServicesCategory()"
                title="Services"
              />

              <div v-if="showUpgrades" class="tw-col-span-2">
                <Upgrades @closed-category-products="closeCategory" />
              </div>
              <SaleCard
                v-if="isMainTab"
                :class="{ 'text-dark bg-warning border-0': isAgreementActive }"
                @click="openUpgradesCategory()"
                title="Upgrades"
              />

              <div v-if="showAgreements" class="tw-col-span-2">
                <Agreements
                  @closed-category-products="closeCategory"
                  @show-services="onAgreementAddedToSale"
                />
              </div>
              <SaleCard
                v-if="isMainTab"
                :disabled="!isUserAddedToSale"
                @click="isUserAddedToSale ? openAgreementsCategory() : null"
              >
                <strong>Agreements</strong>
                <small v-if="!isUserAddedToSale">Add a guest first</small>
              </SaleCard>
              <SaleCard
                v-if="isMainTab"
                :disabled="!isUserAddedToSale"
                @click="isUserAddedToSale ? sellLockerbox() : null"
              >
                <strong>Lockerbox</strong>
                <small v-if="!isUserAddedToSale">Add a guest first</small>

                <template #footer>
                  <Points :points="$options.points.LockerBox" />
                </template>
              </SaleCard>
              <SaleCard v-if="isMainTab" @click="sellGiftCheque">
                <strong>Gift Cheque</strong>
              </SaleCard>
            </div>
          </template>
        </InventoryTabs>
      </div>
      <div class="md:tw-col-span-2">
        <display-open-sales @printTheSale="printTheSale" :mode="mode" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DisplayOpenSales from '@/components/sale/DisplayOpenSales.vue'
import Products from '@/views/inventory/Products.vue'
import FnBProducts from '@/views/inventory/FnBProducts.vue'
import Services from '@/views/inventory/Services.vue'
import Upgrades from '@/views/inventory/Upgrades.vue'
import Agreements from '@/views/inventory/Agreements.vue'
import SaleCard from './components/SaleCard.vue'
import InventoryTabs from './components/InventoryTabs.vue'
import Print from '@/components/common/Print.vue'
import { WarningIcon } from '@/components/icons'
import { mapActions, mapState } from 'pinia'
import ProductSearch from '@/components/ProductSearch.vue'
import db from '@/config/firebase/realtime-database'
import { ref, onValue } from 'firebase/database'
import { useApp, useSale, useTables, useRegister, useInventory } from '@/stores'
import { ProductTypes } from '@/stores/sale/saleable/product'
import { generateSaleItem } from '@/utilities/sale'
import { toast, type ToastOptions } from 'vue3-toastify'
import { generateOrder } from '@/stores/sale/order'
import { debounce } from 'lodash'
import { FixedPoints } from '../../utilities/constants'
import Points from './components/Points.vue'

export default {
  points: FixedPoints,
  components: {
    DisplayOpenSales,
    Products,
    FnBProducts,
    Services,
    Upgrades,
    Agreements,
    Print,
    ProductSearch,
    WarningIcon,
    SaleCard,
    InventoryTabs,
    Points
  },

  created() {
    window.dispatchEvent(new Event('orders'))
    this.setTablesForCurrentLocation()
  },

  beforeRouteEnter(_to, _from, next) {
    next((vm: any) => {
      vm.hydrate()
    })
  },

  beforeRouteLeave() {
    this.listener()
  },

  data() {
    return {
      listener: () => {},
      showServices: false,
      showUpgrades: false,
      showAgreements: false,

      tabs: [
        {
          name: 'F & B',
          key: 'f-n-b'
        },
        {
          name: 'Products',
          key: 'products',
          active: true
        },
        {
          name: 'Services',
          key: 'services'
        }
      ],

      isMainTab: true,
      currentProductCategory: 0,
      currentFandBCategory: 0,
      mode: {
        king: false,
        service: false,
        lockerbox: false,
        giftcheque: false
      },
      nextId: {
        services: 1,
        king: 1,
        lockerbox: 1,
        giftcheque: 1
      }
    }
  },

  computed: {
    ...mapState(useSale, ['customer', 'selectedAgreementId', 'order']),
    ...mapState(useRegister, ['location']),
    ...mapState(useInventory, ['availableBrands', 'availableFnBBrands']),

    isUserAddedToSale() {
      return !!this.customer.userId
    },

    isAgreementActive() {
      if (this.selectedAgreementId) this.openServicesCategory()
      return this.selectedAgreementId
    }
  },

  methods: {
    ...mapActions(useApp, ['setNavbarOption']),
    ...mapActions(useSale, { addToSale: 'add', fromSale: 'fromSale' }),
    ...mapActions(useTables, ['setTablesForCurrentLocation']),

    onTabChanged(_tab: string) {
      this.currentProductCategory = 0
      this.currentFandBCategory = 0
      this.showServices = false
      this.showUpgrades = false
      this.isMainTab = true
    },

    async hydrate() {
      this.setNavbarOption('multipleOptionNavbar')
      const ordersRef = ref(db, `${this.location}/${this.$route.params.orderId}`)

      const _onValue = debounce(async (snapshot: any) => {
        const order = snapshot.val()
        if (!order) {
          const redirectAfter = 2000
          await new Promise((resolve) => {
            toast('The order has been marked as complete or removed from active orders.', {
              autoClose: redirectAfter,
              type: toast.TYPE.WARNING,
              transition: toast.TRANSITIONS.SLIDE,
              theme: toast.THEME.LIGHT,
              position: toast.POSITION.BOTTOM_LEFT
            } as ToastOptions)

            setTimeout(resolve, redirectAfter)
          })

          this.$router.push({ name: 'home' })

          return
        } else {
          this.fromSale({ ...generateOrder(), ...order })
          if (order.status === 'cheque-confirmed') {
            this.$router.push({
              name: 'payment',
              params: { orderId: this.order.orderId }
            })
            return
          }
        }
      }, 500)

      this.listener = onValue(ordersRef, _onValue)
    },

    closeCategory() {
      this.showServices = false
      this.showUpgrades = false
      this.showAgreements = false
      this.isMainTab = true
    },

    openServicesCategory(): void {
      this.showServices = true
      this.isMainTab = false
    },

    openAgreementsCategory(): void {
      this.showAgreements = true
      this.isMainTab = false
    },

    openUpgradesCategory(): void {
      this.showUpgrades = true
      this.isMainTab = false
    },

    printTheSale() {
      let child: any = this.$refs.bill
      child.printBill()
    },

    sellLockerbox() {
      const lockerbox = generateSaleItem({
        id: 'LockerBox',
        name: 'Locker Box',
        price: 42000000,
        type: ProductTypes.LockerBox,
        category: ProductTypes.LockerBox,
        VAT: { amount: 8, label: '8%' },
        months: 12,
        lockerNumber: 1,
        freeGuests: 3,
        points: FixedPoints.LockerBox
      })

      this.addToSale(lockerbox)
    },

    sellGiftCheque() {
      const giftcheque = generateSaleItem({
        id: 'GiftCheque',
        name: 'Gift Cheque',
        type: ProductTypes.GiftCheque,
        category: ProductTypes.GiftCheque,
        price: 100000,
        code: ''
      })

      this.addToSale(giftcheque)
    },

    onAgreementAddedToSale() {
      this.$refs.inventory.changeTab('services')
      this.showServices = true
    }
  },

  watch: {
    '$route.params': {
      handler() {
        this.hydrate()
      }
    }
  }
}
</script>

<style scoped>
.box4after {
  transform: rotateY(180deg);
}

.text-rotate {
  transform: rotateY(180deg);
}

.box4before {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
</style>
