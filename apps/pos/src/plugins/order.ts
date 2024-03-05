import database from '@/config/firebase/realtime-database'
import { useRegister } from '@/stores/register'
import { useSales } from '@/stores/sales'
import { ref, onValue } from 'firebase/database'
import { values } from 'lodash'
import { REGISTER_OPENED } from '@/events/events'

export const Order = {
  install() {
    const fn = () => {
      console.log('Plugin:: order plugin init')

      const register = useRegister()
      const sales = useSales()

      if (!register.location) {
        return
      }

      const ordersRef = ref(database, register.location)
      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val()
        sales.setSales(values(data))
      })
    }
    window.addEventListener(REGISTER_OPENED, fn)
    window.addEventListener('orders', fn)
  }
}
