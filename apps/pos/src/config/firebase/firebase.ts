import { initializeApp } from 'firebase/app'
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { config } from './config'

const firebase = initializeApp(config)

/**
 * @description to enable AppCheck in local development
 * environment, uncomment the below line and copy the
 * debug token generated from browser console. register
 * the token in firebase AppCheck debug token
 * @here https://console.firebase.google.com/project/barbaard-dev/appcheck/apps
 *
 */

// self.FIREBASE_APPCHECK_DEBUG_TOKEN = true

initializeAppCheck(firebase, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_APP_CHECK_KEY),
  isTokenAutoRefreshEnabled: true
})

export default firebase
