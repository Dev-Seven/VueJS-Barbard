import { defineStore } from 'pinia'
import { each, filter, has, sortBy, uniqBy, values } from 'lodash'
import { collection, getDocs, query, where } from 'firebase/firestore'
import database from '@/config/firebase/database'
import Product from './product'
import { ComplimentaryTypes, ProductTypes } from '@/stores/sale/saleable/product'
import { useRegister } from '../register'
import { useApp } from '../app'
import { determinePoints } from '@/utilities/utility'

type CategoryType = {
  id: string
  title: string
}

export const useInventory = defineStore('inventory', {
  state: () => ({
    products: [] as Array<Product>,
    variants: [] as Array<Product>,
    FnBProducts: [] as Array<Product>,
    complimentary: [] as Array<FnBProduct>,
    Services: [] as Array<Product>,
    Upgrades: [] as Array<Product>,
    UpgradeComplimentary: [] as Array<Product>,
    selectedProduct: {} as Product,
    activeCategory: '',
    availableBrands: [] as Array<CategoryType>,
    availableFnBBrands: [] as Array<CategoryType>
  }),
  getters: {
    getProductsByBrand(state) {
      return (payload: string) => {
        return state.products.filter((product) => {
          if (payload == '1' && (product.category.id === '' || product.category.id === null)) {
            return true
          }
          return product.category.id == payload
        })
      }
    },

    getProductsByFnBBrand(state) {
      return (payload: string) => {
        return state.FnBProducts.filter((product) => {
          if (payload == '2' && (product.category.id === '' || product.category.id === null)) {
            return true
          }
          return product.category.id == payload
        })
      }
    },

    getItemById(state) {
      return (id: any) => {
        return state.products.find((p) => p.id === id)
      }
    },

    getFnBItemById(state) {
      return (id: any) => {
        return state.FnBProducts.find((p) => p.id === id)
      }
    },

    getSearchItems(state) {
      return (title: string) => {
        return state.products.filter((product) => {
          return title
            .toLowerCase()
            .split(' ')
            .every((v) => product.title.toLowerCase().includes(v))
        })
      }
    },

    getAvailableBrands: (state) => {
      return state.availableBrands
    },

    getAvailableFnBBrands(state) {
      const filter = (brand: any) => {
        return !brand.title.includes('.') && brand.title.split('-')[1] !== 'complimentary'
      }
      return state.availableFnBBrands.filter(filter)
    },

    getServices(state) {
      return state.Services
    },

    getAllProducts(state) {
      return state.products
    },

    getAllVariants(state) {
      return state.variants
    },

    getAllFnBProducts(state) {
      return state.FnBProducts
    },

    getFoodComplimentary(state) {
      return state.complimentary.filter(
        (item) => item.meta.complimentary.type === ComplimentaryTypes.Food
      )
    },

    getDrinkComplimentary(state) {
      return state.complimentary.filter(
        (item) => item.meta.complimentary.type === ComplimentaryTypes.Drink
      )
    }
  },
  actions: {
    async hydrate() {
      Promise.all([
        this.setProducts(),
        this.setFnBProducts(),
        this.setServices(),
        this.setUpgrades()
      ])
    },

    async setProducts() {
      const products: Array<Product> = []
      const variants: Array<Product> = []

      const categories: Array<CategoryType> = []
      const q = query(collection(database, `posItems/products/items`))
      const snapshot = await getDocs(q)

      snapshot.forEach((doc) => {
        const data = doc.data()

        if (has(data, 'status') && data.status.toLowerCase() === 'inactive') {
          return
        }

        data.points = data?.importPrice ? determinePoints(Number(data.price) - Number(data.importPrice)) : 0

        // TODO length check patch added as products coming with -1, -2 parentIds
        // remove it after test

        if (data?.parentId && data.parentId.length > 5) {
          variants.push(new Product(data, ProductTypes.ProductVariant))
        } else {
          const _product = new Product(data, ProductTypes.Product)
          products.push(_product)
          categories.push(_product.category)
        }
      })

      each(products, (product) => {
        const _variants = filter(variants, (v) => v.data.parentId === product.id)
        if (_variants.length) {
          product.variants = _variants
        }
      })

      const uniqueCategories = uniqBy(categories, 'id')

      this.products = products
      this.variants = variants
      this.availableBrands = uniqueCategories
    },

    async setFnBProducts() {
      const register = useRegister()
      const app = useApp()

      const products: Array<Product> = []
      const complimentary: Array<Product> = []
      const variants: Array<Product> = []
      const upgradeComplimentary: Array<Product> = []

      const categories: { [key: string]: any } = {}

      const items = await getDocs(query(collection(database, `posItems/f&b/items`)))
      const details = await getDocs(
        query(
          collection(database, `posItems/f&b/details`),
          where('active', '==', true),
          where('locations', 'array-contains', register.location)
        )
      )
      const groups = await getDocs(
        query(collection(database, `posItems/f&b/groups`), where('active', '==', true))
      )

      groups.forEach((group) => {
        const product = new Product({ _id: group.id, ...group.data() }, ProductTypes.FnB)
        products.push(product)
      })

      const _items: { [key: string]: any } = {}
      items.forEach((item) => (_items[item.id] = item.data()))

      const _taxes: { [key: string]: any } = {}
      app.tax.forEach((tax) => (_taxes[tax.id] = tax))

      details.forEach((detail) => {
        const _detail = detail.data()

        const meta: { [key: string]: any } = { type: ProductTypes.FnB }

        meta['tax'] =
          _detail?.taxId && has(_taxes, _detail.taxId)
            ? _taxes[_detail.taxId]
            : (meta['tax'] = {
                amount: 8,
                label: '8%'
              })

        if (_detail?.complimentary) {
          meta['complimentary'] = {
            complimentary: _detail.complimentary,
            type: _detail?.type || false,
            locations: _detail?.locations || []
          }

          const product = new Product(
            {
              _id: detail.id,
              ..._items[_detail.itemId],
              ..._detail
            },
            ProductTypes.FnB,
            meta,
            register.location
          )

          complimentary.push(product)
        } else {
          if (_detail?.parentId && _detail.parentId !== '""') {
            const { BOMPrice = 0, CategoryName = '' } = _items[_detail.itemId] || {}
            const product = new Product(
              {
                _id: detail.id,
                ..._items[_detail.itemId],
                BOMPrice,
                CategoryName,
                ..._detail
              },
              ProductTypes.FnBVariant,
              meta,
              register.location
            )

            variants.push(product)
            categories[product.category.id] = product.category
          } else {
            const product = new Product(
              {
                _id: detail.id,
                ..._items[_detail.itemId],
                ..._detail
              },
              ProductTypes.FnB,
              meta,
              register.location
            )
            products.push(product)
            categories[product.category.id] = product.category
          }
        }

        if (_detail.upgrade) {
          const product = new Product(
            {
              _id: detail.id,
              ..._items[_detail.itemId],
              ..._detail
            },
            ProductTypes.FnB,
            meta,
            register.location
          )

          upgradeComplimentary.push(product)
        }
      })

      each(products, (product) => {
        const _variants = filter(variants, (v) => v.data.parentId === product.id)
        if (_variants.length) {
          product.variants = _variants
        }
      })

      const _categories = uniqBy(values(categories), 'id')

      this.FnBProducts = products
      this.complimentary = complimentary
      this.availableFnBBrands = _categories
      this.UpgradeComplimentary = upgradeComplimentary
    },

    async setServices() {
      const services: Array<Product> = []
      const q = query(collection(database, `services`), where('active', '==', true))
      const snapshot = await getDocs(q)

      snapshot.forEach((doc) => {
        const service = new Product({ _id: doc.id, ...doc.data() }, ProductTypes.Service)
        services.push(service)
      })

      this.Services = sortBy(services, ['title'], ['asc'])
    },

    async setUpgrades() {
      const q = query(collection(database, `upgrades`))
      const snapshot = await getDocs(q)

      const upgrades: Array<Product> = []
      snapshot.forEach((doc) => {
        const upgrade = new Product({ _id: doc.id, ...doc.data() }, ProductTypes.Upgrade)
        upgrades.push(upgrade)
      })

      this.Upgrades = upgrades
    },

    async clearSelectedProductState() {
      if (this.selectedProduct?.id) {
        this.selectedProduct = {} as Product
        return { state_clear: true }
      }

      return { state_clear: false }
    },

    setActiveCategory(payload: string): void {
      this.activeCategory = payload
    }
  }
})
