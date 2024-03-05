import 'pinia'

declare module 'pinia' {
  export interface MapStoresCustomization {
    suffix: ''
  }
}

export {}

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN: string | boolean | undefined
  }

  let FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined
}
