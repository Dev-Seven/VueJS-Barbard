import { defineStore } from 'pinia'
import { useRegister } from './register'
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  increment,
  query,
  setDoc,
  where
} from 'firebase/firestore'
import database from '@/config/firebase/database'
import { type EventStatus as EventStatusType, type Event } from '@/@types'
import { filter, findIndex, map } from 'lodash'
import { useSales } from './sales'

export const EventStatus = {
  Cancelled: 'cancelled',
  NoShow: 'no-show',
  Confirmed: 'confirmed',
  Approved: 'approved',
  ArrivedOnTime: 'arrived-on-time',
  ArrivedLate: 'arrived-late'
}

export type ExtendedEvent = Event & { _id: string }

export type SelectedEvent = {
  event: ExtendedEvent
  config: any
}

export const useEvents = defineStore('events', {
  state: () => ({
    events: [] as Array<ExtendedEvent>,
    event: {} as SelectedEvent
  }),
  getters: {
    nextEvents(state) {
      const sales = useSales()
      const eventIds = map(
        filter(sales.orders, (o) => o?.eventItem?._id),
        (o) => o.eventItem._id
      )
      return filter(
        state.events,
        (e) => !eventIds.includes(e._id) && e.status === EventStatus.Approved
      )
    },

    activeEvents(state) {
      const sales = useSales()
      const eventIds = map(
        filter(sales.orders, (o) => o?.eventItem?._id),
        (o) => o.eventItem._id
      )
      return filter(state.events, (e) => eventIds.includes(e._id))
    },

    completedEvents(state) {
      const sales = useSales()
      const eventIds = map(
        filter(sales.orders, (o) => o?.eventItem?._id),
        (o) => o.eventItem._id
      )
      const status = [EventStatus.Cancelled, EventStatus.NoShow]
      return filter(
        state.events,
        (e) =>
          status.includes(e.status as string) ||
          (!eventIds.includes(e._id) && e.status === EventStatus.ArrivedOnTime)
      )
    }
  },
  actions: {
    async setEvents() {
      const fromTime = new Date()
      const toTime = new Date()
      fromTime.setHours(0, 0, 0, 0)
      toTime.setHours(23, 59, 59, 999)

      const register = useRegister()

      const q = query(
        collection(database, `locations/${register.location}/events`),
        where('startDate', '>', Timestamp.fromDate(fromTime)),
        where('startDate', '<', Timestamp.fromDate(toTime))
      )
      const snapshot = await getDocs(q)
      const events: Array<ExtendedEvent> = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data?.type === 'appointment' || data?.type === 'reservation') {
          events.push({
            _id: doc.id,
            ...(data as Event)
          })
        }
      })
      this.events = events
    },

    selectEvent(event: SelectedEvent) {
      this.event = event
    },

    async setEventStatus(payload: {
      _id: string
      status: string
      location: string
      userId: string
    }) {
      const { _id, status, location } = payload
      const docRef = doc(database, `locations/${location}/events/${_id}`)
      await setDoc(docRef, { status }, { merge: true })

      const index = findIndex(this.events, (event) => event._id === _id)
      if (index !== -1) {
        const _status = status as EventStatusType
        this.events.splice(index, 1, { ...this.events[index], status: _status })
      } else {
        console.log(`Appointment:: could not update ${_id} status in local state`)
      }
      this.incrementAppointmentCounter(payload)
      return true
    },

    async setFoodandDrink(payload: { _id: string; location: string; food: string; drink: string }) {
      const docRef = doc(database, `locations/${payload.location}/events/${payload._id}`)
      await setDoc(docRef, { food: payload.food, drink: payload.drink }, { merge: true })
    },

    async incrementAppointmentCounter(payload: {
      _id: string
      status: string
      location: string
      userId: string
    }) {
      const metadata: any = {}
      if (payload.status === 'arrived-on-time') {
        metadata[`appointments_on_time`] = increment(1)
      } else if (payload.status === 'arrived-late') {
        metadata[`appointments_late`] = increment(1)
      } else {
        metadata[`total_no_shows`] = increment(1)
      }
      const docRef = doc(database, `users/${payload.userId}`)
      await setDoc(docRef, { metadata }, { merge: true })
    }
  }
})
