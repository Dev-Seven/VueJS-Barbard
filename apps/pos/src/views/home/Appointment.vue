<template>
  <div class="appointment-view tw-pb-4 tw-h-full">
    <div class="appointment-view__top tw-flex tw-justify-end">
      <div class="close-action text-primary font-weight-bold">
        <CloseIcon class="close-btn tw-text-secondary" @click="$router.replace({ name: 'home' })" />
      </div>
    </div>

    <div
      class="appointment-view__customer tw-border tw-border-gray-300 tw-rounded-lg tw-bg-white tw-px-3 tw-pt-4 tw-pb-0 tw-flex tw-flex-col tw-gap-2"
    >
      <div
        class="tw-h-24 tw-w-24 tw-bg-info tw-text-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-shrink-0"
      >
        {{ getInitials(customer.fullName) }}
      </div>
      <h4 class="tw-text-2xl tw-font-bold">{{ customer.fullName }}</h4>
      <div class="tw-flex tw-flex-wrap tw-gap-1">
        <div v-if="event.event?.memberGroup" class="tw-badge tw-badge-primary">
          {{ event.event.memberGroup }}
        </div>
        <div
          v-for="(tag, index) in event.event?.userPersona"
          :key="index"
          class="tw-badge tw-badge-secondary"
        >
          {{ tag }}
        </div>
        <div
          v-for="(tag, index) in event.event?.userTags"
          :key="index"
          class="tw-badge tw-badge-primary"
        >
          {{ tag }}
        </div>
      </div>
      <div>
        <div class="tw-flex tw-items-center tw-mb-2" v-if="customer.phone">
          <PhoneIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-text-gray-500" />
          <p class="tw-mb-0 tw-text-sm">{{ customer.phone }}</p>
        </div>
        <div class="tw-flex tw-items-center tw-mb-2" v-if="customer.email">
          <EnvelopIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-text-gray-500" />
          <p class="tw-mb-0 tw-text-sm">{{ customer.email }}</p>
        </div>
        <div class="tw-flex tw-items-center tw-mb-2" v-if="customer.birthday">
          <StarIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-text-gray-500" />
          <p class="tw-mb-0 tw-text-sm">{{ getCustomerBirthDate }}</p>
        </div>
        <div class="tw-flex tw-items-center tw-mb-2" v-if="customer.location">
          <GeoIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-text-gray-500" />
          <p class="tw-mb-0 tw-text-sm">{{ customer.location }}</p>
        </div>
        <div class="tw-flex tw-items-center tw-mb-2" v-if="customer.company">
          <DashBagIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-text-gray-500" />
          <p class="tw-mb-0 tw-text-sm">{{ customer.company }}</p>
        </div>
      </div>

      <div class="tw-flex tw-items-center tw-justify-around tw-border-y">
        <div class="tw-flex tw-items-center">
          <CalendarWeekIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-text-gray-500" />
          <p class="tw-mb-0 tw-text-sm tw-font-600">
            {{ customer?.barbershop?.totalAppointments }}
          </p>
        </div>
        <div class="tw-flex tw-items-center">
          <ThumbsUpIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-text-gray-500" />
          <p class="tw-mb-0 tw-text-sm tw-font-600">
            {{ customer?.barbershop?.appointmentsOnTime }}
          </p>
        </div>
        <div class="tw-flex tw-items-center">
          <ClockIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-text-gray-500" />
          <p class="tw-mb-0 tw-text-sm tw-font-600">
            {{ customer?.barbershop?.appointmentsLate }}
          </p>
        </div>
        <div class="tw-flex tw-items-center">
          <ThumbsUpIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-text-gray-500 tw-transform tw-rotate-180" />
          <p class="tw-mb-0 tw-text-sm tw-font-600">
            {{ customer?.barbershop?.totalNoShows }}
          </p>
        </div>
      </div>

      <h6 v-if="agreements.length" class="tw-text-nowrap tw-mt-4 tw-mb-2">Agreements</h6>
      <div v-if="agreements.length" class="agreement-list">
        <div
          class="tw-p-3 tw-border tw-gray-300 tw-rounded-lg tw-bg-white tw-mb-2"
          v-for="(agreement, aId) in agreements"
          :key="`${aId}-${agreement._id}`"
        >
          <div class="detail">
            <h6 v-if="agreement.type === 'king'" class="tw-mb-1 tw-font-bold">kings</h6>
            <h6 v-else-if="agreement.type === 'service'" class="tw-mb-1 tw-font-bold">
              {{ agreement.services[0].name }}
            </h6>
            <h6 v-else class="tw-mb-1 tw-font-bold">
              {{ agreement.type }}
            </h6>

            <p class="tw-text-gray-500 tw-text-sm tw-mb-0">
              Purchased: {{ getAgreementDate(agreement.purchasedAt) }}
            </p>
            <p class="tw-mb-0" v-if="agreement.type === 'service'">
              <small v-if="agreement.left">{{ agreement.left }} left</small>
            </p>
            <p class="tw-mb-0" v-else-if="agreement.type === 'king'">
              <small>{{ daysLeft(agreement) }} days left</small>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="appointment-view__service tw-border tw-border-gray-300 tw-rounded-lg tw-bg-white tw-p-4"
    >
      <div class="tw-flex tw-items-start tw-justify-between">
        <h4 class="tw-text-2xl tw-font-bold tw-mb-0 tw-mr-4">
          {{ combinedServiceName }}
        </h4>
        <p class="tw-mb-0 tw-text-nowrap tw-flex tw-items-center">
          <ClockIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-text-gray-500" />
          {{ getStartDate }}
        </p>
      </div>
      <p class="tw-mb-0 tw-text-sm">
        {{ combinedStaffName }}
      </p>
      <p class="tw-text-sm tw-mb-0">
        {{ `${getTotalDuration} - ${numberWithCommas(round(getTotalPrice))} vnd` }}
      </p>

      <div class="tw-flex tw-mt-2" v-if="event.event.upgrades && event.event.upgrades.length">
        <div
          class="product-card tw-flex tw-flex-col tw-justify-center tw-mr-2"
          style="max-width: 10rem"
          v-for="upgrade in event.event.upgrades"
          :key="upgrade.id"
        >
          <img src="~@/assets/placeholder.png" alt="product" />
          <div class="tw-text-left tw-p-2 tw-truncate">
            <small class="title m-0"
              ><b>{{ upgrade.name }}</b></small
            >
          </div>
        </div>
      </div>

      <div v-if="event.event.internalNote" class="tw-alert tw-alert-warning tw-mt-2" role="alert">
        <div class="tw-flex tw-items-center">
          <WarningIcon class="tw-w-4 tw-h-4 tw-mr-2" />
          <p class="tw-mb-0">{{ event.event.internalNote }}</p>
        </div>
      </div>
    </div>

    <div class="appointment-view__previous-appointments">
      <h6 class="tw-mt-3 tw-mb-1">
        Previous appointments <small>({{ previousAppointments.length }})</small>
      </h6>
      <div class="previous-appointments">
        <div v-if="loading" class="appointment-card--loading tw-rounded-lg tw-my-2"></div>
        <div
          v-else
          class="appointment-card tw-border tw-border-gray-300 tw-bg-white tw-rounded-lg tw-p-3 tw-my-2"
          v-for="(a, i) in previousAppointments"
          :key="`old-${i}`"
        >
          <div v-for="service in a.services" :key="service.id" class="appointment-services tw-mb-2">
            <div class="tw-flex tw-items-center tw-w-full">
              <p class="tw-mb-0 tw-text-xs tw-whitespace-nowrap tw-mr-4">
                {{ moment(a.startDate.seconds * 1000).format('MMMM Do YYYY, h:mm:ss a') }}
              </p>

              <div
                v-if="a.status === 'arrived-on-time'"
                class="tw-font-bold tw-badge tw-badge-success tw-shrink-0 sm:tw-ml-auto"
              >
                Arrived on time
              </div>
              <div
                v-else-if="a.status === 'arrived-late'"
                class="tw-font-bold tw-badge tw-badge-warning tw-shrink-0 sm:tw-ml-auto"
              >
                Arrived late
              </div>
              <div
                v-else-if="a.status === 'no-show'"
                class="tw-font-bold tw-badge tw-badge-error tw-shrink-0 sm:tw-ml-auto"
              >
                No show
              </div>
              <div
                v-else-if="a.status === 'cancelled'"
                class="tw-font-bold tw-badge tw-badge-secondary tw-shrink-0 sm:tw-ml-auto"
              >
                Cancelled
              </div>
              <div
                v-else-if="a.status === 'approved'"
                class="tw-font-bold tw-badge tw-badge-primary tw-shrink-0 sm:tw-ml-auto"
              >
                Approved
              </div>
            </div>
            <h6 class="tw-mb-0 tw-font-bold">{{ service.name }}</h6>

            <p class="tw-mb-0 tw-text-sm">
              {{ service.staff }}
            </p>
          </div>
          <p v-if="a.internalNote" class="tw-mx-2 tw-mb-2 tw-text-sm">
            <b>Note: </b>{{ a.internalNote }}
          </p>
          <div class="appointment-consumptions">
            <div>
              <img src="~@/assets/placeholder.png" alt="product" />
              <div class="tw-mt-1 title tw-text-sm">Heineken</div>
            </div>
            <div>
              <img src="~@/assets/placeholder.png" alt="product" />
              <div class="tw-mt-1 title tw-text-sm">Mini Pizza</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="shouldShowActionPanel"
      class="appointment-view__buttons tw-flex tw-flex-col lg:tw-flex-row"
    >
      <button
        class="tw-btn tw-btn-primary tw-text-white tw-font-normal tw-btn-block tw-shrink"
        @click="createOrderFromEvent('arrived-on-time')"
      >
        <ThumbsUpFillIcon class="tw-w-4 tw-h-4 tw-mr-2" />
        <p class="tw-mb-0">arrived on time</p>
      </button>

      <button
        class="tw-btn tw-btn-warning tw-text-white tw-font-normal tw-btn-block tw-shrink"
        @click="createOrderFromEvent('arrived-late')"
      >
        <ClockFillIcon class="tw-w-4 tw-h-4 tw-mr-2" />
        <p class="tw-mb-0">Arrived late</p>
      </button>
      <button
        class="tw-btn tw-btn-secondary tw-text-white tw-font-normal tw-btn-block tw-shrink"
        @click="noShow"
      >
        <ThumbsUpFillIcon class="tw-w-4 tw-h-4 tw-mr-2 tw-transform tw-rotate-180" />
        <p class="tw-mb-0">No-show</p>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
