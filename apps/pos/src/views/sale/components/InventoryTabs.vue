<template>
  <div class="tw-rounded-lg tw-shadow-md tw-bg-white tw-border tw-border-gray-300">
    <div
      class="tw-m-4 tw-border tw-border-gray-300 tw-rounded-lg tw-grid tw-grid-flow-col tw-auto-cols-fr tw-mb-4"
    >
      <div
        v-for="t in tabs"
        :key="t.key"
        class="tw-font-bold tw-border-r tw-border-gray-300 tw-px-4 tw-py-2 tw-text-center tw-cursor-pointer last:tw-border-none hover:tw-bg-secondary hover:tw-bg-opacity-10"
        :class="{ 'tw-bg-primary tw-bg-opacity-10': tab === t.key }"
        @click="onTabChange(t.key)"
      >
        {{ t.name }}
      </div>
    </div>

    <div
      v-for="t in tabs"
      class="tw-p-4 tw-max-h-[70vh] tw-overflow-auto"
      :key="`tab-content-${t.key}`"
      v-show="tab === t.key"
    >
      <slot :name="t.key" />
    </div>
  </div>
</template>

<script lang="ts">
import { find } from 'lodash'

type Tab = {
  name: string
  key: string
  active?: boolean
}

export default {
  props: {
    tabs: Array<Tab>
  },
  data() {
    return {
      tab: ''
    }
  },
  methods: {
    onTabChange(key: string) {
      this.tab = key
      this.$emit('change', key)
    },
    changeTab(tabKey: string) {
      this.tab = tabKey
    }
  },
  created() {
    const active = find(this.tabs, (t) => t.active)
    this.tab = active ? active.key : this.tabs[0].key
  }
}
</script>
