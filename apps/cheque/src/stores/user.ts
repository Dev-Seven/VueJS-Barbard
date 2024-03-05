import { defineStore } from "pinia";
import { useFirebaseAuth } from "vuefire";
import { signOut } from "firebase/auth";
import { router } from "../router.js";
import Storage from "../utils/storage";
import { ref, computed } from "vue";

interface User {
  email?: string;
  uid?: string;
  locations?: string[];
  [key: string]: any;
}

// interface UserStore {
//   getters: {
//     isLoggedIn: boolean
//     selectedLocation: string
//   }
//   actions: {
//     setLocation(val: string): void
//     login(email: string, password: string): Promise<void>
//     logout(): Promise<void>
//   }
//   mutations: {
//     setCurrentUser(val: User): void
//   }
//   state: {
//     user: User | null
//     selectedLocation: string
//   }
// }

const userStorage = new Storage<User>("user");
const selectedLocationStorage = new Storage<string>("selectedLocation");

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(userStorage.get());
  const selectedLocation = ref<string>(selectedLocationStorage.get() || "");

  const isLoggedIn = computed(() => !!user.value);
  const getSelectedLocation = computed(() => selectedLocation.value);
  const getUser = computed(() => user.value);

  const auth = useFirebaseAuth();

  const logout = async () => {
    if (auth) {
      await signOut(auth);
      selectedLocationStorage.remove();
      userStorage.remove();
      router.push("/login");
    }
  };

  const setLocation = (val: string) => {
    selectedLocation.value = val;
    selectedLocationStorage.set(val);
  };

  const setCurrentUser = (val: User) => {
    user.value = val;
    const locations = val.locations;
    if (!selectedLocation.value && locations) setLocation(locations[0]!);
    userStorage.set(val);
  };

  return {
    user,
    selectedLocation,
    getSelectedLocation,
    isLoggedIn,
    getUser,
    logout,
    setLocation,
    setCurrentUser,
  };
});

// export const useUserStore = defineStore({
//   id: 'user',
//   state: (): UserStore['state'] => ({
//     user: userStorage.get(),
//     selectedLocation: selectedLocationStorage.get() || ''
//   }),
//   getters: {
//     getUser: (state): User | null => state.user,
//     isLoggedIn: (state): boolean => !!state.user,
//     getSelectedLocation: (state): string => state.selectedLocation
//   },
//   actions: {
//     async setCurrentUser(val: User) {
//       this.user = val
//       const locations = val.locations
//       if (!this.selectedLocation && locations) this.setLocation(locations[0]!)
//       await userStorage.set(val)
//     },
//     setLocation(val: string): void {
//       this.selectedLocation = val
//       selectedLocationStorage.set(val)
//     },
//     async logout() {
//       const auth = useFirebaseAuth()
//       if (auth) {
//         signOut(auth)
//           .then(() => {
//             selectedLocationStorage.remove()
//             userStorage.remove()
//             router.push('/login')
//           })
//           .catch((error) => {
//             console.log(error)
//           })
//         this.user = null
//       }
//     }
//   }
// })
