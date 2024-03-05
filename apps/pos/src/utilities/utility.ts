import { Timestamp } from 'firebase/firestore'
import { each, get, has, isNaN, set, split } from 'lodash'

/**
 *
 * @param {Number} epoch
 * @returns Object
 *
 * @description Convert the epoch timestamp to firebase's seconds
 * and nanoseconds format
 *
 * @see https://github.com/firebase/firebase-js-sdk/issues/2507
 */
export function toSecondsAndNanoseconds(ms: number) {
  return { seconds: Math.floor(ms / 1000), nanoseconds: (ms % 1000) * 1000000 }
}

/**
 *
 * @param {Object} data
 * @param  {...any} fields
 * @returns Object
 *
 * @description Firebase js SDK integration with javascript framework
 * may cause issue in storing timestamp. This patch function resolves
 * the issue buy re-creating those timestamps from given/converted
 * object
 *
 * @see https://github.com/firebase/firebase-js-sdk/issues/2507
 */
export function patchTimeStamp(data: { [key: string]: any }, ...fields: Array<string>) {
  const patched = { ...data }

  each(fields, (field) => {
    let stamp = get(patched, field)

    if (stamp) {
      if (typeof stamp === 'number') {
        stamp = toSecondsAndNanoseconds(stamp)
      }

      if (has(stamp, 'seconds') && has(stamp, 'nanoseconds')) {
        set(patched, field, new Timestamp(stamp.seconds, stamp.nanoseconds))
      }
    }
  })

  return patched
}

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getInitials(str: string) {
  const names = split(str, ' ')
  let initials = names[0].substring(0, 1).toUpperCase()

  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase()
  }
  return initials
}

export function numberWithCommas(x: number): string {
  if (!x) return 0

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 *
 * @param {Object} expiry
 * @param {Number} expiry.day Date of expiry
 * @param {Number} expiry.month Month of expiry
 * @param {Number} expiry.year Number of years from now
 * @return {Date}
 */
export function expiry({ day = 31, month = 11, year = 2 }) {
  const expiry = new Date()
  expiry.setFullYear(expiry.getFullYear() + year)
  expiry.setMonth(month)
  expiry.setDate(day)
  expiry.setHours(23, 59, 59, 999)
  return expiry
}

/**
 * @param {Function} callback
 * @param {Number} delay Next invocation time
 * @returns void
 */
export const setTimeoutLoop = (callback: Function, delay: number) => {
  if (callback()) {
    return
  }

  setTimeout(() => {
    setTimeoutLoop(callback, delay)
  }, 1000)
}

export function deepCloneObject<T>(ob: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(ob)), ob)
}

export function determinePoints(value: number): number {
  if (!value || isNaN(value) || value < 0) return 0
  if (value < 100000) return 5
  return 10 * Math.floor(value / 100000)
}
