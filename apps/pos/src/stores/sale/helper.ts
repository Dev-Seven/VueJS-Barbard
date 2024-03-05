import {
  Timestamp,
  type Transaction,
  arrayUnion,
  collection,
  doc,
  increment,
  serverTimestamp
} from 'firebase/firestore'
import database from '@/config/firebase/database'
import { filter, find, has, isArray, isEmpty, map, round } from 'lodash'
import {
  STORE_CREDIT_AGREEMENT,
  STORE_CREDIT_GIFTCHEQUE,
  STORE_CREDIT_LOCKERBOX
} from '@/utilities/constants'
import { ProductTypes } from './saleable'
import { useAnalytics } from '../analytics'
import type { Customer, SaleProduct } from './types'
import { getTotalPayableAmount } from '@/utilities/sale'
import moment from 'moment'
import type { Promotion } from '../promotion/promotion'

type ArgsType = {
  transaction: Transaction
  _id: string
  orderId: string
  registerId: string
  registerName: string
  location: string
  customer: Customer
  order: any
  payments: any
  voucher: any
  saleDiscount: {
    type: string
    percentage: number
    amount: number
  }
}

export const createLedgerEntries = async ({
  payments,
  registerId,
  location,
  voucher,
  transaction,
  customer,
  _id,
  order,
  orderId,
  registerName
}: ArgsType) => {
  if (!payments.length) {
    console.log('No payment entries to process for ledger')
    return false
  }

  console.log(`Creating ${payments.length} Ledger entries from sale`)

  return await Promise.all(
    payments.map(async (payment: any) => {
      const ledgerRef = doc(collection(database, `locations/${location}/ledger`))

      const _ledger = {
        orderId: _id,
        order: orderId,
        amount: payment.amount,
        date: serverTimestamp(),
        method: payment.method,
        registerId,
        staffId: order.staffId,
        staffName: order.staffName,
        status: 1,
        userId: customer.userId,
        userName: customer.userName,
        register: registerName
      }

      transaction.set(ledgerRef, _ledger)

      console.log(`Ledger:: ${ledgerRef.id} has been created`)

      if (payment.method === 'giftcheque') {
        await updateGiftCheque({ payment, voucher, transaction, _id })
      }

      return { _id: ledgerRef.id, ..._ledger }
    })
  )
}

export const updatePromotions = async ({ order, transaction }: ArgsType) => {
  const { promotion = [] } = order
  const _promotions = filter(promotion, (p: Promotion) => has(p, 'redemptionLimit'))

  console.log(
    `Promotion:: ${_promotions.length ? _promotions.length : 'No'} promotion needs to be updated`
  )

  return await Promise.all(
    _promotions.map(async (promotion: Promotion) => {
      const update: any = {}
      if (promotion.redemptionLimit === 1) {
        update.active = false
      } else {
        update.redemptionCount = increment(1)

        if (
          promotion.redemptionLimit &&
          promotion.redemptionLimit - 1 === promotion.redemptionCount
        ) {
          update.active = false
        }
      }

      const ref = doc(database, 'promotions', promotion._id)
      transaction.update(ref, update)
    })
  )
}

export const updateGiftCheque = async ({
  payment,
  voucher,
  transaction,
  _id
}: Partial<ArgsType> & Pick<ArgsType, 'transaction'> & { payment: any }) => {
  if (isEmpty(payment) || isEmpty(voucher)) {
    console.log('Giftcheque voucher or payment is empty')
    return true
  }

  console.log(`Updating Giftcheque redeemption with voucher`)

  const updateTo = { ...voucher }
  updateTo.storeCredit = parseInt(updateTo.storeCredit) - payment.amount

  if (!isArray(updateTo.orders)) {
    updateTo.orders = []
  }

  updateTo.orders.push({
    date: Timestamp.fromDate(new Date()),
    id: _id,
    total: payment.amount
  })

  if (!updateTo.storeCredit) {
    updateTo.active = false
  }

  const _updateTo = updateTo._id
  delete updateTo._id

  const ref = doc(database, 'giftcheques', _updateTo)
  transaction.update(ref, updateTo)
  console.log(`Gift Cheque:: ${ref.id} has been updated`)

  return { _id: _updateTo, ...updateTo }
}

