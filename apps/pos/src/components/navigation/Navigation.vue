<template>
  <div
    class="tw-relative tw-bg-primary tw-w-full tw-flex tw-items-start tw-py-3 tw-px-4 tw-transition tw-duration-100 lg:tw-items-center"
  >
    <div class="tw-container tw-flex tw-flex-col tw-gap-4">
      <MenuIcon
        class="tw-w-8 tw-h-8 tw-text-white lg:tw-hidden"
        @click="isMenuExpanded = !isMenuExpanded"
      />

      <div
        class="tw-bg-primary tw-absolute tw-top-12 tw-left-0 tw-z-10 tw-w-full tw-flex tw-flex-col tw-gap-4 tw-transition tw-duration-100 tw-origin-top tw-py-3 tw-px-4 lg:tw-flex-row lg:tw-items-center lg:tw-relative lg:tw-top-0 lg:tw-py-0 lg:tw-px-0"
        :class="{
          'tw-scale-y-0 lg:tw-scale-y-100': !isMenuExpanded
        }"
      >
        <div class="tw-flex tw-flex-col tw-gap-4 lg:tw-flex-row lg:tw-items-center">
          <slot :isMenuExpanded="isMenuExpanded">
            <router-link
              v-for="route in routes"
              class="tw-text-white tw-underline-offset-8 tw-decoration-warning hover:tw-opacity-80 hover:tw-text-gray-100 hover:tw-no-underline"
              exact-active-class="tw-underline tw-pointer-events-none"
              :key="route.title"
              :to="route.to"
              @click="isMenuExpanded = false"
            >
              {{ route.title }}
            </router-link>
          </slot>
        </div>

        <div class="tw-flex tw-items-center tw-text-white lg:tw-ml-auto">
          <Avatar
            class="tw-mr-4"
            :name="active.name"
            :image="active.image"
            @click="isStaffModalShown = true"
          />
          <CircledUserIcon class="tw-w-8 tw-h-8 tw-mr-2" />
          <div class="tw-flex tw-flex-col tw-text-white tw-mr-4">
            <p class="tw-font-bold tw-mb-0">{{ user.name }}</p>
            <p
              class="tw-text-sm tw-mb-0 tw-cursor-pointer hover:opacity-80"
              @click="isUserModalShown = true"
            >
              Switch Account
            </p>
          </div>

          <div v-if="!isEmpty(user) && user.roles.includes('pos.admin')" class="tw-relative">
            <CogIcon
              class="tw-w-6 tw-h-6 tw-text-white tw-cursor-pointer hover:opacity-80"
              @click="isUpdateMenuShown = !isUpdateMenuShown"
            />

            <div
              v-if="isUpdateMenuShown"
              class="tw-bg-white tw-text-black tw-absolute tw-top-8 tw-right-0 tw-z-10 tw-rounded-lg tw-p-2 tw-w-max tw-flex tw-flex-col"
            >
              <div
                class="tw-px-2 tw-py-1 tw-rounded-lg tw-cursor-pointer hover:tw-bg-secondary hover:tw-bg-opacity-10"
                @click="updateMarketman"
              >
                Update from Marketman
              </div>
              <div
                class="tw-px-2 tw-py-1 tw-rounded-lg tw-cursor-pointer hover:tw-bg-secondary hover:tw-bg-opacity-10"
                @click="updateNhanh"
              >
                Update from Nhanh
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal v-model:isShown="isUserModalShown" max-width-class="tw-max-w-screen-sm">
      <div
        class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
      >
        <h6 class="tw-mb-0">Switch User</h6>

        <CloseIcon class="tw-w-4 tw-h-4" @click="isUserModalShown = false" />
      </div>

      <div
        class="tw-flex tw-justify-between tw-px-6 tw-py-4 tw-cursor-pointer hover:tw-bg-gray-100"
        @click="userLogout"
      >
        <p class="tw-font-medium tw-mb-0">Logout</p>
        <PowerIcon class="tw-w-4 tw-h-4" />
      </div>
    </Modal>

    <Modal v-model:isShown="isStaffModalShown" max-width-class="tw-max-w-screen-sm">
      <div
        class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
      >
        <h6 class="tw-mb-0">Switch General Sales Person</h6>

        <CloseIcon class="tw-w-4 tw-h-4" @click="isStaffModalShown = false" />
      </div>

      <div class="tw-max-h-96 tw-overflow-y-scroll">
        <div
          v-for="staff in staff"
          :key="staff._id"
          class="tw-flex tw-items-center tw-px-6 tw-py-4 tw-gap-4 tw-cursor-pointer hover:tw-bg-gray-100"
          :class="{
            'tw-bg-primary tw-text-white tw-pointer-events-none': active._id == staff._id
          }"
          @click="setActive(staff), (isStaffModalShown = false)"
        >
          <Avatar
            :name="staff.name"
            :image="staff.image"
            :variant="active._id != staff._id ? 'primary' : undefined"
          />
          <div class="tw-flex tw-flex-col">
            <p class="tw-font-medium tw-mb-0">{{ staff.name }}</p>
            <p class="tw-text-sm tw-mb-0">{{ staff.email }}</p>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { CloseIcon, CircledUserIcon, CogIcon, PowerIcon, MenuIcon } from '@/components/icons'
import { isEmpty } from 'lodash'
import { mapActions, mapState } from 'pinia'
import { getInitials } from '@/utilities/utility'
import Modal from '../common/Modal.vue'
import Avatar from '../common/Avatar.vue'
import axios from 'axios'
import { useAuthentication } from '../../stores/authentication'
import { useStaff } from '../../stores/staff'
import { useRegister } from '../../stores/register'

export default {
  name: 'Navigation',
  props: {
    routes: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  components: {
    CloseIcon,
    CircledUserIcon,
    CogIcon,
    PowerIcon,
    MenuIcon,
    Modal,
    Avatar
  },

  data() {
    return {
      isUserModalShown: false,
      isStaffModalShown: false,
      isMenuExpanded: false,
      isUpdateMenuShown: false
    }
  },

  computed: {
    ...mapState(useAuthentication, ['user']),
    ...mapState(useStaff, ['active', 'staff'])
  },

  methods: {
    getInitials,
    isEmpty,

    ...mapActions(useAuthentication, ['logout']),
    ...mapActions(useRegister, ['reset']),
    ...mapActions(useStaff, ['setActive']),

    async userLogout() {
      this.isUserModalShown = false
      await this.logout()
      this.reset()
      this.$router.push('/auth/login')
    },

    updateMarketman() {
      axios
        .get(`${import.meta.env.VITE_MARKETMAN_PRODUCTS_API}`)
        .then((res) => {
          console.log(res)
        })
        .catch((error) => console.warn(error))

      this.isUpdateMenuShown = false
    },

    updateNhanh() {
      axios
        .get(`${import.meta.env.VITE_NHANH_PRODUCTS_API}`)
        .then((res) => {
          console.log(res)
        })
        .catch((error) => console.warn(error))

      this.isUpdateMenuShown = false
    }
  },

  watch: {
    route() {
      this.isMenuExpanded = false
    }
  }
}
</script>
