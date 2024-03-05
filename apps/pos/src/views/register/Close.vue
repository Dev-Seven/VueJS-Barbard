<template>
  <div class="tw-container tw-max-w-screen-xl tw-pt-10 tw-px-4 sm:tw-px-12">
    <transactions
      :isShown="!!selectedTransaction"
      :title="selectedTransaction?.method"
      :movement="selectedTransaction?.movement"
      :transactions="selectedTransaction?.transactions"
      @update:isShown="selectedTransaction = null"
    />

    <h2
      class="tw-text-3xl tw-text-secondary tw-font-bold tw-border-b tw-border-primary tw-py-2 tw-mb-4 tw-w-max"
    >
      Cash Management
    </h2>

    <div
      class="tw-max-w-full tw-overflow-auto tw-rounded-xl tw-border tw-border-gray-300 tw-shadow-md tw-mb-4"
    >
      <table class="tw-table tw-w-full">
        <thead>
          <tr>
            <th>Method</th>
            <th>Amount</th>
            <th>Counted</th>
            <th>Difference</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(record, index) in transactions"
            :key="'transactions' + index"
            :class="{ 'table-active': index % 2 }"
          >
            <td>
              {{ record.method }}
            </td>
            <td>
              {{ numberWithCommas(record.amount) }}
            </td>
            <td>
              <input
                :value="record.cleared"
                @input="(e) => (record.cleared = parseFloat(e.target.value.replace(/,/g, '')))"
                v-number="{
                  decimal: '.',
                  separator: ',',
                  precision: 2
                }"
                pattern="[0-9]*"
                class="tw-input tw-w-full tw-border tw-border-gray-300 tw-w-full"
              />
            </td>
            <td>
              {{ numberWithCommas(record.amount - record.cleared) }}
            </td>
            <td>
              <button
                class="tw-btn tw-btn-primary tw-btn-sm tw-font-normal tw-text-white"
                @click="selectedTransaction = record"
              >
                Show Details
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>Totals</td>
            <td>₫ {{ numberWithCommas(this.expectedTotal) }}</td>
            <td>₫ {{ numberWithCommas(this.countedTotal) }}</td>
            <td>₫ {{ numberWithCommas(this.difference) }}</td>
            <td>&nbsp;</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="tw-flex tw-gap-4 tw-flex-col md:tw-flex-row">
      <div class="tw-w-full tw-card tw-shadow-md tw-bg-white tw-p-4 tw-border tw-border-gray-300">
        <p class="tw-font-bold tw-mb-2">Outlet: {{ info.outlet }}</p>
        <p class="tw-font-bold tw-mb-2">Opening #: {{ register.code }}</p>
        <p class="tw-font-bold tw-mb-2">
          Opening Time: {{ new Date(register.openedAt?.seconds * 1000).toLocaleString() }}
        </p>

        <div class="tw-flex tw-flex-col tw-w-full">
          <label class="tw-mb-2">Closing By</label>
          <select v-model="staffMember" class="tw-select tw-border tw-border-gray-300">
            <option v-for="member in staffMembers" :key="member._id" :value="member._id">
              {{ member.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="tw-w-full tw-card tw-shadow-md tw-bg-white tw-p-4 tw-border tw-border-gray-300">
        <textarea
          id="addNoteToEntireSale"
          name=""
          rows="4"
          placeholder="Add closure note…"
          v-model="closingNote"
          class="tw-textarea tw-border tw-border-gray-300 tw-mb-4"
          style="resize: none"
        >
        </textarea>
        <p v-if="error" class="tw-text-error">
          {{ error }}
        </p>
        <button
          v-if="loading"
          class="tw-btn tw-btn-secondary tw-btn-disabled tw-text-white tw-font-normal"
          disabled
        >
          Closing the register..
        </button>
        <button
          v-else
          class="tw-btn tw-btn-primary tw-text-white tw-font-normal"
          @click="closeRegister"
        >
          Close Register
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { numberWithCommas } from '@/utilities/utility'
import Transactions from './Transactions.vue'
import { toast } from 'vue3-toastify'
import moment from 'moment'
import { useRegister } from '@/stores/register'
import { useTransactions, type SummaryTransaction } from '@/stores/transactions'
import { useStaff } from '@/stores/staff'
import { useApp } from '@/stores/app'

export default {
  moment,
  name: 'CloseRegister',
  components: { Transactions },
  data() {
    return {
      loading: false,
      closingNote: '',
      error: '',
      activeIndex: 0,
      selectedTransaction: null,
      staffMember: '',
      staffMembers: [] as Array<any>,
      transactions: [] as Array<SummaryTransaction>
    }
  },

  computed: {
    ...mapState(useRegister, ['register', 'info']),
    ...mapState(useTransactions, ['summary', 'usedMethods']),
    ...mapState(useStaff, ['staff']),
    ...mapState(useApp, ['payments']),

    footerData() {
      // Data is being accessed by column key in footer
      return {
        method: 'Totals',
        amount: `₫ ${numberWithCommas(this.expectedTotal)}`,
        counted: `₫ ${numberWithCommas(this.countedTotal)}`,
        difference: `₫ ${numberWithCommas(this.difference)}`,
        details: ''
      }
    },

    expectedTotal() {
      return this.transactions.reduce((acc, current) => acc + current.amount, 0)
    },

    countedTotal() {
      return this.transactions.reduce((acc, t) => acc + t.cleared, 0)
    },

    difference() {
      return this.transactions.reduce((acc, current) => {
        return acc + (current.cleared - current.amount)
      }, 0)
    }
  },

  watch: {
    summary: {
      handler: function () {
        this.transactions = this.summary
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    numberWithCommas,
    ...mapActions(useApp, ['setNavbarOption']),
    ...mapActions(useRegister, ['close']),
    ...mapActions(useTransactions, ['fetchLedgerEntries']),
    ...mapActions(useStaff, ['fetchAllStaffMembers']),

    generateKey(method: string) {
      return method.replaceAll(/\s/g, '').toLowerCase()
    },
    async closeRegister() {
      this.loading = true

      const isInvalidClearedValue = this.transactions.reduce((acc, current) => {
        return acc & (!current.cleared || isNaN(current.Counted))
      }, false)

      if (isInvalidClearedValue) {
        this.error = 'counted value should be valid'
        this.loading = false
        return
      }

      if (!this.staffMember) {
        this.error = 'Please select closing staff member'
        this.loading = false
        return
      }

      const staff = this.staffMembers.find((m) => m._id === this.staffMember)

      try {
        const payload = {
          difference: this.difference,
          closingNote: this.closingNote,
          transactions: this.transactions,
          closedByUserId: staff._id,
          closedByUserName: staff.name
        }
        await this.close(payload)
        this.$router.replace({ name: 'register.open' })
      } catch (e: any) {
        toast(e.message, {
          type: toast.TYPE.ERROR,
          transition: toast.TRANSITIONS.SLIDE,
          theme: toast.THEME.LIGHT,
          position: toast.POSITION.BOTTOM_LEFT
        })
      } finally {
        this.loading = false
      }
    }
  },
  async created() {
    this.setNavbarOption('backButtonOptionNavabar')
    this.fetchLedgerEntries()
    this.staffMembers = await this.fetchAllStaffMembers()
  }
}
</script>

<style lang="scss" scoped>
table table td,
table table th {
  @apply tw-bg-transparent;
}

table tr.table-active table td,
table tr.table-active table th {
  @apply tw-border-secondary;
}

tr.table-active > td {
  @apply tw-bg-gray-200;
}

tfoot td,
thead th {
  @apply tw-normal-case tw-text-base;
}

.tw-table th:first-child {
  @apply tw-relative;
}
</style>
