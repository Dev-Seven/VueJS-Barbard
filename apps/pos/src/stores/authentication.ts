import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import auth from '@/config/firebase/auth'
import { has, isEmpty } from 'lodash'
import { type User } from '@/@types'
import database from '@/config/firebase/database'

export type UserType = User & {
  _id: string
  image: string
  roles: Array<string>
  locations: Array<string>
}

export const useAuthentication = defineStore('authentication', {
  state: () => ({
    user: {} as UserType
  }),
  getters: {
    isAuthenticated(state) {
      return !isEmpty(state.user)
    }
  },
  actions: {
    async authenticate(email: string, password: string) {
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        const snapshot = await getDoc(doc(database, `admin/${user.uid}`))
        const _user = snapshot.data()

        if (!has(_user, 'roles')) {
          throw Error("You don't have role assigned")
        }

        if (!_user?.active) {
          throw Error('Your account is not activated')
        }

        const allowed = ['pos.admin', 'pos.staff']

        if (_user && allowed.some((role) => _user.roles.includes(role))) {
          this.user = { _id: snapshot.id, ..._user } as UserType
        } else {
          throw "You don't have admin or staff role to access"
        }
      } catch (e) {
        throw 'Could not login your account, Try again or contact administrator.'
      }
    },

    async logout() {
      await signOut(auth)
    }
  },
  persist: {
    storage: window.localStorage,
    paths: ['user']
  }
})