export const updateAgreements = async ({
  order,
  _id,
  payments,
  transaction
}: Partial<ArgsType> & Pick<ArgsType, 'transaction'>) => {
  console.log('Updating Agreement redeemptions')
  const agreementPay = find(payments, (p) => p.method === STORE_CREDIT_AGREEMENT)

  if (!agreementPay) return

  console.log(`Updating Gentleman's Agreement redeemption from sale`)

  return await Promise.all(
    agreementPay.agreements.map(async (agreement: any) => {
      const ref = doc(database, 'agreements', agreement._id)

      const update: any = {
        left: increment(-1),
        redeemed: increment(1),
        storeCredit: increment(-agreement.pricePerService)
      }

      if (
        ![ProductTypes.KingsAgreement, ProductTypes.EmperorsAgreement].includes(agreement.type) &&
        agreement.left === 1
      ) {
        update.active = false
      }

      if (!isEmpty(order.eventItem)) {
        update.appointments = arrayUnion(order.eventItem)
      }
      update.orders = arrayUnion(_id)
      transaction.update(ref, update)
    })
  )
}

/**
 *
 * @param param0 default arguments
 * @param {string} param1.location Location name
 * @returns {object} param1.register Register Document
 * @description General idea is to discount the product but number of
 * free products on purchase of several items together. For accounting,
 * the product price will be considered by pricePerService, which ignores
 * the number of free compensation count added in sale.
 */
export const createGentlemanAgreements = async ({
  location,
  registerId,
  registerName,
  order,
  transaction,
  customer,
  _id,
  orderId,
  saleDiscount
}: ArgsType) => {
  const agreements = order.products.filter(
    (p: SaleProduct) => p.type === ProductTypes.GentlemanAgreement
  )

  if (!agreements.length) return false

  console.log(`Creating ${agreements.length} Gentleman's Agreement from sale`)

  const analytics = useAnalytics()
  analytics.assignTagToUser({ user: customer, tags: ['agreement'], transaction })

  return await Promise.all(
    agreements.map(async (agreement: any) => {
      const ledgerRef = doc(collection(database, `locations/${location}/ledger`))
      const agreementRef = doc(collection(database, `agreements`))

      const _services = { id: agreement.service.id, name: agreement.service.name }
      const quantity = agreement.agreementCount + agreement.agreementComp

      const total = getTotalPayableAmount(agreement, saleDiscount?.percentage || 0)

      const expiry = moment().add(2, 'years').toDate()

      const _doc = {
        active: true,
        type: 'service',
        amount: agreement.agreementCount + agreement.agreementComp,
        price: total,
        left: quantity,
        redeemed: 0,
        pricePerService: round(total / quantity),
        storeCredit: total,
        expiryDate: Timestamp.fromDate(expiry),
        services: [_services],
        serviceName: _services.name,
        createdAt: serverTimestamp(),
        purchasedAt: serverTimestamp(),
        orderId: _id,
        order: orderId,
        userMap: customer.userId
          ? {
              [customer.userId]: true
            }
          : {},
        users: [
          {
            userId: customer.userId,
            userName: customer.userName
          }
        ],
        staffId: agreement.salesPerson.staffId,
        staffName: agreement.salesPerson.staffName
      }

      transaction.set(agreementRef, _doc)

      const _ledger = {
        orderId: _id,
        order: orderId,
        amount: -total,
        date: serverTimestamp(),
        method: STORE_CREDIT_AGREEMENT,
        registerId,
        register: registerName,
        status: 1,
        staffId: order.staffId,
        staffName: order.staffName,
        userId: customer.userId,
        userName: customer.userName
      }

      transaction.set(ledgerRef, _ledger)

      console.log(
        `Agreement:: ${agreementRef.id} has been created with ledger entry ${ledgerRef.id}`
      )

      return {
        document: {
          _id: agreementRef.id,
          ..._doc
        },
        ledger: {
          _id: ledgerRef.id,
          ..._ledger
        }
      }
    })
  )
}

/**
 *
 * @param param0 default arguments
 * @param {string} param1.location Location name
 * @returns {object} param1.register Register Document
 * @description Method used to create merchant and grand merchant agreement
 */
