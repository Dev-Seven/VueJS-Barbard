<template>
  <div class="main-screen position-relative tom-test">
    <div
      class="tw-ml-auto tw-transition tw-duration-100 tw-pt-4 tw-px-4 lg:tw-px-8"
      :class="{
        'tw-w-full': !appointmentPanelVisible,
        'sm:tw-w-8/12 xl:tw-w-9/12': appointmentPanelVisible
      }"
    >
      <router-view></router-view>
    </div>

    <div
      class="main-screen__sidebar tw-py-4 tw-px-4 sm:tw-w-4/12 xl:tw-w-3/12"
      :class="{ 'main-screen__sidebar--open': appointmentPanelVisible }"
    >
      <button
        class="tw-bg-primary tw-text-white tw-rounded-lg tw-absolute appointment-btn"
        @click="toggleAppointmentPanel"
      >
        Appointments
      </button>

      <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
        <a
          v-for="tab in tabs"
          :key="`tab-${tab}`"
          :title="tab"
          class="tw-px-4 tw-py-2 tw-rounded-lg tw-cursor-pointer hover:tw-no-underline"
          :class="{
            'tw-text-primary': activeTab !== tab,
            'tw-text-white tw-bg-primary hover:tw-text-white': activeTab === tab
          }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </a>

        <SortIcon
          class="tw-text-primary tw-cursor-pointer tw-ml-auto tw-w-5 tw-h-5"
          @click="toggleSorting"
        />

        <div class="close-action">
          <CloseIcon class="close-btn" @click="toggleAppointmentPanel" />
        </div>
      </div>

      <template v-if="activeTab === 'Next'">
        <div
          v-if="nextEvents.length"
          class="tw-flex tw-flex-1 tw-overflow-y-scroll tw-overflow-x-hidden tw-flex-col tw-gap-2"
        >
          <event-card
            v-for="(e, index) in orderBy(nextEvents, eventViewConfig.sort)"
            :key="`${index}-${e.userId}`"
            :event="e"
            @expand="(d) => eventClicked(d, { showActions: true })"
          />
        </div>
        <div v-else class="event-cards--loading">
          <div class="loading-card" v-for="i in 4" :key="i"></div>
        </div>
      </template>

      <template v-if="activeTab === 'Now'">
        <div
          v-if="activeEvents.length"
          class="event-cards tw-flex-1 tw-overflow-y-scroll tw-overflow-x-hidden"
        >
          <event-card
            v-for="(e, index) in orderBy(activeEvents, eventViewConfig.sort)"
            :key="`${index}-${e.userId}`"
            :event="e"
            class="tw-mb-2"
            @expand="(d) => eventClicked(d, { showActions: false })"
          />
        </div>
        <div v-else class="event-cards--loading">
          <div class="loading-card" v-for="i in 4" :key="i"></div>
        </div>
      </template>

      <template v-if="activeTab === 'Done'">
        <div
          v-if="completedEvents.length"
          class="event-cards tw-flex-1 tw-overflow-y-scroll tw-overflow-x-hidden"
        >
          <event-card
            v-for="(e, index) in orderBy(completedEvents, eventViewConfig.sort)"
            :key="`${index}-${e.userId}`"
            :event="e"
            class="tw-mb-2"
            @expand="(d: any) => eventClicked(d, { showActions: false })"
          />
        </div>
        <div v-else class="event-cards--loading">
          <div class="loading-card" v-for="i in 4" :key="i"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import EventCard from '@/components/event/EventCard.vue'
import { SortIcon, CloseIcon } from '@/components/icons'
import { getInitials } from '@/utilities/utility'
import { orderBy } from 'lodash'
import { mapActions, mapState } from 'pinia'
import { useEvents, type ExtendedEvent } from '@/stores/events'
import { useApp } from '@/stores/app'
import { useUI } from '@/stores/ui'

export default {
  components: { EventCard, SortIcon, CloseIcon },

  data() {
    return {
      eventViewConfig: {
        sort: 'asc'
      },
      tabs: ['Next', 'Now', 'Done'],
      activeTab: 'Next'
    }
  },

  computed: {
    ...mapState(useEvents, ['nextEvents', 'activeEvents', 'completedEvents']),
    ...mapState(useUI, ['appointmentPanelVisible'])
  },

  methods: {
    orderBy,
    getInitials,
    ...mapActions(useEvents, ['selectEvent']),
    ...mapActions(useUI, ['toggleAppointmentPanel']),
    ...mapActions(useApp, ['setNavbarOption']),

    eventClicked(data: ExtendedEvent, config: any) {
      const params = {
        event: data,
        config
      }
      this.selectEvent(params)

      this.$router.push({
        name: 'appointment.detail',
        params: {
          id: data._id
        }
      })
    },

    toggleSorting() {
      this.eventViewConfig.sort = this.eventViewConfig.sort === 'asc' ? 'desc' : 'asc'
    }
  },

  async mounted() {
    this.setNavbarOption('setDefaultNavbar')
  }
}
</script>

<style lang="scss">
.main-screen {
  position: relative;
  height: calc(100vh - 46px);

  @media (min-width: 992px) {
    height: calc(100vh - 71px);
  }

  &__sidebar {
    position: absolute !important;
    top: 0;
    left: 0;
    z-index: 3;
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: all 0.2s;
    border-right: solid 1px rgba(0, 0, 0, 0.1);
    height: calc(100vh - 46px);
    background: #fff;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0);

    @media (min-width: 992px) {
      height: calc(100vh - 71px);
    }

    &--open {
      transform: translateX(0);
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
    }

    .tabs {
      height: inherit;
    }

    .tab-content {
      position: relative;
      overflow: overlay;
      height: calc(100% - 72px);
      margin: 0;
      padding-right: 3px;
    }

    .nav {
      margin: 1rem 0;
    }
  }

  &__router-view {
    transition: all 0.2s;
    margin-left: auto;
  }

  .appointment-btn {
    top: 60%;
    right: -151px;
    transform-origin: left;
    transform: rotate(270deg);
    border-radius: 0;
    z-index: 100;
    padding: 3px 1rem 6px;
    border-radius: 0 0 10px 10px;

    &:focus {
      box-shadow: none;
    }
  }

  .event-cards {
    max-height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .event-cards--loading {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .loading-card {
      height: 160px;
      width: 100%;
      border-radius: 10px;
      background: #eee;

      &:nth-child(1) {
        opacity: 0.8;
      }

      &:nth-child(2) {
        opacity: 0.6;
      }

      &:nth-child(3) {
        opacity: 0.4;
      }

      &:nth-child(4) {
        opacity: 0.2;
      }
    }
  }
}
</style>
