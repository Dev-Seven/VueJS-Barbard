import auth from '@/config/firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { useApp } from '@/stores/app'
import { useStaff } from '@/stores/staff'
import { useAuthentication } from '@/stores/authentication'
import { useRegister } from '@/stores/register'
import { AUTHENTICATED, REGISTER_OPENED } from '@/events/events'

/**
 * @description
 * Load all the settings and data that are essential to app by
 * triggering the hydration actions when app initializes.
 *
 *
 */
export const Core = {
  install() {
    console.log('Plugin:: core plugin init')

    const app = useApp()
    const staff = useStaff()
    const authentication = useAuthentication()
    const register = useRegister()

    const onAuthFn = () => {
      app.hydrateTaxClasses()
      app.hydrateLocations()
      app.hydratePaymentMethods()
    }

    const onRegisterSessionOpenFn = () => {
      staff.hydrate()
    }

    if (authentication.isAuthenticated) {
      onAuthFn()
    }

    if (register.isOpen) {
      onRegisterSessionOpenFn()
    }

    window.addEventListener(AUTHENTICATED, onAuthFn)
    window.addEventListener(REGISTER_OPENED, onRegisterSessionOpenFn)

    onAuthStateChanged(auth, function (user) {
      if (user) {
        onAuthFn()
      }
    })
  }
}