export const createMerchantAgreements = async ({
  location,
  registerId,
  registerName,
  order,
  transaction,
  customer,
  _id,
  orderId
}: ArgsType) => {
  const agreements = order.products.filter((p: SaleProduct) => {
    return (
      p.type === ProductTypes.MerchantsAgreement || p.type === ProductTypes.GrandMerchantsAgreement
    )
  })

  if (!agreements.length) return false

  const merchants = filter(agreements, (a) => a.type === ProductTypes.MerchantsAgreement).length
  const grandMerchants = filter(
    agreements,
    (a) => a.type === ProductTypes.GrandMerchantsAgreement
  ).length
  console.log(
    `Creating ${merchants} Merchant's Agreement & ${grandMerchants} Grand Merchant's Agreement from sale`
  )

  const tags = []
  if (merchants) tags.push('merchants')
  if (grandMerchants) tags.push('grand-merchants')

  const analytics = useAnalytics()
  analytics.assignTagToUser({ user: customer, tags, transaction })

  return await Promise.all(
    agreements.map(async (agreement: any) => {
      const ledgerRef = doc(collection(database, `locations/${location}/ledger`))
      const agreementRef = doc(collection(database, `agreements`))

      const services = map(agreement.services, (s) => ({
        id: s.id,
        name: s.name
      }))
      const quantity = agreement.agreementCount + agreement.agreementComp
      const agreementPrice = agreement.price - agreement.discount

      const expiry = moment().add(2, 'years').toDate()

      const _doc = {
        active: true,
        type: agreement.type,
        amount: agreement.agreementCount + agreement.agreementComp,
        price: agreementPrice,
        left: quantity,
        redeemed: 0,
        pricePerService: round(agreementPrice / quantity),
        storeCredit: agreementPrice,
        expiryDate: Timestamp.fromDate(expiry),
        services,
        serviceName: map(services, 'name').join(' & '),
        createdAt: serverTimestamp(),
        purchasedAt: serverTimestamp(),
        orderId: _id,
        order: orderId,
        userMap: customer.userId
          ? {
              [customer.userId]: true
            }
          : {},
        users: [
          {
            userId: customer.userId,
            userName: customer.userName
          }
        ],
        staffId: agreement.salesPerson.staffId,
        staffName: agreement.salesPerson.staffName
      }

      transaction.set(agreementRef, _doc)

      const _ledger = {
        orderId: _id,
        order: orderId,
        amount: -agreementPrice,
        date: serverTimestamp(),
        method: STORE_CREDIT_AGREEMENT,
        registerId,
        register: registerName,
        status: 1,
        staffId: order.staffId,
        staffName: order.staffName,
        userId: customer.userId,
        userName: customer.userName
      }

      transaction.set(ledgerRef, _ledger)

      console.log(
        `Agreement:: ${agreementRef.id} has been created with ledger entry ${ledgerRef.id}`
      )

      return {
        document: {
          _id: agreementRef.id,
          ..._doc
        },
        ledger: {
          _id: ledgerRef.id,
          ..._ledger
        }
      }
    })
  )
}

/**
 *
 * @description Method used to create king and emperor agreement
 */
export const createKingsAgreements = async ({
  location,
  registerId,
  registerName,
  order,
  transaction,
  customer,
  _id,
  orderId,
  saleDiscount
}: ArgsType) => {
  const agreements = order.products.filter((p: SaleProduct) => {
    return p.type === ProductTypes.KingsAgreement || p.type === ProductTypes.EmperorsAgreement
  })

  if (!agreements.length) return false

  const kings = filter(agreements, (a) => a.type === ProductTypes.KingsAgreement).length
  const emperor = filter(agreements, (a) => a.type === ProductTypes.EmperorsAgreement).length
  console.log(`Creating ${kings} King's Agreement & ${emperor} Emperor's Agreement from sale`)

  const tags = []
  if (kings) tags.push('kings agreement')
  if (emperor) tags.push('emperor agreement')

  const analytics = useAnalytics()
  analytics.assignTagToUser({ user: customer, tags, transaction })

  return await Promise.all(
    agreements.map(async (agreement: any) => {
      const agreementRef = doc(collection(database, `agreements`))
      const ledgerRef = doc(collection(database, `locations/${location}/ledger`))

      const expiry = moment().add(agreement.months, 'months').toDate()

      const total = getTotalPayableAmount(agreement, saleDiscount?.percentage || 0)

      const _doc = {
        active: true,
        type: agreement.type,
        price: total,
        months: agreement.months,
        pricePerMonth: round(total / agreement.months),
        storeCredit: total,
        redeemed: 0,
        pricePerService: 0,
        expiryDate: Timestamp.fromDate(expiry),
        orderId: _id,
        order: orderId,
        createdAt: serverTimestamp(),
        purchasedAt: serverTimestamp(),
        userMap: customer.userId
          ? {
              [customer.userId]: true
            }
          : {},
        users: [
          {
            userId: customer.userId,
            userName: customer.userName
          }
        ],
        staffId: agreement.salesPerson.staffId,
        staffName: agreement.salesPerson.staffName
      }
      transaction.set(agreementRef, _doc)

      const _ledger = {
        orderId: _id,
        order: orderId,
        amount: -total,
        date: serverTimestamp(),
        method: STORE_CREDIT_AGREEMENT,
        registerId,
        register: registerName,
        status: 1,
        staffId: order.staffId,
        staffName: order.staffName,
        userId: customer.userId,
        userName: customer.userName
      }
      transaction.set(ledgerRef, _ledger)

      console.log(
        `Agreement:: ${agreementRef.id} has been created with ledger entry ${ledgerRef.id}`
      )

      return {
        document: {
          _id: agreementRef.id,
          ..._doc
        },
        ledger: {
          _id: ledgerRef.id,
          ..._ledger
        }
      }
    })
  )
}

