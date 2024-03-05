<template>
  <Modal :isShown="isShown" max-width-class="tw-max-w-screen-sm">
    <div
      class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
    >
      <h6 class="tw-mb-0">Add Note</h6>

      <CloseIcon class="tw-w-4 tw-h-4" @click="$emit('update:isShown', false)" />
    </div>

    <div class="tw-p-6">
      <textarea
        id="addNote"
        class="tw-textarea tw-border tw-border-gray-300 tw-w-full"
        rows="4"
        placeholder="Add order note"
        :value="order.orderNote"
        @change="(e) => setOrderNote((e.target as HTMLInputElement).value)"
        style="resize: none"
      >
      </textarea>
    </div>

    <div class="tw-px-6 tw-pb-6 tw-flex tw-justify-end">
      <button
        class="tw-btn tw-btn-primary tw-text-white tw-font-normal"
        @click="$emit('update:isShown', false)"
      >
        Ok
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia'
import Modal from '@/components/common/Modal.vue'
import { CloseIcon } from '@/components/icons'
import { useSale } from '@/stores/sale/sale'

export default {
  components: {
    Modal,
    CloseIcon
  },
  props: {
    id: String,
    title: String,
    isShown: Boolean
  },

  computed: {
    ...mapState(useSale, ['order'])
  },

  methods: {
    ...mapActions(useSale, ['setOrderNote'])
  }
}
</script>
