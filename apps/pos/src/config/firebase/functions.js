import firebase from './firebase'
import {
  getFunctions
  // connectFunctionsEmulator
} from 'firebase/functions'

const functions = getFunctions(firebase, 'asia-east2')

// if (process.env.NODE_ENV === 'development') {
//   connectFunctionsEmulator(functions, 'localhost', 5001)
// }

export default functions