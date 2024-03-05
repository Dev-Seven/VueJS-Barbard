<script setup lang="ts">
import { useFirebaseAuth } from "vuefire";
import { signInWithEmailAndPassword } from "firebase/auth";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import { useCurrentUser } from "vuefire";
import { useUserStore } from "../stores/user";

const userStore = useUserStore();

const router = useRouter();
const formRef = ref<HTMLFormElement | null>(null);
const form = reactive({
  email: "",
  password: "",
});

const errors = ref();
const auth = useFirebaseAuth();

const login = async () => {
  errors.value = {};

  if (!formRef.value?.checkValidity()) return;

  try {
    if (auth) {
      await signInWithEmailAndPassword(auth, form.email, form.password);

      const db = getFirestore();
      const currentAuthUser = useCurrentUser();
      console.log("currentAuthUser", currentAuthUser);

      if (currentAuthUser.value) {
        const userID = currentAuthUser.value.uid;

        const userDocRef = doc(db, "admin", userID);

        await getDoc(userDocRef)
          .then(async (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              console.log("data", data);
              const user: any = {
                ...currentAuthUser.value,
                ...data,
              };
              await userStore.setCurrentUser(user);
            }
          })
          .catch((error) => {
            console.log("Error getting user document:", error);
          });
      }

      router.push("/");
    }
  } catch (e) {
    console.error(e);
  }
};
</script>

<template>
  <div class="min-h-screen hero bg-base-200">
    <div class="flex-col hero-content lg:flex-row-reverse">
      <div class="text-center lg:text-left"></div>
      <div class="flex-shrink-0 w-full max-w-sm shadow-2xl card bg-base-100">
        <div class="card-body">
          <h1 class="text-3xl font-bold">Barbaard Cheque</h1>
          <ul class="error-messages">
            <li v-for="(error, field) in errors" :key="field">
              {{ field }} {{ error ? error[0] : "" }}
            </li>
          </ul>
          <form ref="formRef" @submit.prevent="login">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input
                type="email"
                required
                placeholder="email"
                v-model="form.email"
                class="input input-bordered"
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Password</span>
              </label>
              <input
                type="password"
                required
                placeholder="password"
                v-model="form.password"
                class="input input-bordered"
              />
            </div>
            <div class="mt-6 form-control">
              <button
                class="btn btn-primary"
                :disabled="!form.email || !form.password"
                type="submit"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
