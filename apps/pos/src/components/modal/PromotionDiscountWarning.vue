<template>
  <Modal
    :isShown="isShown"
    max-width-class="tw-max-w-screen-sm"
    @update:isShown="(e) => $emit('update:isShown', e)"
  >
    <div
      class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
    >
      <h6 class="tw-mb-0">Are you sure?</h6>

      <CloseIcon class="tw-w-4 tw-h-4" @click="() => $emit('update:isShown', false)" />
    </div>

    <div class="tw-p-6">
      <p class="tw-mb-0">
        This order has Promotion discount applied already. Applying agreement will remove any
        additional discounts on services. Do you want to continue?
      </p>
    </div>

    <div class="tw-px-6 tw-pb-6 tw-flex tw-justify-end tw-gap-4">
      <button class="tw-btn tw-btn-secondary tw-text-white tw-font-normal" @click="onCancel">
        Cancel
      </button>
      <button class="tw-btn tw-btn-primary tw-text-white tw-font-normal" @click="onConfirm">
        Continue
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import Modal from '@/components/common/Modal.vue'
import { CloseIcon } from '@/components/icons'

export default {
  props: {
    isShown: {
      type: Boolean,
      required: true
    }
  },
  components: { Modal, CloseIcon },
  methods: {
    onConfirm() {
      this.$emit('ok')
      this.$emit('update:isShown', false)
    },
    onCancel() {
      this.$emit('cancel')
      this.$emit('update:isShown', false)
    }
  }
}
</script>
