<template>
  <div class="tw-mx-4 tw-flex tw-justify-center tw-items-center tw-h-full">
    <div class="tw-w-full md:tw-w-1/2">
      <div class="tw-flex tw-justify-center tw-mb-2">
        <img class="tw-h-14" />
      </div>
      <div class="tw-p-6 tw-border tw-rounded-xl tw-shadow-md tw-bg-white">
        <h3 class="tw-text-center tw-mb-4 tw-font-bold">Sign in</h3>

        <div
          class="tw-w-full tw-flex tw-rounded-lg tw-border tw-border-gray-300 tw-overflow-hidden tw-mb-2"
        >
          <div
            class="tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-border-r tw-border-gray-300"
          >
            Email
          </div>
          <input
            class="tw-px-3 tw-w-full tw-outline-none"
            type="text"
            placeholder="Enter your email"
            v-model="email"
            autofocus
          />
        </div>
        <div
          class="tw-w-full tw-flex tw-rounded-lg tw-border tw-border-gray-300 tw-overflow-hidden tw-mb-2"
        >
          <div
            class="tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-border-r tw-border-gray-300"
          >
            Password
          </div>
          <input
            class="tw-px-3 tw-w-full tw-outline-none"
            type="password"
            placeholder="Enter your Password"
            v-model="password"
            @keyup.enter="login"
          />
        </div>

        <div class="tw-flex tw-flex-col tw-justify-between tw-items-center sm:tw-flex-row">
          <label class="tw-label tw-cursor-pointer">
            <input
              type="checkbox"
              class="tw-checkbox tw-checkbox-primary tw-mr-2"
              :class="{
                'tw-border-primary': rememberMe,
                'tw-border-gray-300': !rememberMe
              }"
              v-model="rememberMe"
              name="remember-me"
            />
            <span class="tw-label-text tw-text-gray-600">Remember me</span>
          </label>

          <button
            class="tw-bg-primary tw-px-3 tw-py-2 tw-border-0 tw-text-white tw-rounded-xl tw-w-full tw-flex tw-justify-center tw-items-center sm:tw-w-max"
            :class="{
              'tw-opacity-80 tw-h-10 tw-pointer-events-none': loading
            }"
            :disabled="loading"
            @click="login"
          >
            <p v-if="!loading" class="tw-mb-0">Login</p>
            <LoadingIcon
              v-else
              class="tw-w-4 tw-h-4 tw-animate-spin dark:tw-text-gray-200 tw-fill-white"
            />
          </button>
        </div>
      </div>
      <p class="tw-text-gray-600 tw-text-center tw-text-sm">
        v{{ $options.version }}-{{ $options.commitSha }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { LoadingIcon } from '@/components/icons'
import { useAuthentication } from '@/stores/authentication'
import { mapActions } from 'pinia'
import { AUTHENTICATED } from '@/events/events'
import { toast } from 'vue3-toastify'

const EMAIL = import.meta.env.VITE_LOGIN_EMAIL ?? ''
const PASSWORD = import.meta.env.VITE_LOGIN_PASSWORD ?? ''

export default {
  components: {
    LoadingIcon
  },
  data() {
    return {
      email: EMAIL,
      password: PASSWORD,
      error: null,
      loading: false,
      rememberMe: false
    }
  },

  methods: {
    ...mapActions(useAuthentication, ['authenticate']),

    async login() {
      if (!this.email) {
        toast.warning('Email is required')
        return
      }

      if (!this.password) {
        toast.warning('Password is required')
        return
      }

      this.loading = true

      try {
        await this.authenticate(this.email, this.password)
        /**
         * authenticated event will be observed by Order plugin to load
         * active orders data from specific location
         *
         */
        window.dispatchEvent(new Event(AUTHENTICATED))
        this.$router.push({ name: 'home' }).catch((e) => console.warn(e.message))
      } catch (e) {
        toast.warning(e)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
