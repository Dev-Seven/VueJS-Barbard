<template>
  <div class="tw-container tw-max-w-screen-xl tw-pt-10 tw-px-4 sm:tw-px-12">
    <h2
      class="tw-text-3xl tw-text-secondary tw-font-bold tw-border-b tw-border-primary tw-py-2 tw-mb-4 tw-w-max"
    >
      New Order
    </h2>

    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-5 tw-gap-4 tw-items-start">
      <div class="md:tw-col-span-3 tw-w-full tw-card tw-border-gray-300 tw-shadow-md tw-bg-white">
        <div class="tw-card-body tw-p-4 tw-flex tw-flex-col tw-gap-4">
          <p class="tw-font-bold tw-shrink-0 tw-mb-0 tw-border-b tw-border-primary tw-w-max">
            Add custom bill
          </p>
          <input
            v-model="info.customBill"
            class="tw-input tw-border tw-border-gray-300 tw-w-full"
            type="text"
            placeholder="Add Custom Bill Details"
          />

          <div v-if="!info.customBill" class="tw-flex tw-flex-col tw-gap-4">
            <p class="tw-text-error tw-mb-0" v-if="error.table">
              {{ error.table }}
            </p>

            <div class="tw-grid tw-grid-cols-4 tw-gap-4">
              <div v-for="table in sortedTables" :key="table._id">
                <div
                  v-if="occupiedTableIds.includes(table._id)"
                  class="tw-font-bold tw-p-4 tw-text-center tw-border tw-border-gray-300 tw-bg-gray-300 tw-rounded-lg tw-text-secondary"
                >
                  {{ table.name }}
                </div>
                <div
                  v-else
                  :class="{
                    'tw-cursor-pointer tw-text-primary hover:tw-bg-primary hover:tw-bg-opacity-10':
                      info.tableId !== table._id,
                    'tw-bg-primary tw-text-white tw-pointer-events-none': info.tableId === table._id
                  }"
                  class="tw-font-bold tw-p-4 tw-text-center tw-border tw-border-primary tw-rounded-lg"
                  @click="() => setTable(table)"
                >
                  {{ table.name }}
                </div>
              </div>
            </div>

            <div class="tw-flex tw-justify-end tw-gap-4">
              <label className="tw-label tw-cursor-pointer">
                <input
                  v-model="sortTableByAsc"
                  type="radio"
                  name="is-cash"
                  className="tw-radio tw-border-gray-700 tw-mr-1"
                  v-bind:value="false"
                />
                <span className="tw-label-text tw-text-gray-600">DESC</span>
              </label>
              <label className="tw-label tw-cursor-pointer">
                <input
                  v-model="sortTableByAsc"
                  type="radio"
                  name="is-cash"
                  className="tw-radio tw-border-gray-700 tw-mr-1"
                  v-bind:value="true"
                />
                <span className="tw-label-text tw-text-gray-600">ASC</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div
        class="md:tw-col-span-2 tw-w-full tw-card tw-border tw-border-gray-300 tw-shadow-md tw-bg-white"
      >
        <div class="tw-card-body tw-p-4 tw-flex tw-items-center tw-gap-2">
          <button
            v-if="!customer.userId"
            class="tw-btn tw-btn-warning tw-btn-block tw-text-white tw-font-normal"
            @click="isModalShown = true"
          >
            Add new guest
          </button>

          <add-new-guest v-model:isShown="isModalShown" @created="onNewGuestAdded" />

          <search-and-assign-guest
            v-if="!customer.userId"
            class="tw-w-full"
            @selected="assignCustomer"
          />
          <assigned-guest-card v-if="customer.userId" class="tw-rounded-xl tw-w-full" />

          <div class="tw-flex tw-items-center tw-gap-4 tw-w-full">
            <input
              v-model="info.amountOfGuest"
              class="tw-input tw-border tw-border-gray-300 tw-w-full"
              type="text"
              placeholder="Enter amount of guests"
            />
            <p class="tw-font-bold tw-border-b tw-border-primary tw-mb-0">Guests</p>
          </div>

          <p class="tw-text-error tw-text-sm" v-if="error.amountOfGuest">
            {{ error.amountOfGuest }}
          </p>

          <inputpad
            @store-value="setGuestAmount"
            @set-backspace="PressedBackspace = false"
            :keybordValue="keyValue"
            :isBackspacePressed="PressedBackspace"
          />

          <textarea
            v-model="info.orderNote"
            id="order-note"
            name="order-note"
            rows="3"
            placeholder="Note about order...."
            class="tw-textarea tw-border tw-border-gray-300 tw-w-full"
            style="resize: none"
          >
          </textarea>

          <select
            v-model="info.salesCategory"
            class="tw-select tw-w-full tw-border tw-border-gray-300"
          >
            <option v-for="category in salesCategories" :key="category._id" :value="category._id">
              {{ category.name }}
            </option>

            <option value="new">Create new sales category</option>
          </select>

          <div class="tw-flex tw-w-full" v-if="showCreateSalesCategoryView">
            <input
              v-model="salesCategory"
              type="text"
              placeholder="Type sales category name"
              class="tw-input tw-input-border tw-border-gray-300 tw-w-full"
            />
          </div>

          <button
            class="tw-btn tw-btn-primary tw-text-white tw-font-normal tw-btn-block"
            @click="saveTableInfo"
          >
            Start Order
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Inputpad from '@/components/common/Inputpad.vue'
import { mapActions, mapState } from 'pinia'
import { getInitials } from '@/utilities/utility'
import AssignedGuestCard from '@/components/customer/AssignedGuestCard.vue'
import SearchAndAssignGuest from '@/components/customer/SearchAndAssignGuest.vue'
import AddNewGuest from '@/components/modal/AddNewGuest.vue'
import { orderBy } from 'lodash'
import { useTables } from '@/stores/table'
import { useSale } from '@/stores/sale/sale'
import { useRegister } from '@/stores/register'
import { useApp } from '@/stores/app'

