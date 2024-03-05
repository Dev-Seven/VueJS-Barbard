import { useEvents } from '@/stores/events'
import { useRegister } from '@/stores/register'

export const Appointment = {
  install() {
    console.log('Plugin:: appointment plugin init')
    const events = useEvents()
    const register = useRegister()

    const POOLING_INTERVAL_SECONDS = import.meta.env.VITE_POOLING_INTERVAL_SECONDS || 5

    setInterval(() => {
      if (!register.location) {
        return
      }

      events.setEvents()
    }, 1000 * POOLING_INTERVAL_SECONDS)
  }
}
