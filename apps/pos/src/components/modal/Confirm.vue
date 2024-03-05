<template>
  <Modal :isShown="isShown">
    <div
      class="tw-flex tw-justify-between tw-items-center tw-p-6 tw-border-b tw-border-gray-300 tw-bg-white"
    >
      <h6 class="tw-mb-0">{{ title }}</h6>
      <CloseIcon class="tw-w-4 tw-h-4" @click="$emit('update:isShown', false)" />
    </div>

    <div class="tw-p-6 tw-border-b tw-border-gray-300 tw-relative">
      <slot name="content" />
    </div>

    <div class="tw-p-6 tw-flex tw-justify-end tw-gap-4">
      <button
        class="tw-btn tw-btn-secondary tw-text-white tw-font-normal"
        @click="$emit('update:isShown', false)"
      >
        Cancel
      </button>
      <button class="tw-btn tw-btn-primary tw-text-white tw-font-normal" @click="$emit('confirm')">
        Continue
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import Modal from '@/components/common/Modal.vue'
import { CloseIcon } from '@/components/icons'

export default {
  name: 'confirm',
  props: {
    title: [String],
    isShown: [Boolean]
  },
  components: { Modal, CloseIcon }
}
</script>
<style lang="scss" scoped>
.spinning {
  margin-left: 3px;
  margin-right: 1px;
}
*::-webkit-scrollbar {
  width: 3px;
}

::-webkit-scrollbar-track {
  background: #f7f7f7;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.loading {
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
