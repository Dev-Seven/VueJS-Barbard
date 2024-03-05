<template>
  <div class="lg:tw-w-1/2 tw-text-left tw-m-auto">
    <h3
      class="tw-font-bold tw-text-gray-600 tw-border-b tw-border-primary tw-pb-2 tw-mb-6 tw-w-max"
    >
      Open Register
    </h3>
    <div
      class="tw-p-4 tw-bg-white tw-rounded-lg tw-border tw-border-gray-300 tw-shadow-lg tw-flex tw-flex-col tw-gap-4"
    >
      <p v-if="error" class="tw-text-error tw-mb-0">
        {{ error }}
      </p>

      <div class="tw-flex tw-flex-col tw-gap-4 lg:tw-flex-row">
        <div class="tw-flex tw-flex-col tw-w-full">
          <label class="tw-mb-2">Location:</label>
          <select v-model="location" class="tw-select tw-border tw-border-gray-300">
            <option v-for="alocation in allowedLocations" :key="alocation" :value="alocation._id">
              {{ alocation.name }}
            </option>
          </select>
        </div>

        <div class="tw-flex tw-flex-col tw-w-full">
          <label class="tw-mb-2">Register:</label>
          <select v-model="outlet" class="tw-select tw-border tw-border-gray-300">
            <option v-for="optionOutlet in outlets" :key="optionOutlet" :value="optionOutlet.value">
              {{ optionOutlet.text }}
            </option>
          </select>
        </div>
      </div>

      <div class="tw-flex tw-flex-col tw-w-full">
        <label class="tw-mb-2">Opened By</label>
        <select v-model="staff" class="tw-select tw-border tw-border-gray-300">
          <option v-for="member in allowedStaffMembers" :key="member._id" :value="member._id">
            {{ member.name }}
          </option>
        </select>
      </div>

      <div class="tw-flex tw-justify-end">
        <button
          class="tw-bg-primary tw-px-3 tw-py-2 tw-border-0 tw-text-white tw-rounded-xl tw-w-full tw-flex tw-items-center tw-justify-center sm:tw-w-max"
          :class="{
            'tw-opacity-80 tw-h-10 tw-pointer-events-none': loading
          }"
          :disabled="loading"
          @click="createNewRegister"
        >
          <p v-if="!loading" class="tw-mb-0">Open register</p>
          <LoadingIcon
            v-else
            class="tw-w-4 tw-h-4 tw-animate-spin dark:tw-text-gray-200 tw-fill-white"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { capitalize, find, has } from 'lodash'
import { LoadingIcon } from '@/components/icons'
import { mapState, mapActions } from 'pinia'
import { useAuthentication } from '@/stores/authentication'
import { useApp } from '@/stores/app'
import { useRegister } from '@/stores/register'
import { useStaff } from '@/stores/staff'
import { REGISTER_OPENED } from '@/events/events'

export default {
  components: { LoadingIcon },
  async created() {
    this.setNavbarOption('noOptionNavbar')
    this.staffMembers = await this.fetchAllStaffMembers()
  },

  async mounted() {
    this.location = this.allowedLocations[0]?._id
    this.outlet = this.allowedLocations[0]?.outlets[0]
    this.outlets = this.allowedLocations[0].outlets.map((value) => ({
      text: capitalize(value),
      value
    }))
  },

  data() {
    return {
      error: '',
      loading: false,
      location: '',
      outlet: '',
      outlets: [],
      staff: '',
      staffMembers: [] as Array<any>
    }
  },

  computed: {
    ...mapState(useAuthentication, ['user']),
    ...mapState(useApp, ['locations']),

    allowedLocations(): Array<any> {
      return this.locations.filter((location: any) => this.user.locations.includes(location._id))
    },

    allowedStaffMembers() {
      return this.staffMembers.filter(
        (m: any) => has(m, 'locations') && m.locations.includes(this.location)
      )
    }
  },

  methods: {
    ...mapActions(useApp, ['setNavbarOption']),
    ...mapActions(useRegister, ['initRegister']),
    ...mapActions(useStaff, ['fetchAllStaffMembers', 'setActive']),

    async createNewRegister() {
      this.loading = true
      this.error = !this.location || !this.outlet || !this.staff ? 'Please fill all fields!' : ''

      const staff = find(this.staffMembers, (m) => m._id === this.staff)
      if (staff) {
        this.setActive(staff)
      }

      if (!this.error) {
        try {
          const hasOpenedExisting = await this.initRegister(
            this.location,
            this.outlet,
            this.outlets
          )

          if (hasOpenedExisting) {
            window.dispatchEvent(new Event(REGISTER_OPENED))
          }

          this.$router.push(
            hasOpenedExisting
              ? { name: 'home' }
              : {
                  name: 'register.create',
                  params: {
                    staffMembers: this.staffMembers
                  }
                }
          )
        } catch (e) {
          console.log(e)
        }
      }

      this.loading = false
    },

    setLocationInfo(location) {
      this.locationId = location.id
      this.outlet = location.outlets[0]
      const outlets = location.outlets.map((value) => ({
        text: capitalize(value),
        value
      }))
      this.outlets = outlets
    }
  },

  watch: {
    location(id) {
      const l = find(this.locations, (location) => location._id === id)

      if (!l) {
        console.log(`Location: no location found with id ${id}`)
        return
      }

      this.outlet = l.outlets[0]
      this.outlets = l.outlets.map((value) => ({
        text: capitalize(value),
        value
      }))
      this.setLocationInfo(l)
    },
    locations() {
      if (this.location) return

      this.location = this.locations[0]._id
    }
  }
}
</script>
