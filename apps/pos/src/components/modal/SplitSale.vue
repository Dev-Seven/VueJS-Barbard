<template>
  <Modal :isShown="isShown">
    <div
      class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
    >
      <h6 class="tw-mb-0">Split Sale</h6>

      <CloseIcon class="tw-w-4 tw-h-4 tw-cursor-pointer" @click="$emit('update:isShown', false)" />
    </div>

    <div class="tw-grid tw-grid-cols-2">
      <div class="tw-p-2">
        <input
          type="text"
          class="tw-input tw-w-full tw-px-3 tw-border tw-border-gray-300 focus:tw-outline-none"
          placeholder="Custom Bill"
          v-model="customBill"
        />
      </div>

      <div class="tw-p-2">
        <select
          class="tw-select tw-select-bordered tw-w-full"
          @change="setTable(($event.target as HTMLInputElement).value)"
        >
          <option disabled selected>Select Table</option>
          <option
            v-for="table in tables"
            :key="`table-${table._id}`"
            :value="table._id"
            :disabled="occupiedTableIds.includes(table._id)"
          >
            {{ table.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="tw-flex tw-flex-col tw-py-6 tw-gap-4">
      <div class="tw-overflow-auto tw-px-6 tw-max-h-96">
        <table class="tw-table tw-table-compact tw-w-full">
          <thead>
            <tr>
              <th>Quantity</th>
              <th>Item</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in products" :key="`split-sale-item-${index}`">
              <td class="tw-w-1/4">
                {{ product.quantity }}
              </td>

              <td class="tw-w-1/2">
                {{ product.name }}
              </td>

              <td class="tw-w-1/6">
                <div class="tw-flex">
                  <button
                    class="tw-btn tw-btn-gray-300 tw-btn-sm tw-rounded-r-none tw-text-white"
                    :disabled="!find(splits, (i) => i.id === product.id)?.quantity"
                    @click="decrement(product.id)"
                  >
                    <MinusIcon class="tw-w-3 tw-h-3" />
                  </button>
                  <input
                    class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-w-full tw-rounded-none focus:tw-outline-none hidden-number-input"
                    type="number"
                    pattern="[0-9]*"
                    :value="find(splits, (i) => i.id === product.id)?.quantity || 0"
                    placeholder="Qty."
                  />
                  <button
                    class="tw-btn tw-btn-gray-300 tw-btn-sm tw-rounded-l-none tw-text-white"
                    :disabled="
                      find(splits, (i) => i.id === product.id)?.quantity >= product.quantity
                    "
                    @click="increment(product.id)"
                  >
                    <PlusIcon class="tw-w-3 tw-h-3" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="tw-px-6 tw-pb-6 tw-flex tw-justify-end">
      <button class="tw-btn tw-btn-primary tw-text-white tw-font-normal" @click="splitSale">
        Split
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import { mapState, mapActions } from 'pinia'
import { findIndex, isEmpty, find, forEach } from 'lodash'
import { PlusIcon, MinusIcon, CloseIcon } from '@/components/icons'
import Modal from '@/components/common/Modal.vue'
import { toast } from 'vue3-toastify'
import { useSale } from '@/stores/sale/sale'
import { useTables } from '@/stores/table'
import type { SaleProduct } from '@/stores/sale/types'
export default {
  name: 'SplitSale',
  components: {
    Modal,
    PlusIcon,
    MinusIcon,
    CloseIcon
  },
  props: {
    isShown: [Boolean]
  },
  data() {
    return {
      splits: [] as Array<{ id: string; quantity: number }>,
      customBill: '',
      table: {}
    }
  },

  computed: {
    ...mapState(useSale, ['products']),
    ...mapState(useTables, ['tables', 'occupiedTableIds'])
  },
  methods: {
    isEmpty,
    find,

    ...mapActions(useSale, {
      split: 'splitSale'
    }),

    setTable(id: string) {
      const table = find(this.tables, (t) => t._id === id)
      if (table) {
        this.table = table
      }
    },

    increment(id: string) {
      const index = findIndex(this.splits, (s) => s.id === id)
      if (index === -1) {
        this.splits.push({
          id,
          quantity: 1
        })
      } else {
        const item = this.splits[index]
        this.splits.splice(index, 1, {
          id: item.id,
          quantity: item.quantity + 1
        })
      }
    },

    decrement(id: string) {
      const index = findIndex(this.splits, (s) => s.id === id)
      if (index !== -1) {
        const item = this.splits[index]
        if (item.quantity === 1) {
          this.splits.splice(index, 1)
        } else {
          this.splits.splice(index, 1, {
            id: item.id,
            quantity: item.quantity - 1
          })
        }
      }
    },

    async splitSale() {
      if (isEmpty(this.table) && !this.customBill) {
        // Must select a table or make a custom bill
        toast.warning('Must enter custom bill or select table to split the order')

        return
      }

      const products = [] as Array<SaleProduct>
      forEach(this.splits, (split) => {
        const product = find(this.products, (p) => p.id === split.id)
        if (product) {
          products.push({
            ...product,
            ...split
          })
        }
      })

      const payload = {
        products,
        customBill: this.customBill,
        tableId: this.table?._id,
        tableName: this.table?.name,
        department: 'bar',
        salesCategory: 'bar'
      }

      try {
        const order = await this.split(payload)
        toast.info('Order has been splitted')

        setTimeout(() => {
          this.$emit('split', order.orderId)
        }, 1500)
      } catch (e) {
        toast.error(`Order can not be splitted due to technical problem, Please try again`)
        console.log(e)
      } finally {
        this.$emit('update:isShown', false)
      }
    }
  }
}
</script>
