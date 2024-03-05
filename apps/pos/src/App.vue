<template>
  <div id="app">
    <div class="layout-full">
      <div id="nav" v-if="shouldDisplayNavigation">
        <Navigation ref="nagivation" :routes="routes">
          <multiple-option v-if="navbarOption[0].value" />
          <back-button-nav v-if="navbarOption[1].value" />
          <div v-if="navbarOption[2].value" />
        </Navigation>
      </div>

      <router-view></router-view>
    </div>
    <section id="outside-portal" />
  </div>
</template>

<script lang="ts">
import { RouterView } from 'vue-router'

import Navigation from '@/components/navigation/Navigation.vue'
import BackButtonNav from '@/components/navigation/BackButtonNav.vue'
import MultipleOption from '@/components/navigation/MultipleOptionNav.vue'
import { mapActions, mapState } from 'pinia'
import { useAnalytics, useApp } from '@/stores'

export default {
  components: { Navigation, BackButtonNav, MultipleOption, RouterView },
  data() {
    return {
      routes: [
        {
          title: 'Sales',
          to: '/',
          name: 'home',
          class: ''
        },
        {
          title: 'Cash Management',
          to: '/register/cash-management',
          name: 'register.cash-management',
          class: ''
        },
        {
          title: 'Close Register',
          to: '/register/close',
          name: 'register.close',
          class: ''
        }
      ]
    }
  },
  methods: {
    /**
     * Inject analytics store manually as only actions
     * are being used, otherwise store won't be installed
     *
     */
    ...mapActions(useAnalytics, ['assignTagToUser'])
  },
  computed: {
    ...mapState(useApp, ['navbarOption']),
    shouldDisplayNavigation(): boolean {
      return this.$route.name !== 'login'
    }
  }
}
</script>
