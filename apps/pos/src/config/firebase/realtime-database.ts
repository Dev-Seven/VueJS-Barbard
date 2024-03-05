import firebase from './firebase'
import {
  type Database,
  getDatabase
  // connectDatabaseEmulator
} from 'firebase/database'

const database: Database = getDatabase(firebase)

// if (process.env.NODE_ENV === 'development') {
//   connectDatabaseEmulator(database, 'localhost', 9000)
// }

export const transform = (data) => JSON.parse(JSON.stringify(data))

export default database
