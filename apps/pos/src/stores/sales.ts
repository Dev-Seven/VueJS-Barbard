import { defineStore } from 'pinia'
import { values } from 'lodash'
import { useRegister } from './register'
import { ref, onValue } from 'firebase/database'
import database from '@/config/firebase/realtime-database'

export const useSales = defineStore('sales', {
  state: () => ({
    orders: [] as Array<any>
  }),
  getters: {
    activeOrders(state) {
      return state.orders.filter((order) => {
        const register = useRegister()
        return order.registerId == register.registerId
      })
    }
  },
  actions: {
    async hydrate() {
      const register = useRegister()
      const location = register.location
      const ordersRef = ref(database, location)
      onValue(ordersRef, (snapshot) => {
        this.orders = values(snapshot.val())
      })
    },

    setSales(orders: Array<any>) {
      this.orders = orders
    }
  }
})
