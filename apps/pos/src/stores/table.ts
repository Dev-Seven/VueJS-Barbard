import { defineStore } from 'pinia'
import { compact, map, reduce } from 'lodash'
import { useRegister } from './register'
import { collection, getDocs, query } from 'firebase/firestore'
import database from '@/config/firebase/database'
import { useSales } from './sales'
import { useSale } from './sale/sale'

export type Table = {
  name: string
  reserved?: boolean
}

export type ExtendedTable = Table & { _id: string }

export type TablePayload = {
  tableId: string
  tableName: string
  customBill: string
}

export const useTables = defineStore('tables', {
  state: () => ({
    tables: [] as Array<ExtendedTable>
  }),
  getters: {
    unoccupied(state) {
      const sales = useSales()
      const occupied = compact(map(sales.orders, (o: any) => o.tableId))
      return state.tables.filter((t: any) => !occupied.includes(t._id))
    },

    occupied(state) {
      const sales = useSales()
      const occupied = compact(map(sales.orders, (o: any) => o.tableId))
      return state.tables.filter((t) => occupied.includes(t._id))
    },

    occupiedTableIds() {
      const sales = useSales()
      return reduce(
        sales.orders as Array<any>,
        (list, order) => {
          if (order.tableId) {
            list.push(order.tableId)
          }
          return list
        },
        [] as Array<string>
      )
    }
  },
  actions: {
    async setTable(payload: TablePayload) {
      const sale = useSale()
      const { tableId, tableName, customBill } = payload
      if (tableId && tableName) {
        sale.setTable(tableId, tableName)
      } else {
        sale.setCustomBill(customBill)
      }
    },

    async setTablesForCurrentLocation() {
      const register = useRegister()
      const q = query(collection(database, `locations/${register.location}/tables`))
      const snapshot = await getDocs(q)
      const tables = [] as Array<ExtendedTable>
      snapshot.forEach((doc) => {
        tables.push({
          _id: doc.id,
          ...(doc.data() as Table)
        })
      })

      this.tables = tables
    }
  }
})
