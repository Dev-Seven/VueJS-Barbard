import { createRouter, createWebHistory } from 'vue-router'
import middlewarePipeline from './guard'
import { Auth } from './middlewares/auth'
import { RegisterSession } from './middlewares/register'

import Authentication from '@/views/auth/Login.vue'
import Home from '@/views/home/Home.vue'
import CreateRegister from '@/views/register/Create.vue'
import OpenRegister from '@/views/register/Open.vue'
import CloseRegister from '@/views/register/Close.vue'
import CashManagement from '@/views/register/CashManagement.vue'
import InitialRegister from '@/views/register/Initial.vue'
import Appointment from '@/views/home/Appointment.vue'
import Tables from '@/views/home/Tables.vue'
import CreateSale from '@/views/sale/CreateSale.vue'
import Sale from '@/views/sale/Sale.vue'
import Payment from '@/views/sale/Payment.vue'
import Persona from '@/views/sale/Persona.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Home,
      children: [
        {
          path: '',
          component: Tables,
          name: 'home',
          meta: {
            middleware: [Auth, RegisterSession]
          }
        },
        {
          path: 'appointment/:id',
          name: 'appointment.detail',
          component: Appointment,
          props: (route) => ({
            ...route.params
          }),
          meta: {
            middleware: [Auth, RegisterSession]
          }
        }
      ],
      meta: {
        middleware: [Auth, RegisterSession]
      }
    },
    {
      path: '/register',
      component: CreateRegister,
      name: 'register',
      children: [
        {
          path: 'open',
          name: 'register.open',
          component: InitialRegister,
          meta: {
            middleware: [Auth]
          }
        },
        {
          path: 'create',
          name: 'register.create',
          component: OpenRegister,
          props: (route) => ({
            ...route.params
          }),
          meta: {
            middleware: [Auth]
          }
        },
        {
          path: 'close',
          name: 'register.close',
          component: CloseRegister,
          props: (route) => ({
            ...route.params
          }),
          meta: {
            middleware: [Auth, RegisterSession]
          }
        },
        {
          path: 'cash-management',
          name: 'register.cash-management',
          component: CashManagement,
          props: (route) => ({
            ...route.params
          }),
          meta: {
            middleware: [Auth, RegisterSession]
          }
        }
      ],
      meta: {
        middleware: [Auth, RegisterSession]
      }
    },
    {
      path: '/sale',
      children: [
        {
          path: 'create',
          name: 'sale.create',
          component: CreateSale,
          meta: {
            middleware: [Auth, RegisterSession]
          }
        },
        {
          path: '/sale/:orderId',
          name: 'sale',
          component: Sale,
          meta: {
            middleware: [Auth, RegisterSession]
          }
        }
      ],
      meta: {
        middleware: [Auth, RegisterSession]
      }
    },
    {
      path: '/payment/:orderId',
      name: 'payment',
      component: Payment,
      meta: {
        middleware: [Auth, RegisterSession]
      }
    },
    {
      path: '/persona/:orderId',
      name: 'persona',
      component: Persona,
      meta: {
        middleware: [Auth, RegisterSession]
      },
      props: true
    },
    {
      path: '/auth/login',
      name: 'login',
      component: Authentication
    }
  ]
})

router.beforeEach(async (to: any, from, next) => {
  const context = {
    to,
    next
  }

  if (!to.meta.middleware) {
    next()
  } else {
    const middleware = to.meta.middleware
    return middleware[0]({
      ...context,
      next: middlewarePipeline(context, middleware, 1)
    })
  }
})

export default router
