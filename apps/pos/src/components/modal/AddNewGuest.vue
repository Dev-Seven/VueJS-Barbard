<template>
  <Modal :isShown="isShown">
    <div
      class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300 tw-bg-white"
    >
      <h6 class="tw-mb-0">Add new guest</h6>
      <CloseIcon class="tw-w-4 tw-h-4" @click="$emit('update:isShown', false)" />
    </div>

    <div class="tw-p-6 tw-border-b tw-border-gray-300 tw-relative">
      <div v-if="creating" class="loading">
        <LoadingIcon class="tw-w-10 tw-h-10 tw-animate-spin dark:tw-text-gray-300 tw-fill-white" />
      </div>

      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-x-4 tw-gap-y-5 tw-mb-4">
        <div class="tw-w-full tw-flex tw-h-12">
          <div
            class="tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-rounded-l-lg tw-border tw-shrink-0 tw-flex tw-items-center"
            :class="{
              'tw-border-gray-300': !errors.firstName,
              'tw-border-error': !!errors.firstName
            }"
          >
            First Name
          </div>
          <input
            v-model="guest.firstName"
            class="tw-input tw-w-full tw-px-3 tw-rounded-l-none tw-rounded-r-lg tw-border-l-0 tw-border-r tw-border-y focus:tw-outline-none"
            :class="{
              'tw-border-gray-300': !errors.firstName,
              'tw-border-error': !!errors.firstName
            }"
            type="text"
            placeholder="Enter first name"
            required
          />
        </div>

        <div class="tw-w-full tw-flex tw-h-12">
          <div
            class="tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-rounded-l-lg tw-border tw-shrink-0 tw-flex tw-items-center"
            :class="{
              'tw-border-gray-300': !errors.lastName,
              'tw-border-error': !!errors.lastName
            }"
          >
            Last Name
          </div>
          <input
            v-model="guest.lastName"
            class="tw-input tw-w-full tw-px-3 tw-rounded-l-none tw-rounded-r-lg tw-border-l-0 tw-border-r tw-border-y focus:tw-outline-none"
            :class="{
              'tw-border-gray-300': !errors.lastName,
              'tw-border-error': !!errors.lastName
            }"
            type="text"
            placeholder="Enter last name"
            required
          />
        </div>

        <div class="tw-w-full tw-flex tw-h-12">
          <div
            class="tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-rounded-l-lg tw-border tw-shrink-0 tw-flex tw-items-center"
            :class="{
              'tw-border-gray-300': !errors.email,
              'tw-border-error': !!errors.email
            }"
          >
            Email
          </div>
          <input
            v-model="guest.email"
            class="tw-input tw-w-full tw-px-3 tw-rounded-l-none tw-rounded-r-lg tw-border-l-0 tw-border-r tw-border-y focus:tw-outline-none"
            :class="{
              'tw-border-gray-300': !errors.email,
              'tw-border-error': !!errors.email
            }"
            type="email"
            placeholder="Enter Email"
            required
          />
        </div>

        <div class="tw-w-full tw-flex tw-h-12">
          <div
            class="tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-rounded-l-lg tw-border tw-border-gray-300 tw-shrink-0 tw-flex tw-items-center"
          >
            Company
          </div>
          <input
            v-model="guest.company"
            class="tw-input tw-w-full tw-px-3 tw-rounded-l-none tw-rounded-r-lg tw-border-l-0 tw-border-r tw-border-y tw-border-gray-300 focus:tw-outline-none"
            type="text"
            placeholder="Enter company name"
            required
          />
        </div>

        <div class="tw-w-full tw-flex tw-flex-col">
          <div class="tw-w-full tw-flex tw-h-12">
            <div
              class="tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-rounded-l-lg tw-border tw-shrink-0 tw-flex tw-items-center"
              :class="{
                'tw-border-gray-300': !errors.phone,
                'tw-border-error': !!errors.phone
              }"
            >
              Phone
            </div>
            <vue-tel-input
              v-model="guest.phone"
              mode="international"
              class="tw-w-full"
              :class="{
                '!tw-border-error': !!errors.phone
              }"
            ></vue-tel-input>
          </div>
          <p v-if="errors.phone" class="tw-text-xs tw-text-error">
            {{ errors.phone }}
          </p>
        </div>

        <div class="tw-w-full tw-h-fit tw-flex">
          <div
            class="tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-shrink-0 tw-flex tw-items-center tw-rounded-l-lg tw-border tw-border-gray-300"
          >
            Nationality
          </div>
          <select
            class="tw-select tw-flex-shrink tw-w-full tw-px-3 tw-font-normal tw-text-base tw-rounded-l-none tw-rounded-r-lg tw-border-l-0 tw-border-r tw-border-y tw-border-gray-300 focus:tw-outline-none"
            v-model="guest.nationality"
          >
            <option disabled selected>Select your Nationality</option>
            <option v-for="nationality in nationalities" :key="nationality" :value="nationality">
              {{ nationality }}
            </option>
          </select>
        </div>

        <div class="tw-w-full tw-flex tw-h-12">
          <div
            class="tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-rounded-l-lg tw-border tw-border-gray-300 tw-shrink-0 tw-flex tw-items-center"
          >
            Birthdate
          </div>
          <input
            v-model="guest.birthday"
            class="tw-input tw-w-full tw-px-3 tw-rounded-l-none tw-rounded-r-lg tw-border-l-0 tw-border-r tw-border-y tw-border-gray-300 focus:tw-outline-none"
            type="text"
            placeholder="type in YYYY-MM-DD format"
          />
        </div>

        <div class="tw-w-full tw-flex tw-h-12">
          <div class="tw-relative tw-w-full">
            <input
              ref="search"
              id="search"
              type="text"
              class="tw-input tw-w-full tw-px-3 tw-rounded-r-none tw-rounded-l-lg tw-border-r-0 tw-border-l tw-border-y tw-border-gray-300 focus:tw-outline-none"
              placeholder="Search refferer..."
              autocomplete="false"
              @input="onSearch"
            />

            <div
              v-if="guestList.length != 0"
              class="tw-absolute tw-top-12 tw-left-0 tw-z-10 tw-h-max tw-max-h-96 tw-overflow-auto tw-w-full tw-bg-white tw-border tw-border-gray-300 tw-rounded-xl"
            >
              <div
                v-for="(user, index) in guestList"
                :key="index"
                class="tw-flex tw-items-center tw-px-4 tw-py-2 tw-border-b tw-border-gray-300 tw-cursor-pointer last:tw-border-none hover:tw-bg-gray-300"
                @click="setReferredBy(user)"
              >
                <div
                  class="tw-h-12 tw-w-10 tw-bg-primary tw-text-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-4"
                >
                  {{ getInitials(user.firstName + ' ' + user.lastName) }}
                </div>
                <div class="tw-flex tw-flex-col">
                  <p class="tw-text-nowrap tw-mb-0">
                    {{ user.firstName + ' ' + user.lastName }}
                  </p>
                  <p class="tw-text-secondary tw-text-nowrap tw-mb-0">
                    {{ user.email }}
                  </p>
                  <p class="tw-text-secondary tw-mb-0">{{ user.phone }}</p>
                </div>
              </div>
            </div>
          </div>
          <div
            class="tw-bg-[#e9ecef] tw-text-[#495057] tw-px-3 tw-py-2 tw-rounded-r-xl tw-border tw-border-gray-300 tw-shrink-0 tw-flex tw-items-center tw-justify-center tw-w-12 tw-cursor-pointer hover:tw-opacity-80"
            :class="{
              'tw-pointer-events-none tw-opacity-80': loading
            }"
            @click="onClearReferrer"
          >
            <LoadingIcon
              v-if="loading"
              class="tw-w-4 tw-h-4 tw-animate-spin dark:tw-text-secondary tw-fill-black"
            />
            <CloseIcon v-else class="tw-h-5 tw-w-5" />
          </div>
        </div>
      </div>

      <div
        v-if="!isEmpty(referrer)"
        class="tw-border tw-border-gray-300 tw-flex tw-justify-between tw-items-center tw-rounded-lg tw-px-2 tw-py-2 tw-bg-white"
      >
        <div class="tw-mr-2">
          <div
            class="tw-h-10 tw-w-10 tw-bg-primary tw-text-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shrink-0"
          >
            {{ getInitials(referrer?.fullName) }}
          </div>
        </div>
        <div class="tw-flex-1">
          <p class="tw-mb-0">{{ referrer.fullName }}</p>
        </div>
        <div>
          <TrashIcon
            class="tw-text-error tw-w-4 tw-h-4 tw-cursor-pointer hover:tw-opacity-80"
            @click="removeRefferBy"
          />
        </div>
      </div>
    </div>

    <div class="tw-p-6 tw-flex tw-justify-end tw-gap-4">
      <button class="tw-btn tw-btn-secondary tw-text-white tw-font-normal" @click="onCancel">
        Cancel
      </button>
      <button class="tw-btn tw-btn-primary tw-text-white tw-font-normal" @click="handleSubmit">
        Submit
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import database from '@/config/firebase/database'
import {
  setDoc,
  doc,
  collection,
  query,
  orderBy,
  startAt,
  endAt,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'
import { size, orderBy as _orderBy, isEmpty, debounce, capitalize } from 'lodash'
import { getInitials } from '@/utilities/utility'
import { VueTelInput } from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'
import axios from 'axios'
import { nationalities } from './constants'
import Modal from '@/components/common/Modal.vue'
import { LoadingIcon, CloseIcon, TrashIcon } from '@/components/icons'
import { toast, type ToastOptions } from 'vue3-toastify'

const GuestDetails = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  birthday: '',
  company: '',
  nationality: null
}

