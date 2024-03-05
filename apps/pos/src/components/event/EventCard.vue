<template>
  <div
    class="event-card tw-flex tw-gap-2 tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-bg-white tw-cursor-pointer"
    :class="{ 'is-active': isActive, 'tw-bg-warning': shouldHighlight }"
    @click="click"
  >
    <div
      class="tw-h-8 tw-w-8 tw-bg-secondary tw-text-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-shrink-0"
    >
      {{ getInitials(event.userName) }}
    </div>

    <div class="detail">
      <div class="tw-flex tw-gap-2">
        <StarFillIcon v-if="shouldHighlight" class="tw-w-4 tw-h-4" />
        <h5 class="tw-font-bold">
          {{ event.userName ? event.userName : 'Unknown' }}

          <LoadingIcon
            v-if="loading"
            class="tw-w-4 tw-h-4 tw-animate-spin dark:tw-text-gray-200 tw-fill-white"
          />
        </h5>
      </div>
      <h6 class="tw-flex tw-flex-wrap tw-gap-1">
        <div v-if="event?.memberGroup" class="tw-badge tw-badge-primary">
          {{ event.memberGroup }}
        </div>
        <div
          v-for="(tag, index) in event?.userPersona"
          :key="index"
          class="tw-badge tw-badge-secondary"
        >
          {{ tag }}
        </div>
        <div
          v-for="(tag, index) in event?.userTags"
          :key="index"
          class="tw-badge tw-badge-secondary"
        >
          {{ tag }}
        </div>
      </h6>
      <p class="tw-text-sm tw-mb-0 tw-font-semibold">{{ event.serviceName }}</p>
      <p class="tw-text-sm tw-mb-0">{{ event.staffName }}</p>
      <div class="tw-flex tw-items-center tw-gap-2">
        <ClockIcon class="tw-text-gray-500 tw-w-4 tw-h-4" />
        <small class="tw-text-gray-500">
          {{ getStartDate }}
        </small>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getInitials } from '@/utilities/utility'
import { LoadingIcon, ClockIcon, StarFillIcon } from '@/components/icons'
import moment from 'moment'

export default {
  name: 'EventCard',
  components: {
    LoadingIcon,
    ClockIcon,
    StarFillIcon
  },
  props: {
    event: Object
  },

  data() {
    return {
      loading: false
    }
  },

  computed: {
    getStartDate(): string {
      const date = new Date(this.event.startDate.toDate())
      return moment(date).format('HH:mm')
    },
    isActive(): boolean {
      return this.$route.params.id === this.event._id
    },
    shouldHighlight() {
      const persona = this.event?.userPersona || []
      return (
        persona.findIndex((p) => p.toLowerCase() === 'vip' || p.toLowerCase() === 'svip') !== -1
      )
    }
  },

  methods: {
    getInitials,
    async click() {
      this.$emit('expand', this.event)
    }
  }
}
</script>

<style lang="scss">
.event-card {
  transition: all 0.2s;

  &.is-active {
    background: rgb(0 123 255 / 9%) !important;
    border: 1px solid #007bff !important;
  }

  .b-avatar {
    background: #ddd;
  }
}
</style>
@/components/icons
