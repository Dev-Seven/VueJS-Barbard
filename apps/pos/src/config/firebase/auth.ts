import firebase from './firebase'
import {
  getAuth,
  // connectAuthEmulator,
  browserSessionPersistence
} from 'firebase/auth'

const auth = getAuth(firebase)

// if (process.env.NODE_ENV === 'development') {
//   connectAuthEmulator(auth, 'http://localhost:9099')
// }

auth.setPersistence(browserSessionPersistence)

export default auth
