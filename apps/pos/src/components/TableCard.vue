<template>
  <div
    class="tw-card tw-shadow-md tw-p-4 tw-border tw-border-[#dfdfdf] tw-h-full tw-min-h-[11rem] tw-cursor-pointer hover:tw-opacity-80"
    :class="{
      'tw-bg-warning tw-bg-opacity-50': shouldHighlight,
      'tw-bg-green-500 tw-bg-opacity-50': isChequeConfirmed,
      'tw-bg-white': !shouldHighlight && !isChequeConfirmed
    }"
    @click="$emit('open-sale', item)"
  >
    <div class="tw-flex tw-justify-between tw-items-start tw-gap-4 tw-mb-2">
      <div class="tw-flex tw-flex-col">
        <h5 class="tw-text-lg tw-font-semibold tw-uppercase tw-mb-1" v-html="title"></h5>
        <h6 class="tw-text-gray-500 tw-mb-0" v-if="item.salesCategory">
          {{ getSalesCategoryName(item.salesCategory) }}
        </h6>
      </div>
      <h6
        v-if="item.parkedSale"
        class="tw-text-sm tw-text-gray-500 tw-border tw-border-gray-300 tw-rounded-lg tw-py-1 tw-px-2 tw-font-bold"
      >
        {{ createdDate + ' ' + createdTime }}
      </h6>
      <template v-else>
        <div v-if="loading" class="tw-w-24 tw-h-5 tw-rounded-full shimmer tw-bg-gray-300"></div>

        <template v-else>
          <div
            v-if="isChequeConfirmed"
            class="tw-badge tw-bg-green-700 tw-border-none tw-text-white"
          >
            Cheque Confirmed
          </div>
          <div v-else class="tw-badge tw-badge-outline tw-flex-shrink-0" :class="style">
            <svg class="tw-h-3 tw-w-3 tw-mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 12v-6h-2v8h7v-2h-5z"
              />
            </svg>
            <p class="tw-font-bold tw-mb-0">
              {{ timer }}
            </p>
          </div>
        </template>
      </template>
    </div>
    <div class="tw-mt-auto tw-flex tw-justify-between tw-items-end">
      <div class="tw-flex tw-items-center">
        <img
          class="tw-rounded-full"
          src="https://randomuser.me/api/portraits/thumb/men/9.jpg"
          size="3em"
        />
        <div class="tw-ml-2">
          <div class="tw-flex tw-items-center tw-gap-2">
            <StarFillIcon v-if="shouldHighlight" class="tw-h-4 tw-w-4" />
            <h6 class="tw-mb-0">{{ item.userName }}</h6>
          </div>
          <div class="tw-flex tw-gap-2">
            <div v-if="item.memberGroup" class="tw-badge tw-badge-primary">
              {{ item.memberGroup }}
            </div>
            <div
              v-for="(tag, index) in personaTags"
              class="tw-badge tw-badge-secondary"
              :key="index"
            >
              {{ tag.name }}
            </div>
          </div>
        </div>
      </div>
      <div class="text-right">
        <div v-if="item.memberGroup" className="tw-badge tw-badge-primary">
          {{ guestCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { StarFillIcon } from '@/components/icons'
import { PersonaTraits, type TraitType } from '@/utilities/constants'
import { filter, some } from 'lodash'

export default {
  components: {
    StarFillIcon
  },

  props: {
    isEventOpen: Boolean,
    item: {
      type: Object,
      required: true
    }
  },

  created() {
    let self = this
    setInterval(function () {
      self.getTime()
    }, 1000)
  },

  data() {
    return {
      isAddNewButtonHover: false,
      hours: 0,
      min: 0,
      sec: 0
    }
  },

  computed: {
    title() {
      const title = this.item.customBill ? this.item.customBill : this.item.tableName
      return title
    },
    guestCount() {
      const count = parseInt(this.item.amountOfGuest)
      return count < 10 ? `0${count}` : count
    },

    createdTime(): string {
      switch (typeof this.item.createdAt) {
        case 'object':
          return new Date(this.item.createdAt.seconds).toLocaleTimeString()
        default:
          return new Date(this.item.createdAt).toLocaleTimeString()
      }
    },

    createdDate(): string {
      switch (typeof this.item.createdAt) {
        case 'object':
          return new Date(this.item.createdAt.seconds * 1000).toDateString()
        default:
          return new Date(this.item.createdAt * 1000).toDateString()
      }
    },

    timer() {
      const { hours, min, sec } = this
      return `${String(hours).padStart(2, '0')} :  ${String(min).padStart(2, '0')} : ${String(
        sec
      ).padStart(2, '0')}`
    },

    loading() {
      return !this.hours && !this.min && !this.sec
    },

    style() {
      if (this.hours == 0 && this.min >= 10 && this.min < 20) {
        return 'tw-text-warning tw-badge-warning'
      }

      if (this.hours > 0 || this.min >= 20) {
        return 'tw-text-error tw-badge-error'
      }
      return 'tw-text-success tw-badge-success'
    },
    personaTags() {
      const persona = this.item?.userPersona || []
      return PersonaTraits.filter((t: TraitType) => persona.includes(t.key))
    },
    shouldHighlight() {
      return some(this.personaTags, (t: TraitType) => !!t?.highlight)
    },

    isChequeConfirmed() {
      return this.item?.status === 'cheque-confirmed'
    }
  },

  methods: {
    getSalesCategoryName(name: string) {
      return name
        .replace(/-/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },
    addNewButtonHover(hovered: boolean): void {
      this.isAddNewButtonHover = hovered
    },

    getTime() {
      let now: any = new Date()
      let countFrom: any = new Date(this.item.updatedAt)
      let timeDifference = now - countFrom

      const secondsInADay = 60 * 60 * 1000 * 24,
        secondsInAHour = 60 * 60 * 1000

      // let days = Math.floor(timeDifference / (secondsInADay) * 1);
      this.hours = Math.floor(((timeDifference % secondsInADay) / secondsInAHour) * 1)
      this.min = Math.floor((((timeDifference % secondsInADay) % secondsInAHour) / (60 * 1000)) * 1)
      this.sec = Math.floor(
        ((((timeDifference % secondsInADay) % secondsInAHour) % (60 * 1000)) / 1000) * 1
      )
    }
  }
}
</script>

<style>
.card-wrapper {
  height: 100%;
}

.user-avatar {
  width: 70px;
  height: 70px;
}
</style>
