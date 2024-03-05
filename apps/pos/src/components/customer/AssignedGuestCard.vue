<template>
  <div
    class="tw-border tw-border-gray-300 tw-flex tw-justify-between tw-items-center tw-rounded-lg tw-px-2 tw-py-2"
    :class="{
      'tw-bg-warning tw-bg-opacity-50': shouldHighlight,
      'tw-bg-white': !shouldHighlight
    }"
  >
    <div class="tw-mr-2">
      <div
        class="tw-h-10 tw-w-10 tw-bg-primary tw-text-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shrink-0"
      >
        {{ getInitials(customer?.userName) }}
      </div>
    </div>
    <div class="tw-flex tw-flex-col flex-1">
      <div class="tw-flex tw-items-center tw-gap-2">
        <StarFillIcon v-if="shouldHighlight" class="tw-w-4 tw-h-4" />
        <p class="tw-mb-0">{{ customer.userName }}</p>
      </div>
      <div class="tw-mb-0 tw-flex tw-gap-1 tw-flex-wrap tw-whitespace-nowrap">
        <div v-if="customer.memberGroup" class="tw-badge tw-badge-primary">
          {{ customer.memberGroup }}
        </div>
        <div
          v-for="(tag, index) in personaTags"
          :key="`guest-persona-${index}`"
          class="tw-badge tw-badge-secondary"
        >
          {{ tag.name }}
        </div>
        <div
          v-for="(tag, index) in customer?.userTags"
          :key="`guest-tag-${index}`"
          class="tw-badge"
        >
          {{ tag }}
        </div>
      </div>
    </div>
    <div class="">
      <TrashIcon
        class="tw-text-error tw-w-4 tw-h-4 tw-cursor-pointer hover:tw-opacity-80"
        @click="removeCustomer()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { getInitials } from '@/utilities/utility'
import { mapState, mapActions } from 'pinia'
import { TrashIcon, StarFillIcon } from '@/components/icons'
import { useSale } from '@/stores/sale/sale'
import { PersonaTraits, type TraitType } from '@/utilities/constants'
import { filter, some } from 'lodash'

export default {
  name: 'AssignedGuestCard',
  components: {
    StarFillIcon,
    TrashIcon
  },
  computed: {
    ...mapState(useSale, ['customer']),
    personaTags() {
      const persona = this.customer?.userPersona || []
      return filter(PersonaTraits, (t: TraitType) => persona.includes(t.key))
    },
    shouldHighlight() {
      return some(this.personaTags, (t: TraitType) => !!t?.highlight)
    }
  },
  methods: {
    getInitials,
    ...mapActions(useSale, ['removeCustomer'])
  }
}
</script>
