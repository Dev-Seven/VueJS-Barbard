import { collection, getDocs, query, where } from 'firebase/firestore'
import { defineStore } from 'pinia'
import database from '@/config/firebase/database'
import { filter, has, intersection, isEmpty, map, some } from 'lodash'
import { useSale } from './sale/sale'
import { type Agreement } from '@/@types'
import { ProductTypes } from './sale/saleable'

export const KingAgreementCategories = ['Head & Hair', 'Beard & Shaving']

export const useAgreement = defineStore('agreement', {
  state: () => ({
    user: {}
  }),
  getters: {
    isAuthenticated(state) {
      return !isEmpty(state.user)
    }
  },
  actions: {
    async fetchAgreements() {
      const sale = useSale()
      const customer = sale.customer
      const products = sale.products

      const agreements = {
        gentleman: [],
        merchant: [],
        king: [],
        emperor: []
      } as {
        gentleman: Array<Agreement>
        merchant: Array<Agreement>
        king: Array<Agreement>
        emperor: Array<Agreement>
      }

      if (!customer.userId) {
        console.log(
          'Payment:: Could not load customer oriented data, customer is not added in order'
        )
        return agreements
      }

      const agreementQuery = query(
        collection(database, `agreements`),
        where(`userMap.${customer.userId}`, '==', true)
      )
      const agreementSnapshot = await getDocs(agreementQuery)

      const serviceIds = map(
        filter(products, (p: any) => p.type === ProductTypes.Service),
        'id'
      )
      const upgradeIds = map(
        filter(products, (p: any) => p.type === ProductTypes.Upgrade),
        'id'
      )

      agreementSnapshot.forEach((agreement) => {
        const _data: any = { _id: agreement.id, ...agreement.data() }

        const agreementServices = map(_data?.services, 'id')
        const agreementUpgrades = map(_data?.upgrades, 'id')

        switch (_data.type) {
          case ProductTypes.Service:
            if (!_data.amount) return
            if (has(_data, 'active') && !_data.active) return

            if (intersection(serviceIds, agreementServices).length) {
              agreements.gentleman.push({ ..._data, applicable: true })
            } else {
              agreements.gentleman.push({ ..._data, applicable: false })
              console.log(`Gentleman's Agreement:: ${_data._id} is not applicable to current order`)
            }
            return
          case ProductTypes.MerchantsAgreement:
          case ProductTypes.GrandMerchantsAgreement:
            if (new Date(_data.expiryDate.seconds * 1000).getTime() < Date.now()) return
            if (_data.redeemed >= _data.amount) return
            agreements.merchant.push({ ..._data, applicable: true })
            return
          case ProductTypes.KingsAgreement:
            if (new Date(_data.expiryDate.seconds * 1000).getTime() < Date.now()) return

            if (serviceIds.length) {
              const categories = map(
                filter(products, (p: any) => p.type === ProductTypes.Service),
                'serviceCategory'
              )
              if (some(categories, (c: string) => KingAgreementCategories.includes(c))) {
                agreements.king.push({ ..._data, applicable: true })
              }
            } else {
              agreements.king.push({ ..._data, applicable: false })
              console.log(`King's Agreement:: ${_data._id} is not valid for current order`)
            }
            return
          case ProductTypes.EmperorsAgreement:
            if (new Date(_data.expiryDate.seconds * 1000).getTime() < Date.now()) return
            if (!_data.active) return

            agreements.emperor.push({ ..._data, applicable: true })

            return
          case 'upgrades':
            if (has(_data, 'active') && !_data.active) return

            if (intersection(upgradeIds, agreementUpgrades).length) {
              agreements.gentleman.push({ ..._data, applicable: true })
            } else {
              agreements.gentleman.push({ ..._data, applicable: false })
              console.log(`Upgrade Agreement:: ${_data._id} is not applicable to current order`)
            }
            return
          default:
            return
        }
      })

      return agreements
    }
  }
})
