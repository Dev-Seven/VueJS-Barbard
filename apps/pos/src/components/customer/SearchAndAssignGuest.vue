<template>
  <div class="tw-relative tw-w-full">
    <input
      ref="search"
      id="search"
      class="tw-input tw-border tw-border-gray-300 tw-w-full"
      type="search"
      :placeholder="placeholder"
      @input="onSearch"
    />
    <div
      v-if="results.length"
      class="tw-absolute tw-top-12 tw-left-0 tw-h-max tw-max-h-96 tw-overflow-auto tw-rounded-xl tw-bg-white tw-w-full tw-z-10 tw-shadow-sm"
    >
      <div
        v-for="(user, index) in results"
        class="tw-flex tw-items-center tw-px-4 tw-py-2 tw-border-b tw-border-gray-300 tw-cursor-pointer last:tw-border-none hover:tw-bg-gray-300"
        :key="index"
        @click="selected(user)"
      >
        <div
          class="tw-h-10 tw-w-10 tw-bg-primary tw-text-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shrink-0"
        >
          {{ getInitials(user.fullName ? user.fullName : `${user.firstName} ${user.lastName}`) }}
        </div>
        <div class="tw-flex tw-flex-col tw-px-2">
          <span v-if="user.fullName" class="tw-text-nowrap">
            {{ user.fullName }}
          </span>
          <span v-else class="tw-text-nowrap"> {{ user.firstName }} {{ user.lastName }} </span>
          <small class="tw-text-gray-500 tw-text-nowrap">{{ user.email }}</small>
          <small class="tw-text-gray-500">{{ user.phone }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getInitials } from '@/utilities/utility'
import database from '@/config/firebase/database'
import { doc, getDoc } from 'firebase/firestore'
import search from 'algoliasearch'
import { debounce, map, orderBy, split } from 'lodash'

const algolia = search(import.meta.env.VITE_ALGOLIA_APP_ID, import.meta.env.VITE_ALGOLIA_APP_KEY)

const users = algolia.initIndex('users')

export default {
  name: 'AssignedGuestCard',
  data() {
    return {
      search: '',
      results: []
    }
  },
  props: {
    placeholder: {
      type: String,
      default: 'Search & add guest'
    }
  },
  methods: {
    getInitials,
    async selected(user: any) {
      const _doc = await getDoc(doc(database, `users/${user._id}`))
      const result = { ...user, ..._doc.data(), _id: _doc.id }
      this.$emit('selected', result)
      this.$refs.search.value = ''
    },
    onSearch: debounce(async function (event) {
      const search = event.target.value
      if (search.length >= 2) {
        const { hits = [] } = await this.users.search(search)
        this.results = orderBy(
          map(hits, (o) => {
            const { path, ...data } = o
            const segments = split(path, '/')
            return {
              ...data,
              _id: segments[segments.length - 1]
            }
          }),
          [(o) => o.fullName],
          ['asc']
        )
      } else {
        this.results = []
      }
    }, 300)
  },
  computed: {
    users() {
      return users
    }
  }
}
</script>

<style lang="scss" scoped>
.list-group {
  position: absolute;
  right: 0;
  left: 0;
  z-index: 1;
  max-height: 450px;
  overflow-y: auto;

  .list-item {
    cursor: pointer;
  }
}
</style>