export const createGiftCheque = async ({
  registerId,
  registerName,
  order,
  location,
  transaction,
  customer,
  _id,
  orderId
}: ArgsType) => {
  const cheques = order.products.filter((p: SaleProduct) => p.type === ProductTypes.GiftCheque)

  if (!cheques.length) return true

  console.log(`Creating ${cheques.length} Giftcheque from sale`)

  return await Promise.all(
    cheques.map(async (cheque: any) => {
      const chequeRef = doc(collection(database, `giftcheques`))
      const ledgerRef = doc(collection(database, `locations/${location}/ledger`))

      const expiry = moment().add(2, 'years').toDate()

      const _doc = {
        orderId: _id,
        order: orderId,
        active: true,
        value: cheque.price,
        code: cheque.code,
        storeCredit: cheque.price,
        expiryDate: Timestamp.fromDate(expiry),
        id: cheque.id,
        purchasedAt: serverTimestamp(),
        salesChannel: `POS - ${location}`,
        staffId: cheque.salesPerson.staffId,
        staffName: cheque.salesPerson.staffName,
        userId: customer.userId,
        userName: customer.userName
      }
      transaction.set(chequeRef, _doc)

      const _ledger = {
        orderId: _id,
        order: orderId,
        amount: -cheque.price,
        date: serverTimestamp(),
        method: STORE_CREDIT_GIFTCHEQUE,
        registerId: registerId,
        register: registerName,
        status: 1,
        staffId: order.staffId,
        staffName: order.staffName,
        userId: customer.userId,
        userName: customer.userName
      }

      transaction.set(ledgerRef, _ledger)

      console.log(
        `Gift Cheque:: ${chequeRef.id} has been created with ledger entry ${ledgerRef.id}`
      )

      return {
        document: {
          _id: chequeRef.id,
          ..._doc
        },
        ledger: {
          _id: ledgerRef.id,
          ..._ledger
        }
      }
    })
  )
}

export const createLockerBox = async ({
  registerId,
  registerName,
  order,
  location,
  transaction,
  customer,
  _id,
  orderId,
  saleDiscount
}: ArgsType) => {
  const boxes = order.products.filter((p: SaleProduct) => p.type === ProductTypes.LockerBox)

  if (!boxes.length) return true

  console.log(`Creating ${boxes.length} Lockerbox from sale`)

  const analytics = useAnalytics()
  analytics.assignTagToUser({ user: customer, tags: ['locker box'], transaction })

  return await Promise.all(
    boxes.map(async (box: any) => {
      const boxRef = doc(collection(database, `locations/${location}/lockerbox`))
      const ledgerRef = doc(collection(database, `locations/${location}/ledger`))

      const expiry = moment().add(box.months, 'months').toDate()

      const total = getTotalPayableAmount(box, saleDiscount?.percentage || 0)

      const _doc = {
        active: true,
        price: total,
        months: box.months,
        serviceName: `Lockerbox No. ${box.lockerNumber}`,
        pricePerMonth: round(total / box.months),
        storeCredit: total,
        redeemed: 0,
        freeGuests: box.freeGuests,
        number: box.lockerNumber,
        expiryDate: Timestamp.fromDate(expiry),
        purchasedAt: serverTimestamp(),
        orderId: _id,
        order: orderId,
        userId: customer.userId,
        userName: customer.userName,
        staffId: box.salesPerson.staffId,
        staffName: box.salesPerson.staffName
      }
      transaction.set(boxRef, _doc)

      const _ledger = {
        orderId: _id,
        order: orderId,
        amount: -total,
        date: serverTimestamp(),
        method: STORE_CREDIT_LOCKERBOX,
        registerId,
        register: registerName,
        status: 1,
        staffId: order.staffId,
        staffName: order.staffName,
        userId: customer.userId,
        userName: customer.userName
      }
      transaction.set(ledgerRef, _ledger)

      console.log(`Lockerbox:: ${boxRef.id} has been created with ledger entry ${ledgerRef.id}`)

      return {
        document: {
          _id: boxRef.id,
          ..._doc
        },
        ledger: {
          _id: ledgerRef.id,
          ..._ledger
        }
      }
    })
  )
}
