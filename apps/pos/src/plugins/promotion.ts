import database from '@/config/firebase/database'
import { collection, query, onSnapshot, where } from 'firebase/firestore'
import { usePromotion } from '@/stores/promotion/promotion'
import { AUTHENTICATED } from '@/events/events'
import { onAuthStateChanged } from 'firebase/auth'
import auth from '@/config/firebase/auth'

/**
 * @description The plugin listens for realtime update
 * in number of given limit document. With any update,
 * internal application state of promotions will be
 * flushed and re-created to prevent any inconsistency
 *
 */
export const Promotion = {
  install() {
    console.log('Plugin:: promotion plugin init')
    const promotion = usePromotion()

    const fn = () => {
      console.log('Plugin:: trying to register promotions plugin')

      const _query = query(collection(database, 'promotions'), where('active', '==', true))

      const today = new Date()

      onSnapshot(
        _query,
        (snapshot) => {
          const promotions: Array<any> = []
          snapshot.forEach((doc) => {
            const data = doc.data()

            // Check for start date, if provided
            if (data?.startDate?.seconds * 1000 > Date.now()) {
              return
            }

            // Check for end date, if provided
            if (data?.endDate?.seconds * 1000 < Date.now()) {
              return
            }

            // Check for time control activated
            if (data?.timeFilter) {
              // Check for day, if provided
              if (data?.days && !data.days.includes(today.getDay())) {
                return
              }

              // Check for day time from, if provided. format '12:00'
              if (data?.timeFrom) {
                const _timeFrom = new Date()
                const [hours, minutes] = data.timeFrom.split(':')
                _timeFrom.setHours(parseInt(hours))
                _timeFrom.setMinutes(parseInt(minutes))

                if (data.timeFrom * 1000 > _timeFrom.getTime()) {
                  return
                }
              }

              // Check for day time till, if provided. format '12:00'
              if (data?.timeTill) {
                const _timeTill = new Date()
                const [hours, minutes] = data.timeTill.split(':')
                _timeTill.setHours(parseInt(hours))
                _timeTill.setMinutes(parseInt(minutes))

                if (data.timeTill * 1000 < _timeTill.getTime()) {
                  return
                }
              }
            }

            promotions.push({ _id: doc.id, id: doc.id, ...data })
          })
          console.log(`Promotion:: Hydrating ${promotions.length} promotion items`)
          promotion.hydrate(promotions)
        },
        (error) => {
          console.error(error)
        }
      )
      return true
    }

    window.addEventListener(AUTHENTICATED, fn)

    onAuthStateChanged(auth, (user) => {
      if (user) fn()
    })
  }
}
