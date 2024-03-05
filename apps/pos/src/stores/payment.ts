import { defineStore } from 'pinia'
import { doc, setDoc } from 'firebase/firestore'
import database from '@/config/firebase/database'
import { generateOrder } from './sale/order'

type PersonaType = {
  orderId: string
  customer: any
  order: ReturnType<typeof generateOrder>
  payments: Array<any>
}

export const usePayment = defineStore('payment', {
  state: () => ({
    persona: {
      orderId: '',
      customer: {} as any,
      order: {} as ReturnType<typeof generateOrder>,
      payments: [] as Array<any>
    }
  }),
  getters: {
    orderId(state) {
      return state.persona.orderId
    },
    customer(state) {
      return state.persona.customer
    },
    order(state) {
      return state.persona.order
    },
    payments(state) {
      return state.persona.payments
    }
  },
  actions: {
    setPaymentPersona(payload: PersonaType) {
      this.persona = payload
    },
    async updatePersona(persona: Array<string>, userId: string) {
      const docRef = doc(database, `users/${userId}`)
      setDoc(docRef, { persona }, { merge: true })
    }
  }
})