getInitials
import {
  PhoneIcon,
  EnvelopIcon,
  StarIcon,
  GeoIcon,
  DashBagIcon,
  ThumbsUpFillIcon,
  ClockFillIcon,
  ClockIcon,
  CalendarWeekIcon,
  ThumbsUpIcon,
  WarningIcon,
  CloseIcon
} from '@/components/icons'

import { sumBy, round } from 'lodash'
import momentDurationFormatSetup from 'moment-duration-format'
momentDurationFormatSetup(moment)
import db from '@/config/firebase/database'
import { getInitials, numberWithCommas } from '@/utilities/utility'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { useApp } from '@/stores/app'
import { mapActions, mapState } from 'pinia'
import { useEvents } from '@/stores/events'
import { useSale } from '@/stores/sale/sale'
import { useRegister } from '@/stores/register'

export default {
  name: 'AppointmentView',
  components: {
    PhoneIcon,
    EnvelopIcon,
    StarIcon,
    GeoIcon,
    DashBagIcon,
    ThumbsUpFillIcon,
    ClockFillIcon,
    ClockIcon,
    CalendarWeekIcon,
    ThumbsUpIcon,
    WarningIcon,
    CloseIcon
  },
  data() {
    return {
      loading: true,
      previousAppointments: [] as Array<any>,
      customer: {} as any,
      agreements: [] as Array<any>
    }
  },

  computed: {
    ...mapState(useEvents, ['event', 'events']),
    ...mapState(useRegister, ['location']),

    combinedServiceName(): string {
      return this.event.event.services?.map((s) => s.name).join(', ') || ''
    },

    combinedStaffName(): string {
      return this.event.event.services?.map((s) => s.staff).join(', ') || ''
    },

    shouldShowActionPanel(): boolean {
      return this.event.config?.showActions || false
    },

    getDayDifference: function () {
      return (t2: any) => {
        let t1 = new Date()
        let diffTime = Math.abs(t1.getTime() - t2.toMillis())
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
      }
    },

    getTotalPrice: function (): number {
      let totalPrice = sumBy(this.event.event.services, (item: any) => Number(item.price))
      return totalPrice
    },

    getTotalDuration: function (): String {
      return moment
        .duration(
          sumBy(this.event.event.services, (item: any) => Number(item.duration)),
          'seconds'
        )
        .format('h [hours] [and] m [min]')
    },

    getStartDate: function (): any {
      return moment(this.event.event.startDate.toDate()).format('hh:mm')
    },

    getAgreementDate: function (): any {
      return (value: any) => (value ? moment(value.toDate()).format('DD/MM/YYYY') : 'unknown')
    },

    getEndDate: function (): any {
      return moment(this.event.event.startDate.toDate())
        .add(
          moment.duration(
            sumBy(this.event.event.services, (item: any) => Number(item.duration)),
            'minutes'
          )
        )
        .format('hh:mm')
    },

    getCustomerBirthDate: function (): any {
      return this.customer.birthday
        ? moment(this.customer.birthday.toDate()).format('DD-MM-YYYY')
        : ''
    }
  },

  methods: {
    moment,
    round,
    getInitials,
    numberWithCommas,

    ...mapActions(useApp, ['setNavbarOption']),
    ...mapActions(useEvents, ['setEventStatus']),
    ...mapActions(useSale, ['fromAppointment']),

    daysLeft(agreement: any) {
      return moment.unix(agreement.expiryDate.seconds).diff(new Date(), 'days')
    },

    async createOrderFromEvent(status: string) {
      try {
        const order = await this.fromAppointment(this.customer, this.event.event, status)
        this.$router.replace({
          name: 'sale',
          params: { orderId: order.orderId }
        })
      } catch (e) {
        console.log(e)
      }
    },

    async noShow() {
      await this.setEventStatus({
        location: this.location,
        _id: this.event.event._id,
        status: 'no-show',
        userId: this.event.event.userId
      })
      this.$router.replace({ name: 'home' })
    },

    async hydrate() {
      this.loading = true
      const previousAppointments = []
      const agreements = []

      const docRef = doc(db, `users/${this.event.event.userId}`)
      const userSnapshot = await getDoc(docRef)
      const customer = { _id: userSnapshot.id, ...userSnapshot.data() }

      const q = query(
        collection(db, `agreements`),
        where(`userMap.${this.event.event.userId}`, '==', true)
      )
      const snapshot = await getDocs(q)

      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data?.active) {
          agreements.push({
            _id: doc.id,
            ...data
          })
        }
      })

      const eventsQuery = query(
        collection(db, `locations/${this.location}/events`),
        where('userId', '==', `${this.event.event.userId}`)
      )
      const querySnapshot = await getDocs(eventsQuery)
      querySnapshot.forEach((doc) => {
        previousAppointments.push({ _id: doc.id, ...doc.data() })
      })
      this.loading = false

      this.previousAppointments = previousAppointments
      this.customer = customer
      this.agreements = agreements
    }
  },

  watch: {
    '$route.params.id': {
      handler: function () {
        this.hydrate()
      },
      deep: true,
      immediate: true
    }
  },

  async created() {
    this.hydrate()
  }
}
</script>

