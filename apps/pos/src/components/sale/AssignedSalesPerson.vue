<template>
  <div>
    <template v-if="staff">
      <Avatar
        :name="staff.staffName"
        :image="staff.image"
        variant="success"
        @click="() => (isSalesPersonModalShown = true)"
      />
    </template>

    <div
      v-else
      class="tw-h-8 tw-w-8 tw-bg-secondary tw-text-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-cursor-pointer"
      @click="isSalesPersonModalShown = true"
    >
      <UserIcon class="tw-text-white tw-h-4 tw-w-4" />
    </div>
    <sales-person-card
      v-model:isShown="isSalesPersonModalShown"
      @save="(person) => $emit('assign', person)"
    />
  </div>
</template>

<script lang="ts">
import SalesPersonCard from '@/components/modal/SalesPerson.vue'
import { getInitials } from '@/utilities/utility'
import { UserIcon } from '@/components/icons'
import Avatar from '@/components/common/Avatar.vue'

export default {
  name: 'AssignedSalesPerson',
  components: { SalesPersonCard, UserIcon, Avatar },
  props: {
    staff: Object
  },

  data() {
    return {
      isSalesPersonModalShown: false
    }
  },

  methods: {
    getInitials
  }
}
</script>
