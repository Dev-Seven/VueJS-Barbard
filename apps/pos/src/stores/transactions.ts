import { defineStore } from 'pinia'
import { findIndex, has, map, reduce, round, uniq, values } from 'lodash'
import { PaymentMethods, useRegister } from './register'
import database from '@/config/firebase/database'
import {
  collection,
  getDocs,
  query,
  where,
  type Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore'

export type LedgerTransaction = {
  _id: string
  amount: number
  date: Timestamp
  method: string
  order: string
  orderId: string
  register: string
  registerId: string
  staffId: string
  staffName: string
  status: number
  userId: string
  userName: string
}

export type SummaryTransaction = {
  transactions: Array<LedgerTransaction>
  cleared: number
  amount: number
  method: string
  movement?: Array<LedgerTransaction>
  movementTotal: number
}

export const useTransactions = defineStore('transactions', {
  state: () => ({
    transactions: [] as Array<LedgerTransaction>
  }),
  getters: {
    cashMovements(state) {
      return state.transactions.filter((t) => t.method === PaymentMethods.internalCashManagement)
    },

    usedMethods(state) {
      return uniq(map(state.transactions, (t) => t.method))
    },

    summary(state): Array<SummaryTransaction> {
      const transaction: { [key: string]: SummaryTransaction } = {}

      state.transactions.forEach((t) => {
        // Exclude it as it's being added in Cash method
        if (t.method === PaymentMethods.internalCashManagement) {
          return
        }

        if (has(transaction, t.method)) {
          transaction[t.method].amount += t.amount
          transaction[t.method].transactions.push(t)
        } else {
          transaction[t.method] = {
            transactions: [t],
            cleared: 0,
            amount: t.amount,
            method: t.method
          }
        }
      })

      const total = reduce(this.cashMovements, (sum, t) => sum + t.amount || 0, 0)

      if (!has(transaction, 'Cash')) {
        transaction.Cash = {
          transactions: [],
          cleared: 0,
          amount: 0,
          method: 'Cash'
        }
      }

      transaction.Cash.amount += total
      transaction.Cash.movement = this.cashMovements
      transaction.Cash.movementTotal = total

      return map(values(transaction), (t) => ({
        ...t,
        amount: round(t.amount, -3)
      }))
    }
  },
  actions: {
    async fetchLedgerEntries() {
      const register = useRegister()
      const entries = await getDocs(
        query(
          collection(database, `locations/${register.location}/ledger`),
          where('registerId', '==', `${register.registerId}`),
          where('method', 'not-in', [
            PaymentMethods.storeCreditAgreement,
            PaymentMethods.storeCreditGiftCheque,
            PaymentMethods.storeCreditLockerbox
          ])
        )
      )

      const transactions: Array<LedgerTransaction> = []
      entries.forEach((doc) => {
        transactions.push({ _id: doc.id, ...doc.data() } as LedgerTransaction)
      })

      this.transactions = transactions
    },

    async updateTransactionMethod({ _id, method }: { _id: string; method: string }) {
      const register = useRegister()
      const ref = doc(database, `locations/${register.location}/ledger/${_id}`)

      await updateDoc(ref, { method })

      const index = findIndex(this.transactions, (t) => t._id === _id)

      if (index === -1) {
        console.log(`Transactions:: can't update ${_id} ledger entry`)
        return
      }

      const t = { ...this.transactions[index] }
      this.transactions.splice(index, 1, { ...t, method })
    }
  }
})