<style lang="scss" scoped>
.appointment-view {
  @apply tw-flex tw-flex-col tw-gap-4;

  @screen lg {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 32px 1fr minmax(10vh, 60vh) 50px;
  }

  &__top {
    grid-column: 1 / -1;
    grid-row: 1 / 2;
  }

  &__customer {
    grid-column: 1 / 2;
    grid-row: 2 / 4;

    display: flex;
    flex-direction: column;

    .b-avatar {
      margin: 0 auto 1.5rem;
    }
  }

  &__buttons {
    grid-column: 1 / -1;
    gap: 1rem;

    .btn-block + .btn-block {
      margin-top: 0;
    }
  }

  &__service {
    grid-column: 2 / 4;
    grid-row: 2 / 3;
  }

  &__previous-appointments {
    grid-column: 2 / 4;
    grid-row: 3 / 4;
  }
}
.previous-appointments {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100% - 38px);
}

.appointment-card {
  position: relative;
  img {
    max-width: 100%;
  }

  &--loading {
    background: #eee;
    min-height: 200px;
  }
}

.appointment-consumptions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 8px;
}
.agreement-list {
  overflow-y: auto;
  overflow-x: hidden;
}
.is-loading {
  height: 100%;
  width: 100%;
  border-radius: 10px;
  background-color: #ddd;
}

.b-avatar {
  background: #ddd;
}
</style>
@/components/icons
