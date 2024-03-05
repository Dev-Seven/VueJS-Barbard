<template>
  <div class="tw-container tw-max-w-screen-xl tw-pt-10 tw-px-4 sm:tw-px-12">
    <h2
      class="tw-text-3xl tw-text-secondary tw-font-bold tw-border-b tw-border-primary tw-py-2 tw-mb-4 tw-w-max"
    >
      Cash Management
    </h2>

    <div class="tw-grid tw-grid-cols-1 tw-gap-4 tw-mb-4 md:tw-grid-cols-3">
      <div className="tw-card tw-p-6 tw-bg-white tw-shadow-md tw-border tw-border-[#e6e9ec]">
        <p class="tw-font-bold">Amount</p>
        <input
          type="number"
          :value="amount"
          @input="amount = parseFloat(($event.target as HTMLInputElement).value)"
          placeholder="Enter Amount"
          pattern="[0-9]*"
          class="tw-input tw-w-full tw-border tw-border-gray-300 tw-mb-4"
        />
        <p class="tw-font-bold">Added/Removed By</p>
        <select
          class="tw-select tw-flex-shrink tw-w-full tw-px-3 tw-font-normal tw-text-base tw-rounded-lg tw-border tw-border-gray-300 focus:tw-outline-none"
          :value="staffId"
          @change="onStaffSelected"
        >
          <option v-for="s in staff" :key="s._id" :value="s._id">
            {{ s.fullName }}
          </option>
        </select>
      </div>
      <div className="tw-card tw-p-6 tw-bg-white tw-shadow-md tw-border tw-border-[#e6e9ec]">
        <p class="tw-font-bold">Notes</p>
        <textarea
          rows="4"
          placeholder="Type to add a cash movement note"
          v-model="notes"
          class="tw-textarea tw-border tw-border-gray-300"
          style="resize: none"
        >
        </textarea>
      </div>
      <div
        className="tw-card tw-p-6 tw-bg-white tw-shadow-md tw-border tw-border-[#e6e9ec] tw-flex tw-flex-col tw-justify-center tw-w-full"
      >
        <button class="tw-btn tw-btn-warning tw-text-white tw-mb-2" @click="cashManagement('add')">
          Add Cash
        </button>

        <button class="tw-btn tw-btn-primary" @click="cashManagement('remove')">Remove Cash</button>
      </div>
    </div>

    <div
      class="tw-max-w-full tw-overflow-auto tw-rounded-xl tw-border tw-border-gray-200 tw-shadow-md"
    >
      <table class="tw-table tw-w-full tw-shadow-md tw-rounded-xl">
        <thead>
          <tr>
            <th v-for="field in fields" :key="field">
              {{ typeof field === 'object' ? field.key : field }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in cashManagementEntries" :key="index">
            <td v-for="field in fields" :key="field">
              {{
                typeof field === 'object'
                  ? field.formatter
                    ? field.formatter(record[field.key])
                    : record[field.key]
                  : record[field]
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { numberWithCommas } from '@/utilities/utility'
import moment from 'moment'
import { toast } from 'vue3-toastify'
import { find } from 'lodash'
import { useRegister } from '@/stores/register'
import { useStaff } from '@/stores/staff'
import { useApp } from '@/stores/app'

const Selected = []

export default {
  name: 'CashManagement',
  moment,
  mounted() {
    this.setNavbarOption('backButtonOptionNavabar')
    this.setCashEntries()

    const member = this.staff[0]
    this.staffId = member?._id
    this.staffName = member?.fullName || member.name
  },

  data() {
    return {
      amount: 0,
      notes: '',
      addedBy: '',
      memberuid: '',
      staffId: '',
      staffName: '',
      fields: [
        {
          key: 'date',
          label: 'Date',
          formatter: (value) => {
            const time = new Date(value.seconds).toLocaleTimeString()
            const date = new Date(value.seconds * 1000).toDateString()

            return `${date} ${time}`
          }
        },
        { key: 'staffName', label: 'User' },
        { key: 'reason', label: 'Reason' },
        {
          key: 'amount',
          label: 'Amount',
          formatter: (value) => `₫ ${numberWithCommas(value)}`
        },
        { key: 'type', label: 'Movement' }
      ],
      selectMode: Selected,
      items: [],
      numberWithCommas: numberWithCommas
    }
  },

  computed: {
    ...mapState(useRegister, ['cashManagementEntries', 'registerId']),
    ...mapState(useStaff, ['staff'])
  },

  methods: {
    ...mapActions(useRegister, ['createCashEntry', 'setCashEntries']),
    ...mapActions(useApp, ['setNavbarOption']),

    onStaffSelected($e) {
      const staffId = $e.target.value
      const staffMember = find(this.staff, (m) => m._id === staffId)
      if (staffMember) {
        this.staffId = staffMember._id
        this.staffName = staffMember.fullName
      }
    },

    onRowSelected(items) {
      this.selected = items
    },

    cashManagement(type: string) {
      if (!this.amount || !this.notes) {
        toast(
          'Amount & Cash movement notes required to add or remove cash, Please fill all the fields!',
          {
            type: toast.TYPE.WARNING,
            transition: toast.TRANSITIONS.SLIDE,
            theme: toast.THEME.LIGHT,
            position: toast.POSITION.BOTTOM_LEFT
          }
        )
        return
      }

      const data = {
        type: type,
        amount: type === 'add' ? this.amount : -this.amount,
        reason: this.notes,
        [type === 'add' ? 'credit' : 'debit']: this.amount,
        staffId: this.staffId,
        staffName: this.staffName
      }

      this.createCashEntry({ data, registerId: this.registerId })
        .then(() => {
          toast('Cash entry has been added in register.', {
            type: toast.TYPE.SUCCESS,
            transition: toast.TRANSITIONS.SLIDE,
            theme: toast.THEME.LIGHT,
            position: toast.POSITION.BOTTOM_LEFT
          })
        })
        .catch((e) => {
          console.log(`Cash Management:: ${e.message}`)
          toast('Cash entry creation is failed, Please try again.', {
            type: toast.TYPE.ERROR,
            transition: toast.TRANSITIONS.SLIDE,
            theme: toast.THEME.LIGHT,
            position: toast.POSITION.BOTTOM_LEFT
          })
        })
        .then(() => {
          this.amount = this.reason = ''
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.equal-height {
  height: 100%;
}
</style>
