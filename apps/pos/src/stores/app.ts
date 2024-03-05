import { defineStore } from 'pinia'
import { each, find, keys, values } from 'lodash'
import { useRegister } from './register'
import { collection, getDocs, query, documentId, where } from 'firebase/firestore'
import database from '@/config/firebase/database'

export const useApp = defineStore('app', {
  state: () => ({
    navbarOption: [
      {
        title: 'multipleOptionNavbar',
        value: false
      },
      {
        title: 'backButtonOptionNavabar',
        value: false
      },
      {
        title: 'noOptionNavbar',
        value: false
      }
    ],
    tax: [] as Array<any>,
    locations: [] as Array<any>,
    payments: [] as Array<any>
  }),
  getters: {
    location(state) {
      const register = useRegister()
      return find(state.locations, (l) => l._id === register.location)
    }
  },
  actions: {
    setNavbarOption(navigation: string) {
      const next = [...this.navbarOption]
      each(next, (item) => {
        if (item.title === navigation) {
          item.value = true
        } else {
          item.value = false
        }
      })
      this.navbarOption = next
    },

    async hydrateTaxClasses() {
      const snapshot = await getDocs(query(collection(database, 'tax')))

      const slabs = [] as Array<any>
      snapshot.forEach((doc) => {
        slabs.push({
          id: doc.id,
          ...doc.data()
        })
      })

      console.log(`Tax:: ${slabs.length} tax classes loaded`)

      this.tax = slabs
    },

    async hydratePaymentMethods() {
      const snapshot = await getDocs(query(collection(database, 'payments')))

      const methods = [] as Array<any>
      snapshot.forEach((doc) => {
        methods.push({
          _id: doc.id,
          ...doc.data()
        })
      })

      console.log(`Payments:: ${methods.length} payment methods loaded`)
      this.payments = methods
    },

    async hydrateLocations() {
      const IGNORE_LOCATION_ID = 'barbaard.com'

      const snapshot = await getDocs(
        query(collection(database, 'locations'), where(documentId(), '!=', IGNORE_LOCATION_ID))
      )

      const locations: { [key: string]: any } = {}

      snapshot.forEach((doc) => {
        const data = doc.data()
        locations[doc.id] = {
          _id: doc.id,
          prefix: `${data.code}-${new Date().getFullYear().toString().slice(-2)}`,
          outlets: [],
          salesCategories: [],
          ...doc.data()
        }
      })

      await Promise.all(
        keys(locations).map(async (location) => {
          const outletSnapshot = await getDocs(
            query(collection(database, `locations/${location}/registers`))
          )
          outletSnapshot.forEach((o) => locations[location].outlets.push(o.id))

          const salesCategoriesSnapshot = await getDocs(
            query(collection(database, `locations/${location}/salesCategories`))
          )
          salesCategoriesSnapshot.forEach((o) =>
            locations[location].salesCategories.push({
              id: o.id,
              name: o.data()?.name
            })
          )
        })
      )

      this.locations = values(locations)
    },

    /**
     * @description Action returns location document which is currently open.
     * @returns {Location} location
     */
    async getLocation() {
      const register = useRegister()
      return find(this.locations, (location) => location._id === register.location)
    }
  }
})
