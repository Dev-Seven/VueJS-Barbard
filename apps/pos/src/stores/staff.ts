import { defineStore } from 'pinia'
import { orderBy } from 'lodash'
import { useRegister } from './register'
import database from '@/config/firebase/database'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { type UserType } from './authentication'

export const useStaff = defineStore('staff', {
  state: () => ({
    staff: [] as Array<UserType>,
    active: {} as UserType
  }),
  actions: {
    async hydrate() {
      const register = useRegister()

      if (!location) {
        console.log('Staff:: location is not found, could not load staff members')
      }

      const q = query(
        collection(database, `staff`),
        where('active', '==', true),
        where('locations', 'array-contains', register.location)
      )

      const snapshot = await getDocs(q)

      const staff: Array<UserType> = []

      snapshot.forEach((doc) => {
        staff.push({
          _id: doc.id,
          ...doc.data()
        } as UserType)
      })

      console.log(`Staff:: ${staff.length} staff members loaded`)

      this.staff = orderBy(staff, 'name', 'asc')
    },

    async fetchAllStaffMembers() {
      const q = query(collection(database, `staff`), where('active', '==', true))

      const snapshot = await getDocs(q)

      const staff: Array<UserType> = []

      snapshot.forEach((doc) => {
        staff.push({
          _id: doc.id,
          ...doc.data()
        } as UserType)
      })
      return orderBy(staff, 'name', 'asc')
    },

    async setActive(member: UserType) {
      this.active = member
    }
  },
  persist: {
    storage: window.localStorage
  }
})
