<template>
  <div class="lg:tw-w-1/2 tw-text-left tw-m-auto">
    <h3
      class="tw-font-bold tw-text-gray-600 tw-border-b tw-border-primary tw-pb-2 tw-mb-6 tw-w-max"
    >
      Open Register
    </h3>
    <div
      class="tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-lg tw-p-4 tw-bg-white tw-flex tw-flex-col tw-gap-4"
    >
      <div class="tw-flex tw-flex-col">
        <p class="tw-font-bold tw-underline tw-decoration-primary tw-underline-offset-8 tw-mb-4">
          Opening Float
        </p>
        <input
          v-model.number="openingFloat"
          type="number"
          pattern="[0-9]*"
          class="tw-input tw-w-full tw-px-3 tw-border tw-border-gray-300 focus:tw-outline-none"
          placeholder="Enter Amount"
        />
      </div>

      <div class="tw-flex tw-flex-col">
        <label class="tw-mb-2">Opened By</label>
        <select v-model="staff" class="tw-select tw-border tw-border-gray-300">
          <option v-for="member in staffMembers" :key="member._id" :value="member._id">
            {{ member.name }}
          </option>
        </select>
      </div>

      <div class="tw-flex tw-flex-col">
        <p class="tw-font-bold tw-underline tw-decoration-primary tw-underline-offset-8 tw-mb-4">
          Note
        </p>
        <textarea
          id="addNote"
          class="tw-textarea tw-border tw-border-gray-300 tw-w-full"
          rows="4"
          placeholder="Add register opening note"
          v-model="openingNote"
          style="resize: none"
        >
        </textarea>
      </div>

      <button class="tw-btn tw-btn-primary tw-text-white tw-font-normal" @click="OpenRegister">
        Open Register
      </button>

      <div class="tw-flex tw-flex-col">
        <div class="tw-flex tw-gap-4">
          <p class="tw-font-bold tw-mb-0">Outlet:</p>
          <p class="tw-text-gray-500 tw-mb-0">{{ outlet }}</p>
        </div>

        <div class="tw-flex tw-gap-4">
          <p class="tw-font-bold tw-mb-0">Opening #:</p>
          <p class="tw-text-gray-500 tw-mb-0">{{ code }}</p>
        </div>

        <div class="tw-flex tw-gap-4">
          <p class="tw-font-bold tw-mb-0">Opening Time:</p>
          <p class="tw-text-gray-500 tw-mb-0">
            {{ new Date().toLocaleDateString() }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { toast } from 'vue3-toastify'
import { find } from 'lodash'
import { useRegister } from '@/stores/register'
import { useAuthentication, type UserType } from '@/stores/authentication'
import { useStaff } from '@/stores/staff'
import { useApp } from '@/stores/app'
import { REGISTER_OPENED } from '@/events/events'

export default {
  name: 'OpenRegister',

  async created() {
    this.setNavbarOption('noOptionNavbar')
    this.staff = this.active._id
    this.staffMembers = await this.fetchAllStaffMembers()
  },

  data() {
    return {
      openingFloat: 0,
      openingNote: '',
      code: '',
      staff: '',
      staffMembers: [] as Array<UserType>
    }
  },

  computed: {
    ...mapState(useRegister, ['outlet']),
    ...mapState(useAuthentication, ['user']),
    ...mapState(useStaff, ['active'])
  },

  methods: {
    ...mapActions(useApp, ['setNavbarOption']),
    ...mapActions(useRegister, ['create', 'getLatestRegisterCode']),
    ...mapActions(useStaff, ['setActive', 'fetchAllStaffMembers']),

    async OpenRegister() {
      try {
        const staff = find(this.staffMembers, (m) => m._id === this.staff)
        if (staff) {
          this.setActive(staff)
        }

        this.openingFloat ??= 0
        const cashManagement = this.openingFloat
          ? [
              {
                staffId: staff._id,
                staffName: staff?.fullName,
                amount: this.openingFloat,
                [this.openingFloat > 0 ? 'credit' : 'debit']: this.openingFloat,
                reason: 'Opening Float',
                type: 'add'
              }
            ]
          : []

        await this.create({
          code: this.code,
          openingNote: this.openingNote,
          cashManagement
        })

        window.dispatchEvent(new Event(REGISTER_OPENED))
        this.$router.push({ name: 'home' })
      } catch (e) {
        console.log(`Register:: could not be opened ${e.message}`)

        toast('Failed to Create new Register, please try again', {
          type: toast.TYPE.ERROR,
          transition: toast.TRANSITIONS.SLIDE,
          theme: toast.THEME.LIGHT,
          position: toast.POSITION.BOTTOM_LEFT
        })
      }
    }
  },
  async mounted() {
    this.code = await this.getLatestRegisterCode()
  }
}
</script>

<style></style>
