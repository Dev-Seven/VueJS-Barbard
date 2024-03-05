<template>
  <div
    class="tw-transform tw-px-4 tw-py-3 tw-fixed tw-left-0 tw-top-0 tw-h-screen tw-w-full sm:tw-w-4/5 tw-bg-white tw-shadow-lg tw-z-20 tw-transition tw-duration-300"
    :class="{
      '-tw-translate-x-full': !isShown
    }"
  >
    <div class="tw-flex tw-justify-between tw-items-center tw-w-full tw-mb-8">
      <h3 class="tw-mb-0 tw-font-bold tw-underline tw-decoration-primary tw-underline-offset-8">
        {{ title }} Transactions
      </h3>
      <CloseIcon
        class="tw-w-6 tw-h-6 tw-cursor-pointer hover:tw-opacity-80"
        @click="$emit('update:isShown', false)"
      />
    </div>

    <div
      class="tw-max-w-full tw-overflow-auto tw-rounded-xl tw-border tw-border-gray-300 tw-shadow-md tw-mb-4"
    >
      <table class="tw-table tw-w-full">
        <thead>
          <tr>
            <th>Order</th>
            <th>Guest</th>
            <th>Staff</th>
            <th>Amount</th>
            <th>Time</th>
            <th>Payment Method</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="transaction in transactions" :key="transaction._id">
            <td>{{ transaction.order }}</td>
            <td>{{ transaction.userName }}</td>
            <td>{{ transaction.staffName }}</td>
            <td>₫ {{ numberWithCommas(transaction.amount) }}</td>
            <td>
              {{ $options.moment(transaction.date.seconds * 1000).format('MM/DD/YYYY hh:mm A') }}
            </td>
            <td>
              <select
                class="tw-select tw-select-sm tw-flex-shrink tw-w-full tw-px-3 tw-font-normal tw-text-base tw-rounded-lg tw-border tw-border-gray-300 focus:tw-outline-none"
                @change="
                  (e) =>
                    onPaymentMethodChange(transaction._id, (e.target as HTMLInputElement).value)
                "
              >
                <option
                  v-for="(method, index) in payments"
                  :key="index"
                  :value="method.key"
                  :selected="transaction.method === method.key"
                >
                  {{ method.name }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="movement.length"
      class="tw-max-w-full tw-overflow-auto tw-rounded-xl tw-border tw-border-gray-300 tw-shadow-md tw-mb-4"
    >
      <table class="tw-table tw-w-full">
        <thead>
          <tr>
            <th>Added By</th>
            <th>Reason</th>
            <th>Time</th>
            <th>Movement</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(mvmnt, index) in movement" :key="`movement-${index}`">
            <td>
              {{ mvmnt.staffName }}
            </td>
            <td>
              {{ mvmnt.reason }}
            </td>
            <td>
              {{ $options.moment(mvmnt.timestamp).format('MM/DD/YYYY hh:mm A') }}
            </td>
            <td>
              <PlusIcon v-if="mvmnt.type == 'add'" class="tw-text-success tw-w-4 tw-h-4 tw-mr-2" />
              <MinusIcon v-else class="tw-text-error tw-w-4 tw-h-4 tw-mr-2" />
            </td>
            <td>₫ {{ numberWithCommas(mvmnt.amount) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { numberWithCommas } from '@/utilities/utility'
import { PlusIcon, MinusIcon, CloseIcon } from '@/components/icons'
import moment from 'moment'
import { useApp } from '@/stores/app'
import { useTransactions, type LedgerTransaction } from '@/stores/transactions'

export default {
  moment,
  name: 'Transactions',
  components: {
    PlusIcon,
    MinusIcon,
    CloseIcon
  },
  props: {
    title: String,
    transactions: {
      type: Array<LedgerTransaction>,
      default: () => []
    },
    movement: {
      type: Array<any>,
      default: () => []
    },
    isShown: Boolean
  },
  computed: {
    ...mapState(useApp, ['payments']),

    key() {
      return this.title?.replaceAll(/\s/g, '').toLowerCase()
    }
  },

  methods: {
    numberWithCommas,

    ...mapActions(useTransactions, ['updateTransactionMethod']),

    onPaymentMethodChange(_id: string, method: string) {
      this.updateTransactionMethod({ _id, method })
    }
  }
}
</script>
