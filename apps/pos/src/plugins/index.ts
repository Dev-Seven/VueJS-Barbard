import { type App } from 'vue'
import { Appointment } from './appointment'
import { Core } from './core'
import { Order } from './order'
import { Promotion } from './promotion'
import { SalesCategories } from './sales-categories'

const Barbaard = {
  install(app: App) {
    app.use(Core)
    app.use(Appointment)
    app.use(Order)
    app.use(Promotion)
    app.use(SalesCategories)
  }
}

export default Barbaard
