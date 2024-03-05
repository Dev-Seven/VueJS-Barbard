import { useRegister } from '@/stores/register'

export const RegisterSession = ({ next }: any) => {
  const register = useRegister()
  if (register.isOpen) {
    next()
  } else {
    next({ name: 'register.open' })
  }
}
