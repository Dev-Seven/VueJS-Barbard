import firebase from './firebase'
import {
  Firestore,
  initializeFirestore,
  type FirestoreSettings
  // connectFirestoreEmulator,
} from 'firebase/firestore'

const settings: FirestoreSettings = {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true
}

const database: Firestore = initializeFirestore(firebase, settings)

// if (process.env.NODE_ENV === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8069)
// }

export default database