export default {
  name: 'add-new-guest',
  props: {
    id: [String],
    title: [String],
    isShown: [Boolean]
  },
  components: { VueTelInput, Modal, LoadingIcon, CloseIcon, TrashIcon },
  data() {
    return {
      creating: false,
      guest: { ...GuestDetails },
      code: '',
      referrer: {},
      search: '',
      guestList: [],
      loading: false,
      phoneError: '',
      errors: {
        phone: '',
        email: '',
        firstName: '',
        lastName: ''
      }
    }
  },

  computed: {
    nationalities() {
      return nationalities
    }
  },

  methods: {
    getInitials,
    isEmpty,
    onClearReferrer() {
      this.$refs.search.value = ''
      this.guestList = []
    },
    onSearch: debounce(async function (event) {
      const search = event.target.value

      const list: Array<any> = []

      if (size(search) >= 3 && search !== '') {
        this.loading = true
        const searchable: Array<string> = ['fullName', 'email', 'phone']
        const searchDataByFieldName = async () => {
          for (const field of searchable) {
            if (field !== 'phone' || size(search) > 5) {
              const q = query(
                collection(database, 'users'),
                orderBy(field),
                startAt(search.toLowerCase()),
                endAt(search.toLowerCase() + '\uf8ff')
              )
              const byField = await getDocs(q)

              byField.forEach((doc) => {
                list.push({ _id: doc.id, ...doc.data() })
              })
            }
          }
        }

        await searchDataByFieldName()
        let sortedList = _orderBy(
          list,
          [(user) => user.firstName?.toLowerCase(), (user) => user.lastName?.toLowerCase()],
          ['asc']
        )
        this.guestList = sortedList
      } else {
        this.guestList = []
      }
      this.loading = false
    }, 300),
    setReferredBy(user: any) {
      this.referrer = { ...user }
      this.onClearReferrer()
    },
    removeRefferBy() {
      this.referrer = {}
    },

    onCancel() {
      this.$emit('update:isShown', false)
    },

    async handleSubmit() {
      const guest = { ...this.guest }
      let error = false

      if (!guest.email) {
        this.errors.email = 'Email is required to add new guest.'
        error = true
      }

      if (!guest.phone) {
        this.errors.phone = 'Phone is required to add new guest.'
        error = true
      }

      if (!guest.firstName) {
        this.errors.firstName = 'Guest first name is required'
        error = true
      }

      if (!guest.lastName) {
        this.errors.lastName = 'Guest last name is required'
        error = true
      }

      if (error) {
        toast('Please fill the required fields to create new guest!', {
          type: toast.TYPE.WARNING,
          transition: toast.TRANSITIONS.SLIDE,
          theme: toast.THEME.LIGHT,
          position: toast.POSITION.BOTTOM_LEFT
        } as ToastOptions)
        return
      }
      this.creating = true

      const { firstName, lastName, phone, email, birthday } = this.guest

      const phoneFormat = phone.replace(/\s/g, '').trim()

      try {
        const { data } = await axios.post(import.meta.env.VITE_CREATE_GUEST_FN, {
          name: `${firstName} ${lastName}`,
          phone: phoneFormat,
          email
        })

        const guest = {
          ...this.guest,
          phone: phoneFormat,
          fullName: `${firstName} ${lastName}`,
          firstName,
          lastName,
          birthday: birthday ? new Date(birthday).toISOString().split('T')[0] : '',
          createdAt: serverTimestamp(),
          refferals: [],
          referredById: !isEmpty(this.referrer) ? this.referrer._id : '',
          referredByName: !isEmpty(this.referrer) ? this.referrer.fullName : '',
          referredRedeemed: !isEmpty(this.referrer),
          tags: ['new']
        }

        await setDoc(doc(database, 'users', data.uid), guest)

        this.guest = { ...GuestDetails }
        this.$emit('created', { _id: data.uid, ...data, ...guest })
        this.$emit('close')

        this.referrer = {}
      } catch (e) {
        const error = e.response.data
        switch (error.code) {
          case 'auth/phone-number-already-exists':
            this.errors.phone =
              'The phone number has already been used by another guest. Change the phone number or use the existing guest for the sale.'
            break
          case 'auth/email-already-in-use':
            this.errors.email =
              'The email has already been used by another guest. Change the email or use the existing guest for the sale.'
            break
          case 'auth/invalid-phone-number':
            this.errors.phone = `the phone number you enter is invalid: ${capitalize(
              error.message.toLowerCase()
            )}`
            break

          default:
            break
        }
        console.log('e', e)

        toast('Could not create user, Please try again later!', {
          type: toast.TYPE.ERROR,
          transition: toast.TRANSITIONS.SLIDE,
          theme: toast.THEME.LIGHT,
          position: toast.POSITION.BOTTOM_LEFT
        } as ToastOptions)
      }
      this.creating = false
    }
  }
}
</script>
<style lang="scss" scoped>
.spinning {
  margin-left: 3px;
  margin-right: 1px;
}
*::-webkit-scrollbar {
  width: 3px;
}

::-webkit-scrollbar-track {
  background: #f7f7f7;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.loading {
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
