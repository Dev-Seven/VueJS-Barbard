import { useAuthentication } from '@/stores/authentication'

export const Auth = async ({ next }: any) => {
  const authentication = useAuthentication()
  /**
   * if redirected as of no firebase auth, clear out store
   * persisted state to prevent any collision in data
   */
  if (authentication.isAuthenticated) {
    next()
  } else {
    next('/auth/login')
  }
}
