<template>
  <div class="tw-flex tw-flex-col tw-gap-4 lg:tw-flex-row lg:tw-items-center">
    <button
      class="tw-btn tw-btn-sm tw-btn-outline tw-border-white tw-text-white hover:tw-bg-white hover:tw-text-black"
      @click="$router.back()"
    >
      <ArrowRightIcon class="tw-w-4 tw-h-4 tw-translate tw-rotate-180" />
    </button>

    <div class="tw-dropdown tw-dropdown-bottom">
      <label
        tabindex="0"
        class="tw-flex tw-items-center tw-gap-2 tw-text-white tw-rounded-lg tw-cursor-pointer lg:tw-px-2 lg:tw-py-1 tw-transition tw-duration-100 tw-mb-0 hover:tw-bg-black hover:tw-bg-opacity-10"
      >
        <CaretDownIcon class="tw-w-4 tw-h-4" />
        <p v-if="order.customBill || order.tableName" class="tw-mb-0">
          {{ order.customBill || order.tableName }}
        </p>
        <p v-else class="tw-mb-0 lg:tw-hidden">Select Table</p>
      </label>

      <ul
        tabindex="0"
        class="tw-dropdown-content tw-menu tw-p-2 tw-shadow tw-bg-white tw-rounded-lg tw-w-max"
      >
        <li class="tw-py-2 tw-px-4">
          {{
            order.customBill
              ? 'CustomBill: ' + order.customBill
              : 'SelectedTable: ' + order.tableName
          }}
        </li>
        <li class="tw-text-sm tw-text-gray-500 tw-px-4">Unoccupied</li>
        <li
          v-for="(table, index) in orderBy(unoccupied, 'name', 'asc')"
          :key="index"
          @click="setTable(table._id, table.name)"
        >
          <a>
            {{ table.name }}
          </a>
        </li>
        <li class="tw-text-sm tw-text-gray-500 tw-px-4">Occupied</li>
        <li
          v-for="(table, index) in orderBy(occupied, 'name', 'asc')"
          :key="index"
          class="tw-pointer-events-none tw-text-gray-400"
        >
          <a>
            {{ table.name }}
          </a>
        </li>
      </ul>
    </div>

    <div v-if="order.parkedSale">
      <LoadingIcon
        v-if="isOpenParkLoading"
        class="tw-w-4 tw-h-4 tw-animate-spin dark:tw-text-gray-200 tw-fill-white"
      />
      <p
        class="tw-text-white tw-mb-0 tw-cursor-pointer hover:tw-opacity-80"
        v-else
        @click="openTheParkedSale"
      >
        Open Sale
      </p>
    </div>
    <div v-else>
      <LoadingIcon
        v-if="isParkSaleLoading"
        class="tw-w-4 tw-h-4 tw-animate-spin dark:tw-text-gray-200 tw-fill-white"
      />
      <p
        class="tw-text-white tw-mb-0 tw-cursor-pointer hover:tw-opacity-80"
        v-else
        @click="parkedOpenSale"
      >
        Park Sale
      </p>
    </div>
    <div>
      <p
        class="tw-text-white tw-mb-0 tw-cursor-pointer hover:tw-opacity-80"
        @click="confirmDiscardSale"
      >
        Discard Sale
      </p>
    </div>

    <Teleport to="#outside-portal">
      <Modal v-model:isShown="isDiscardModalShown" max-width-class="tw-max-w-screen-sm">
        <div
          class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
        >
          <h6 class="tw-mb-0">Are you sure to discard the sale?</h6>

          <CloseIcon class="tw-w-4 tw-h-4" @click="isDiscardModalShown = false" />
        </div>

        <div class="tw-p-6 tw-flex tw-justify-end tw-gap-4">
          <button
            class="tw-btn tw-btn-secondary tw-text-white tw-font-normal"
            @click="isDiscardModalShown = false"
          >
            Cancel
          </button>
          <button class="tw-btn tw-btn-primary tw-text-white tw-font-normal" @click="discardSale">
            Yes
          </button>
        </div>
      </Modal>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { mapState, mapActions } from 'pinia'
import { orderBy } from 'lodash'
import { toast, type ToastOptions } from 'vue3-toastify'
import { useSale } from '@/stores/sale/sale'
import { useRegister } from '@/stores/register'
import { useTables } from '@/stores/table'
import { ArrowRightIcon, CaretDownIcon, LoadingIcon, CloseIcon } from '@/components/icons'
import Modal from '../common/Modal.vue'

export default {
  name: 'MultipleOptionNav',
  components: {
    ArrowRightIcon,
    CaretDownIcon,
    LoadingIcon,
    CloseIcon,
    Modal
  },

  data() {
    return {
      isParkSaleLoading: false,
      isOpenParkLoading: false,
      isDiscardModalShown: false
    }
  },

  computed: {
    ...mapState(useSale, ['order']),
    ...mapState(useTables, ['occupied', 'unoccupied']),
    ...mapState(useRegister, ['location'])
  },

  methods: {
    orderBy,
    ...mapActions(useSale, ['setTable', 'discard', 'park', 'openParked']),
    confirmDiscardSale() {
      this.isDiscardModalShown = true
    },

    async discardSale() {
      try {
        await this.discard()
        this.$router.push({ name: 'home' })
      } catch (e: any) {
        toast('Failed to update the order Data!', {
          type: toast.TYPE.ERROR,
          transition: toast.TRANSITIONS.SLIDE,
          theme: toast.THEME.LIGHT,
          position: toast.POSITION.BOTTOM_LEFT
        } as ToastOptions)
      }
    },

    async parkedOpenSale() {
      this.isParkSaleLoading = true
      try {
        this.park(this.location)
        this.isParkSaleLoading = false
        this.$router.push({ name: 'home' })
      } catch (e) {
        console.log(e)
        this.isParkSaleLoading = false

        toast('Failed to park the open Sale!', {
          type: toast.TYPE.ERROR,
          transition: toast.TRANSITIONS.SLIDE,
          theme: toast.THEME.LIGHT,
          position: toast.POSITION.BOTTOM_LEFT
        } as ToastOptions)
      }
    },

    async openTheParkedSale() {
      try {
        this.isOpenParkLoading = true
        await this.openParked()
        this.$router.push({ name: 'home' })
      } catch (e) {
        this.isOpenParkLoading = false
        toast('Failed to open the parked Sale!', {
          type: toast.TYPE.ERROR,
          transition: toast.TRANSITIONS.SLIDE,
          theme: toast.THEME.LIGHT,
          position: toast.POSITION.BOTTOM_LEFT
        } as ToastOptions)
      }
    }
  }
}
</script>
