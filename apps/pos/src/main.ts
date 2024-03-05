import '@/assets/style.scss'
import 'vue3-toastify/dist/index.css'

import { createApp } from 'vue'
import { createPinia, setMapStoreSuffix } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import plugins from './plugins'
import { VueTelInput } from 'vue-tel-input'
import VueNumberFormat from '@coders-tm/vue-number-format'
import Toast, { type ToastContainerOptions } from 'vue3-toastify'

const app = createApp(App)

setMapStoreSuffix('')
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(plugins)
app.use(VueTelInput)
app.use(Toast, {
  autoClose: 3000
} as ToastContainerOptions)
app.use(VueNumberFormat, { precision: 4 })

app.mount('#app')
