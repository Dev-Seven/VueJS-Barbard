<template>
  <!-- Note: Deprecated, Check references and remove if not needed -->
  <Modal max-width-class="tw-max-w-screen-sm" :isShown="isShown">
    <div
      class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
    >
      <h6 class="tw-mb-0">Assign Sales Person</h6>

      <CloseIcon class="tw-w-4 tw-h-4 tw-cursor-pointer" @click="$emit('update:isShown', false)" />
    </div>

    <div class="tw-flex tw-flex-col tw-max-h-96 tw-overflow-y-scroll">
      <div
        v-for="(s, index) in staff"
        :key="index"
        class="tw-border-b tw-border-gray-300 tw-flex tw-items-center tw-cursor-pointer tw-px-6 tw-py-2 hover:tw-bg-primary hover:tw-bg-opacity-10"
        @click="save(s)"
      >
        <Avatar :name="s.name" :image="s.image" variant="success" class="tw-mr-4" />
        <p class="tw-mb-0">{{ s.name }}</p>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { getInitials } from '@/utilities/utility'
import Modal from '@/components/common/Modal.vue'
import Avatar from '@/components/common/Avatar.vue'
import { useAuthentication } from '@/stores/authentication'
import { useStaff } from '@/stores/staff'
import { CloseIcon } from '../icons'

export default {
  components: {
    Modal,
    Avatar,
    CloseIcon
  },
  props: {
    isShown: [Boolean]
  },

  data() {
    return {
      person: {
        staffId: '',
        staffName: '',
        profile: ''
      }
    }
  },

  computed: {
    ...mapState(useAuthentication, ['user']),
    ...mapState(useStaff, ['staff'])
  },

  methods: {
    getInitials,

    save(staff) {
      this.person.staffId = staff._id
      this.person.staffName = staff.name
      this.person.image = staff.image
      this.$emit('save', this.person)
      this.$emit('update:isShown', false)
    }
  }
}
</script>
