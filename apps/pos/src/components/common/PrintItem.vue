<template>
  <div class="item-price">
    <div class="item">
      <div>{{ item.name }}</div>
      <div class="small m-0 gift-fill">
        {{ item.quantity || 0 }} x ₫{{ numberWithCommas(round(item.considerable)) }}
      </div>
      <div class="staff" v-if="item.itemNote">Note: {{ item.itemNote }}</div>
    </div>
    <div class="price">
      <div>
        <strong>₫{{ numberWithCommas(subTotal) }}</strong>
      </div>
      <div>
        <small v-if="item.discount || item.manualPrice">
          <s class="font-weight-normal"> ₫ {{ numberWithCommas(item.price * item.quantity) }} </s>
        </small>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { numberWithCommas } from '@/utilities/utility'
import { round } from 'lodash'
import genericMixin from '../sale/generic.mixin'

export default {
  name: 'PrintItem',
  mixins: [genericMixin],
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  methods: {
    round,
    numberWithCommas
  }
}
</script>
