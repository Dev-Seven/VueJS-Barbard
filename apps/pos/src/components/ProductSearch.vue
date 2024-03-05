<template>
  <div class="tw-relative">
    <input
      v-model="search"
      class="tw-input tw-border tw-border-gray-300 tw-w-full"
      type="search"
      placeholder="Search item…"
      @keyup.enter="onEnter"
    />
    <div class="tw-absolute tw-w-full">
      <div
        v-if="results.length"
        class="tw-h-96 tw-bg-white tw-overflow-auto tw-shadow-md tw-rounded-lg"
        tabindex="0"
        @blur="onBlur"
      >
        <div
          v-for="(item, index) in results"
          class="tw-flex tw-justify-between tw-items-center tw-cursor-pointer tw-px-4 tw-py-2 tw-border-b tw-border-gray-300 hover:tw-bg-[#F7F9FA]"
          :key="`search-item-${index}`"
        >
          <error-boundary>
            <div class="tw-flex tw-justify-center tw-items-center tw-w-full">
              <img
                thumbnail
                small
                left
                fluid
                :src="item?.image"
                class="tw-shadow-md tw-mr-2 tw-w-14 tw-h-14"
                alt="Image 1"
              />
              <div class="tw-flex-grow-1">
                <h5 class="tw-font-bold" v-html="item?.title"></h5>
                <p class="tw-text-sm tw-text-secondary tw-mb-0">
                  Brand:
                  {{
                    item.type !== 'service' && item.type !== 'upgrade'
                      ? item.category.title
                      : 'Services'
                  }}
                  Price:
                  <span class="tw-font-bold">{{
                    item.price ? `₫ ${numberWithCommas(item.price)}` : ''
                  }}</span>
                </p>
              </div>
              <button
                class="tw-ml-auto tw-btn tw-btn-warning tw-flex tw-justify-center tw-items-center tw-text-white"
                @click="saveItem(item)"
              >
                <svg
                  class="tw-w-5 tw-h-5 tw-mr-1"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  fill="currentColor"
                >
                  <path
                    d="M13.5 18c-.828 0-1.5.672-1.5 1.5 0 .829.672 1.5 1.5 1.5s1.5-.671 1.5-1.5c0-.828-.672-1.5-1.5-1.5zm-3.5 1.5c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5zm14-16.5l-.743 2h-1.929l-3.473 12h-13.239l-4.616-11h2.169l3.776 9h10.428l3.432-12h4.195zm-12 4h3v2h-3v3h-2v-3h-3v-2h3v-3h2v3z"
                  />
                </svg>
                <p class="tw-mb-0">Add Item</p>
              </button>
            </div>
          </error-boundary>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import { each, orderBy } from 'lodash'
import { mapState, mapActions } from 'pinia'
import { numberWithCommas } from '@/utilities/utility'
import { useInventory } from '@/stores/inventory/inventory'
import { useSale } from '@/stores/sale/sale'
import { type Product } from '@/stores/inventory/product'
import { ProductTypes } from '@/stores/sale/saleable/product'

export default {
  name: 'ProductSearch',
  components: { ErrorBoundary },
  data() {
    return {
      search: '',
      results: [] as Array<Product>
    }
  },

  computed: {
    ...mapState(useInventory, [
      'Services',
      'Upgrades',
      'getAllFnBProducts',
      'getAllVariants',
      'getAllProducts'
    ])
  },

  methods: {
    numberWithCommas,
    ...mapActions(useSale, { addToSale: 'add' }),

    onBlur() {
      this.search = ''
    },

    onEnter() {
      if (this.results.length) {
        this.saveItem(this.results[0])
      }
    },

    saveItem(product: Product): void {
      const data: any = {
        id: product.id,
        name: product.title,
        category: product.type,
        price: product.price,
        originalPrice: product.price,
        manualPrice: 0,
        manualPromotion: false,
        quantity: 1,
        discount: 0,
        VAT: product.VAT,
        serviceCharge: product.serviceCharge,
        priceAfterDiscount: 0,
        discountByPromotion: 0
      }

      if (product.type === ProductTypes.Service) {
        data.complimentaries = {
          drink: 'drink-complimentary',
          food: 'snack-complimentary'
        }
      }

      if ([ProductTypes.FnB, ProductTypes.FnBVariant].includes(product.type)) {
        ;(data.categoryName = product.data.categoryName), (data.cost = product.data.BOMPrice)
        data.type = ProductTypes.FnB
      }

      if ([ProductTypes.Product, ProductTypes.ProductVariant].includes(product.type)) {
        data.brandName = product.data.brandName
        data.cost = product.data.avgCost
        data.type = ProductTypes.Product
      }

      // Signature drink upgrade
      if (product.data?.linkedDrink) {
        data.complimentaries = {
          drink: 'drink-gentlemanup'
        }
      }

      this.addToSale(data)

      this.onBlur()
    }
  },

  watch: {
    search: {
      handler: function (value): void {
        if (value && value.length > 1) {
          this.results = []

          let fandbList: Array<Product> = []
          each(this.getAllFnBProducts, (product: Product) => {
            const matched =
              value
                .toLowerCase()
                .split(' ')
                .every(
                  (v: any) =>
                    product.title?.toLowerCase().includes(v) ||
                    product.category.title.toLowerCase().includes(v)
                ) || value.toLowerCase().split(' ').includes(product.data.barcode)

            if (matched) {
              if (product.variants.length) {
                fandbList.push(...product.variants)
              } else {
                fandbList.push(product)
              }
            }
          })

          let productList = this.getAllProducts.filter((product: Product) => {
            if (!product.price) {
              return false
            } else {
              return (
                value
                  .toLowerCase()
                  .split(' ')
                  .every(
                    (v: any) =>
                      product.title.toLowerCase().includes(v) ||
                      product.category.title.toLowerCase().includes(v)
                  ) || value.toLowerCase().split(' ').includes(product.data.barcode)
              )
            }
          })
          let variantList = this.getAllVariants.filter((product: Product) => {
            return (
              value
                .toLowerCase()
                .split(' ')
                .every(
                  (v: any) =>
                    product.title.toLowerCase().includes(v) ||
                    product.category.title.toLowerCase().includes(v)
                ) || value.toLowerCase().split(' ').includes(product.data.barcode)
            )
          })
          let serviceList = this.Services.filter((service: Product) => {
            return value
              .toLowerCase()
              .split(' ')
              .every((v: any) => service.title?.toLowerCase().includes(v))
          })
          let upgradeList = this.Upgrades.filter((upgrade: Product) => {
            return value
              .toLowerCase()
              .split(' ')
              .every((v: any) => upgrade.title?.toLowerCase().includes(v))
          })

          this.results = orderBy(
            [...fandbList, ...productList, ...variantList, ...serviceList, ...upgradeList],
            ['title'],
            ['asc']
          )
        } else {
          this.results = []
        }
      }
    }
  }
}
</script>
