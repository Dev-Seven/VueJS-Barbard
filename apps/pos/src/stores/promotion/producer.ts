const produceProductPromotions = (filters: Object) => {
  return [
    // This promotion is applicable for all products
    {
      name: '25% Off on all products',
      active: true,
      type: 'product',
      discountType: 'percentage',
      discountValue: 25,
      ...filters
    },
    // This promotion will apply to all product categories or all Products
    {
      name: '10% Off on all product categories',
      active: true,
      type: 'productCategory',
      discountType: 'percentage',
      discountValue: 10,
      productCategory: [],
      ...filters
    },
    // This promotion will apply to all product categories or all Products
    {
      name: 'Flat 1,00,000 off on all product categories',
      active: true,
      type: 'productCategory',
      discountType: 'money',
      discountValue: 100000,
      productCategory: [],
      ...filters
    },
    // This promotion will apply to given categories only
    {
      name: '20% off on Samsons, Goldfingers & Lockhearts products',
      active: true,
      type: 'productCategory',
      discountType: 'percentage',
      discountValue: 20,
      // 557809: Samson's
      // 557810: Goldfinders
      // 557811: Lockheart's
      productCategory: ['557809', '557810', '557811'],
      ...filters
    },
    // This promotion will apply to all brands or all Products
    {
      name: '5% off on all product brands',
      active: true,
      type: 'productBrand',
      discountType: 'percentage',
      discountValue: 5,
      productBrand: [],
      ...filters
    }
  ]
}

const produceFnbPromotions = (filters: Object) => {
  return [
    // This promotion is applicable for all f&b products
    {
      name: '8% off on all F&B products',
      active: true,
      type: 'fnb',
      discountType: 'percentage',
      discountValue: 8,
      ...filters
    },
    // This promotion is applicable for specific categories of f&n products
    {
      name: '10% off on Blended Whiskey & Rum',
      active: true,
      type: 'fnbCategory',
      discountType: 'percentage',
      discountValue: 10,
      // 424171: Blended Whisky
      // 387604: Rum
      fnbCategory: ['424171', '387604'],
      ...filters
    }
  ]
}

const produceServicePromotions = (filters: Object) => {
  return [
    // This promotion will be applicable for all services
    {
      name: '5% off on all services',
      active: true,
      type: 'service',
      discountType: 'percentage',
      discountValue: 5,
      ...filters
    },
    // This promotion will be applicable for specific services
    {
      name: 'flat 1,50,000 off on selected services',
      active: true,
      type: 'service',
      discountType: 'money',
      discountValue: 150000,
      services: ['0MYA7A8pQ49ENj2zQwtq', '8bUgC1K0K2FXrifeVtTm'],
      ...filters
    }
  ]
}

const produceUpgradePromotions = (filters: Object) => {
  return [
    // This promotion will be applicable for all upgrades
    {
      name: '8% off on all upgrades',
      active: true,
      type: 'upgrade',
      discountType: 'percentage',
      discountValue: 8,
      ...filters
    },
    // This promotion will be applicable for specific upgrades
    {
      name: '10% off on selected upgrades',
      active: true,
      type: 'upgrade',
      discountType: 'percentage',
      discountValue: 10,
      upgrades: ['6DQeEAR6FcrdKRu3lrmZ'],
      ...filters
    }
  ]
}

const producePromotions = (filters: Object) => {
  return [
    {
      name: '5% off discount on sale',
      active: true,
      type: 'sale',
      discountType: 'percentage',
      discountValue: 5,
      ...filters
    },
    {
      name: '5% off discount on all agreements',
      active: true,
      type: 'agreement',
      discountType: 'percentage',
      discountValue: 5,
      ...filters
    }
  ]
}

export const produce = () => {
  const product = produceProductPromotions({
    autoApply: true,
    users: ['DIuUVj9WeMzuqfCdIUVY'], // Test user Henk De
    customerGroup: ['new', 'barbershop']
  })

  const fnb = produceFnbPromotions({
    autoApply: true,
    memberGroup: ['Club Member'] // Test user Vlad Savin
  })

  const service = produceServicePromotions({ autoApply: true })
  const upgrade = produceUpgradePromotions({ autoApply: true })
  const common = producePromotions({ autoApply: true })

  return [...product, ...fnb, ...service, ...upgrade, ...common]
}
