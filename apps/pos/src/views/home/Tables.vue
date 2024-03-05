<template>
  <div class="md:tw-mx-12">
    <div class="tw-tabs tw-mb-4">
      <a
        v-for="(tab, index) in Tabs"
        :key="`sales-tab-${index}`"
        :title="tab.title"
        class="tw-tab tw-tab-bordered tw-text-primary"
        :class="{ 'tw-tab-active': this.activeTab === index }"
        @click="activeTab = index"
      >
        {{ tab.title }}
      </a>
    </div>

    <div
      v-if="showSkeleton"
      class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 xl:tw-grid-cols-4 gap-1"
    >
      <div
        v-for="n in 12"
        :key="n"
        class="shimmer tw-bg-gray-300 tw-h-44 tw-min-h-full tw-rounded-xl"
      ></div>
    </div>
    <div
      v-else
      class="tw-grid tw-grid-cols-1 tw-gap-2 md:tw-grid-cols-2 xl:tw-grid-cols-3"
      :title="ActiveTab.title"
    >
      <table-card
        v-for="(item, index) in ActiveTab.data"
        :key="`table-${index}`"
        :item="item"
        :isEventOpen="isEventOpen"
        :id="item.orderId"
        @open-sale="open(item.orderId, item.status)"
      />
      <add-sale-card v-if="!ActiveTab?.hideAddAction" />
    </div>
  </div>
</template>

<script lang="ts">
import TableCard from '@/components/TableCard.vue'
import AddSaleCard from '@/components/AddSaleCard.vue'
import { useSales } from '@/stores/sales'
import { useUI } from '@/stores/ui'
import { useRegister } from '@/stores/register'
import { mapState, mapGetters, mapActions } from 'pinia'
import { useApp } from '@/stores/app'
import { useInventory } from '@/stores/inventory/inventory'

export default {
  components: { TableCard, AddSaleCard },

  async created() {
    this.showSkeleton = true
    await this.hydrate()
    window.dispatchEvent(new Event('orders'))
    this.showSkeleton = false
  },

  mounted() {
    this.setNavbarOption('setDefaultNavbar')
  },

  data: () => {
    return {
      activeTab: 0,
      showSkeleton: true,
      isEventOpen: false
    }
  },

  computed: {
    ...mapState(useSales, ['orders']),
    ...mapState(useRegister, ['salesCategories']),
    ...mapState(useUI, ['appointmentPanelVisible']),

    ActiveTab(): any {
      return this.Tabs[this.activeTab]
    },

    ParkedSales(): any {
      return this.orders.filter((o: any) => {
        return o.parkedSale == true
      })
    },

    Tabs(): Array<any> {
      const _tabs = this.salesCategories.map((category) => {
        return {
          _id: category._id,
          title: category.name,
          data: this.sortOrders(
            this.orders.filter(
              (data: any) => data.salesCategory == category._id && !data?.parkedSale
            )
          )
        }
      })

      return [
        {
          title: 'All',
          data: this.sortOrders(this.orders.filter((o) => !o.parkedSale))
        },
        ..._tabs,
        {
          title: 'Parked',
          data: this.sortOrders(this.ParkedSales),
          hideAddAction: true
        }
      ]
    }
  },

  methods: {
    ...mapActions(useApp, ['setNavbarOption']),
    ...mapActions(useInventory, ['hydrate']),

    open(orderId: string, status: string) {
      if (status === 'cheque-confirmed') {
        this.$router.push({
          name: 'payment',
          params: { orderId }
        })
        return
      }
      this.$router.push({ name: 'sale', params: { orderId } })
    },

    sortOrders(orders: Array<any>) {
      return orders.sort((a, b) => {
        return a.status === 'cheque-confirmed' || a.updatedAt < b.updatedAt ? -1 : 1
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.main-screen {
  .appointment-btn {
    transform-origin: left;
    transform: translate(5%, 520%) rotate(270deg);
    border-radius: 0;
  }

  .event-cards {
    max-height: 72vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
