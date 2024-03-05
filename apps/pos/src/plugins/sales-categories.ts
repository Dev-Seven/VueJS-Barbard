import database from '@/config/firebase/database'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { useRegister } from '@/stores'
import type { SaleCategory } from '@/stores/register'
import { setTimeoutLoop } from '@/utilities/utility'

export const SalesCategories = {
  install() {
    console.log('Installing sales categories plugin')

    const fn = () => {
      console.log('Plugin:: trying to register sales category plugin')
      const register = useRegister()

      if (!register.location) {
        return
      }

      const _query = query(collection(database, `locations/${register.location}/salesCategories`))

      onSnapshot(
        _query,
        (snapshot) => {
          const categories: Array<SaleCategory> = []
          snapshot.forEach((doc) => {
            categories.push({ _id: doc.id, ...doc.data() } as SaleCategory)
          })
          console.log(`Sales Categories:: Hydrating ${categories.length} sales categories`)
          register.hydrateSaleCategories(categories)
        },
        (error) => {
          console.error(error)
          setTimeoutLoop(fn, 1000)
        }
      )

      return true
    }

    setTimeoutLoop(fn, 5000)
  }
}
