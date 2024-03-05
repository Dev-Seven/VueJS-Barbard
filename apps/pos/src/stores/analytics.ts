import { type Transaction, doc, updateDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import database from '@/config/firebase/database'
import { uniq } from 'lodash'
import { type Customer } from './sale/sale'

export const useAnalytics = defineStore('analytics', {
  actions: {
    async assignTagToUser({
      user,
      tags,
      transaction
    }: {
      user: Customer
      tags: Array<string>
      transaction?: Transaction
    }) {
      const ref = doc(database, `users/${user.userId}`)
      const update = {
        tags: uniq([...user.userTags, ...tags])
      }
      console.log(`Analytics:: Added ${tags.join(',')} (${tags.length}) to user ${user.userId}`)

      if (transaction) {
        transaction.update(ref, update)
      } else {
        await updateDoc(ref, update)
      }
    }
  }
})
