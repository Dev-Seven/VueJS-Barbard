import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  serverTimestamp,
  addDoc,
  getDoc,
  doc,
  setDoc,
  Timestamp,
  deleteDoc
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import database from '@/config/firebase/database'
import { patchTimeStamp } from '@/utilities/utility'
import { each, map, reduce, uniq, upperFirst } from 'lodash'
import { useSales } from './sales'
import { useAuthentication } from './authentication'
import { useStaff } from './staff'

export const PaymentMethods = {
  internalCashManagement: 'Internal Cash Management',
  storeCreditAgreement: 'Store Credit - Agreement',
  storeCreditGiftCheque: 'Store Credit - Gift Cheque',
  storeCreditLockerbox: 'Store Credit - Lockerbox'
}

export type SaleCategory = {
  _id: string
  name: string
  isCustom?: boolean
}

export const getRegister = () => {
  return {
    _id: '',
    closedAt: '',
    closedByUserId: '',
    closedByUserName: '',
    closingNote: '',
    code: 0,
    openStatus: false,
    openedAt: '',
    openedByUserId: '',
    openedByUserName: '',
    openingNote: '',
    totalPayment: 0,
    totalDifference: 0,
    summary: {},
    handover: false
  }
}

export const useRegister = defineStore('register', {
  state: () => ({
    register: {
      ...getRegister()
    },
    location: '',
    outlet: '',
    outlets: [] as Array<any>,

    registers: [],
    cashMovements: [] as Array<any>,

    salesCategories: [] as Array<SaleCategory>,
    tables: [] as Array<any>
  }),
  getters: {
    cashManagementEntries: (state) => state.cashMovements,

    availableRegisters: (state) => state.registers,
    registerId: (state) => state.register._id,

    isOpen: (state) => state.register.openStatus,

    info: (state) => ({ location: state.location, outlet: state.outlet }),

    currentSequenceCode: (state) => state.register.code
  },
  actions: {
    async initRegister(location: string, outlet: string, outlets: Array<any>) {
      this.location = location
      this.outlet = outlet
      this.outlets = outlets

      return await this.open()
    },

    async getLatestRegisterCode() {
      const q = query(
        collection(database, `locations/${this.location}/registers/${this.outlet}/sessions`),
        orderBy('code', 'desc'),
        limit(1)
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return 1
      }

      const lastRegister = snapshot.docs[0].data()
      return lastRegister.code + 1
    },

    async open() {
      const q = query(
        collection(database, `locations/${this.location}/registers/${this.outlet}/sessions`),
        where('openStatus', '==', true),
        limit(1)
      )

      const registers = await getDocs(q)

      if (!registers.size) {
        return false
      }

      this.register = registers.docs[0].data() as ReturnType<typeof getRegister>
      this.register._id = registers.docs[0].id

      this.setTables(this.location)

      return true
    },

    async create(payload: { code?: string; openingNote?: string; cashManagement: Array<any> }) {
      const staff = useStaff()
      const code = payload?.code ? payload.code : await this.getLatestRegisterCode()

      const openingData = {
        code,
        openingNote: payload.openingNote || '',
        openStatus: true,
        openedAt: serverTimestamp(),
        openedByUserId: staff.active._id,
        openedByUserName: staff.active.fullName
      }

      const register = {
        _id: '',
        closedAt: '',
        closedByUserId: '',
        closedByUserName: '',
        closingNote: '',
        ...openingData
      }

      const ref = await addDoc(
        collection(database, `locations/${this.location}/registers/${this.outlet}/sessions`),
        register
      )

      const snapshot = await getDoc(ref)
      this.register = snapshot.data() as ReturnType<typeof getRegister>
      this.register._id = snapshot.id

      Promise.all(
        payload.cashManagement.map(
          async (data: any) =>
            await this.createCashEntry({
              data,
              registerId: snapshot.id
            })
        )
      )

      window.dispatchEvent(new Event('register.opened'))
      this.setTables(this.location)
    },

    async setTables(location: string) {
      const snapshot = await getDocs(query(collection(database, `locations/${location}/tables`)))
      const tables: Array<any> = []
      snapshot.forEach((doc) => {
        tables.push({
          _id: doc.id,
          ...doc.data()
        })
      })
      this.tables = tables
    },

    async setCashEntries() {
      const q = query(
        collection(database, `locations/${this.location}/ledger`),
        where('method', '==', PaymentMethods.internalCashManagement),
        where('registerId', '==', this.registerId)
      )
      const snapshot = await getDocs(q)
      const entries: Array<any> = []
      snapshot.forEach((doc) => entries.push({ ...doc.data(), _id: doc.id }))
      this.cashMovements = entries
    },

    async createCashEntry(payload: { data: object; registerId: string }) {
      const ledgerRef = doc(collection(database, `locations/${this.location}/ledger`))

      const _ledger = {
        ...payload.data,
        registerId: payload.registerId,
        registerName: this.outlet,
        method: PaymentMethods.internalCashManagement,
        date: serverTimestamp()
      }

      setDoc(ledgerRef, _ledger).catch(console.error)

      this.cashMovements.push({ ..._ledger, date: Timestamp.now() })
    },

    async saveRegister() {
      const docRef = doc(
        database,
        `locations/${this.location}/registers/${this.outlet}/sessions/${this.registerId}`
      )

      const register = patchTimeStamp({ ...this.register }, 'openedAt', 'closedAt')

      await setDoc(docRef, register, { merge: true })

      console.log(`Register:: ${this.registerId} has been saved`)
    },

    async getOutletsFromLocation(location: string) {
      const snapshot = await getDocs(query(collection(database, `locations/${location}/registers`)))
      const outlets: Array<any> = []
      snapshot.forEach((doc) => {
        outlets.push({
          text: upperFirst(doc.id),
          value: doc.id
        })
      })

      return outlets
    },

    async activeRegistersInLocation(location: string) {
      const openRegisters: Array<any> = []
      const locationOutlets: Array<any> = []
      const outlets = await getDocs(query(collection(database, `locations/${location}/registers`)))

      outlets.forEach((doc) => locationOutlets.push(doc.id))

      await Promise.allSettled(
        locationOutlets.map(async (outlet) => {
          const registers = await getDocs(
            query(
              collection(database, `locations/${location}/registers/${outlet}/sessions`),
              where('openStatus', '==', true)
            )
          )

          if (!registers.empty) {
            registers.forEach((doc) => {
              openRegisters.push({ ...doc.data(), _id: doc.id })
            })
          }
        })
      )

      return openRegisters
    },

    /**
     * @description Register closure summary for Store Credit ledger entries
     * includes closure summary for agreement, gift-cheque and locker-box for
     * better reporting
     *
     * @param {Number} payload.difference
     * @param {string} payload.closingNote
     * @param {Array} payload.transactions
     */
    async storeCreditSummary() {
      const entries = await getDocs(
        query(
          collection(database, `locations/${this.location}/ledger`),
          where('registerId', '==', `${this.registerId}`)
        )
      )

      const summary = {
        storeCreditAgreements: {
          in: 0,
          out: 0,
          total: 0
        },
        storeCreditLockerBox: {
          total: 0
        },
        storeCreditGiftCheque: {
          total: 0
        }
      }

      entries.forEach((doc) => {
        const data = doc.data()
        switch (data.method) {
          case PaymentMethods.storeCreditAgreement:
            summary.storeCreditAgreements[data.amount < 0 ? 'in' : 'out'] += data.amount
            summary.storeCreditAgreements.total += data.amount
            break
          case PaymentMethods.storeCreditGiftCheque:
            summary.storeCreditGiftCheque.total += data.amount
            break
          case PaymentMethods.storeCreditLockerbox:
            summary.storeCreditLockerBox.total += data.amount
            break
          // no default case is required
        }
      })

      return summary
    },

    /**
     * @description Register closure with handover support which allows closing
     * register if other outlet is open in same location. Prevent closing the
     * register if total difference is more then 100000 for staff.
     *
     * @param {Number} payload.difference
     * @param {string} payload.closingNote
     * @param {Array} payload.transactions
     */
    async close(payload: {
      difference: number
      closingNote: string
      closedByUserId: string
      closedByUserName: string
      transactions: Array<any>
    }) {
      const sales = useSales()
      const authentication = useAuthentication()

      const { difference, closingNote, transactions, closedByUserId, closedByUserName } = payload
      let handover = false

      const hasActiveOrders = sales.activeOrders.filter((o) => {
        return o.active && o.registerId === this.registerId
      })

      if (hasActiveOrders.length) {
        const registers = await this.activeRegistersInLocation(this.location)
        // ignore the register being closed
        if (registers.length <= 1) {
          throw Error('This register can not be closed until all the sale is completed or parked!')
        } else {
          handover = true
        }
      }

      if (difference > 100000 && !authentication.user.roles.includes('pos.admin')) {
        throw Error('Only admin can close register if difference is more than 1,00,000')
      }

      const creditSummary = await this.storeCreditSummary()

      const summary: { [key: string]: any } = {
        payments: {},
        ...creditSummary
      }

      const totalPayment = reduce(transactions, (_totalPayment, t) => _totalPayment + t.amount, 0)
      const totalDifference = reduce(
        transactions,
        (_totalDifference, t) => _totalDifference + (t.amount - t.cleared),
        0
      )

      each(transactions, (t) => {
        summary.payments[t.method] = {
          counted: t.cleared,
          difference: t.amount - t.cleared,
          total: t.amount
        }
      })

      const closure: Partial<typeof this.register> = {
        closedAt: serverTimestamp(),
        closedByUserId,
        closedByUserName,
        openStatus: false,
        closingNote,
        totalPayment,
        totalDifference,
        summary,
        handover
      }

      this.register = {
        ...this.register,
        ...closure
      } as typeof this.register

      await this.saveRegister()

      await this.cleanSaleCategories()
      this.register = { ...getRegister() }
    },

    async hydrateSaleCategories(categories: Array<SaleCategory>) {
      this.salesCategories = categories
    },

    async cleanSaleCategories() {
      try {
        const sales = useSales()
        const categories = uniq(map(sales.orders, 'salesCategory'))
        console.log('categories for open orders', categories)

        const categoriesToClose = this.salesCategories.filter(
          (c) => c?.isCustom && !categories.includes(c._id)
        )
        console.log('categories needs to be cleaned', categoriesToClose)
        await Promise.all(
          categoriesToClose.map(
            async (c) =>
              await deleteDoc(
                doc(collection(database, `locations/${this.location}/salesCategories`), c._id)
              )
          )
        )
      } catch (e) {
        console.error(`Register:: could not clean up custom sales categories`, e)
      }
    },

    async createSalesCategory(name: string) {
      const _id = name.toLowerCase().replace(/ /g, '-')
      const category = { _id, name, isCustom: true }

      const categoryRef = doc(
        collection(database, `locations/${this.location}/salesCategories`),
        _id
      )
      setDoc(categoryRef, { name, isCustom: true }).catch(console.error)

      this.salesCategories.push(category)
      return category
    },

    reset() {
      this.register = getRegister()
      this.location = ''
      this.outlet = ''
      this.outlets = []
    }
  },
  persist: {
    storage: window.localStorage
  }
})