export default {
  components: {
    Inputpad,
    AssignedGuestCard,
    SearchAndAssignGuest,
    AddNewGuest
  },

  created() {
    this.info.salesCategory = this.salesCategories[0]?._id
    this.setTablesForCurrentLocation()
    this.clear()
  },

  mounted() {
    this.setNavbarOption('backButtonOptionNavabar')
  },

  data() {
    return {
      keyValue: '',
      PressedBackspace: false,
      info: {
        tableId: '',
        tableName: '',
        orderNote: '',
        amountOfGuest: 1,
        customBill: '',
        salesCategory: ''
      },
      error: {
        table: '',
        amountOfGuest: ''
      },
      sortTableByAsc: true,
      isModalShown: false,
      showCreateSalesCategoryView: false,
      salesCategory: ''
    }
  },

  computed: {
    ...mapState(useTables, ['occupiedTableIds', 'tables']),
    ...mapState(useSale, ['customer']),
    ...mapState(useRegister, ['register', 'location', 'outlet', 'salesCategories']),

    sortedTables() {
      return orderBy(this.tables, 'name', this.sortTableByAsc ? 'asc' : 'desc')
    }
  },

  methods: {
    getInitials,
    ...mapActions(useApp, ['setNavbarOption']),
    ...mapActions(useSale, ['open', 'assignCustomer', 'removeCustomer', 'clear']),
    ...mapActions(useTables, ['setTablesForCurrentLocation']),
    ...mapActions(useRegister, ['createSalesCategory']),

    onNewGuestAdded(data: any): void {
      this.isModalShown = false
      this.assignCustomer(data)
    },

    setGuestAmount(value: string) {
      this.info.amountOfGuest = parseInt(value)
    },

    setTable(table: any) {
      this.info.tableId = table._id
      this.info.tableName = table.name
      this.error.table = ''
    },

    async addSalesCategory() {
      if (!this.salesCategory) {
        return
      }
      const category = await this.createSalesCategory(this.salesCategory)
      this.info.salesCategory = category._id
      this.showCreateSalesCategoryView = false
    },

    async saveTableInfo() {
      try {
        if (!this.info.customBill && !this.info.tableId) {
          this.error.table = 'Please Select Table Or Add Custom Bill To Proceed Further'
          return
        }

        if (!this.info.amountOfGuest) {
          this.error.amountOfGuest = 'Guest amount is required to start order'
          return
        }

        if (this.info.amountOfGuest > 20) {
          this.error.amountOfGuest = 'More then 20 guest in single table is not allowed'
          return
        }

        if (this.showCreateSalesCategoryView && this.salesCategory) {
          await this.addSalesCategory()
        }

        const payload = {
          ...this.info,
          department: 'bar'
        }

        const order = await this.open(payload)
        this.$router.replace({
          name: 'sale',
          params: { orderId: order.orderId }
        })
      } catch (e) {
        console.log(e)
      }
    }
  },

  watch: {
    'info.salesCategory': function (val) {
      if (val === 'new') {
        this.showCreateSalesCategoryView = true
      }
    }
  }
}
</script>
