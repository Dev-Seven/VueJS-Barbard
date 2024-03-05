<template>
  <div class="print-bill" id="printSection">
    <div class="logo">
      <img src="@/assets/logo.svg" height="100" alt="house-of-barbaard" />
    </div>
    <hr />
    <div class="address-time">
      <div class="address">
        House of Barbaard<br />
        {{ location?.addressFirst }}<br />
        {{ location?.addressSecond }}
      </div>
      <div class="time">
        {{ order.orderId }}<br />
        {{ printDate }}<br />
        {{ order.generalSalesPerson.staffName }}
      </div>
    </div>
    <template v-if="order.userName">
      <hr />
      <div class="member item-price-head">
        <div class="name item">{{ order.userName }}</div>
        <div class="Membership-number price">B300120829</div>
      </div>
    </template>
    <hr v-if="!paymentStatus || order.userName" />
    <div class="cart">
      <div class="item-price-head">
        <div class="item">Item</div>
        <div class="price">Price</div>
      </div>

      <print-item
        v-for="(item, index) in order.products"
        :key="item.id"
        :index="index"
        :item="item"
      />

      <div class="item-price" v-if="order?.eventItem?.food">
        <div class="item">1 x {{ order.eventItem.food }}</div>
        <div class="price">₫ 0</div>
      </div>
      <div class="item-price" v-if="order?.eventItem?.drink">
        <div class="item">1 x {{ order.eventItem.drink }}</div>
        <div class="price">₫ 0</div>
      </div>
    </div>
    <hr />
    <div class="item-price-foot">
      <div class="item">Subtotal</div>
      <div class="price">₫ {{ numberWithCommas(round(subTotal)) }}</div>
    </div>
    <div v-if="totalDiscount" class="item-price-foot normal">
      <div class="item">Discount</div>
      <div class="price">₫ {{ numberWithCommas(round(totalDiscount)) }}</div>
    </div>
    <hr />
    <div v-if="totalServiceChargePaying" class="item-price-foot normal">
      <div class="item">Service Charge</div>
      <div class="price">₫ {{ numberWithCommas(round(totalServiceChargePaying)) }}</div>
    </div>
    <div v-if="totalVATPaying" class="item-price-foot normal">
      <div class="item">VAT</div>
      <div class="price">₫ {{ numberWithCommas(round(totalVATPaying)) }}</div>
    </div>
    <hr />
    <div class="item-price-foot major">
      <div class="item">Total</div>
      <div class="price">₫ {{ numberWithCommas(totalPayableAmount) }}</div>
    </div>
    <hr />
    <div v-if="paymentStatus && order.userName">
      <div
        v-for="(payment, index) in payments"
        :key="index"
        class="d-flex justify-content-between align-items-start payment item-price-head"
      >
        <div class="item">
          {{ payment.method }}
          <div v-if="payment.method === $options.STORE_CREDIT_AGREEMENT" class="text-muted">
            {{ payment.agreements[0].left - 1 }} Services left
          </div>
        </div>
        <div class="normal-price">₫ {{ numberWithCommas(payment.amount) }}</div>
      </div>
      <hr />
    </div>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import { mapState, mapActions } from 'pinia'
import { numberWithCommas } from '@/utilities/utility'
import { Printd } from 'printd'
import { isEmpty } from 'lodash'
import PrintItem from './PrintItem.vue'
import { round } from 'lodash'
import { STORE_CREDIT_AGREEMENT } from '@/utilities/constants'
import { useSale } from '@/stores/sale/sale'
import { useApp } from '@/stores/app'

export default {
  STORE_CREDIT_AGREEMENT,
  name: 'Print',
  components: { PrintItem },

  mounted() {
    this.paymentStatus = false
    this.d = new Printd()
  },

  data() {
    return {
      printDate: '',
      paymentStatus: false,
      distributedPayment: {},
      agreementData: {},
      payments: []
    }
  },

  computed: {
    ...mapState(useSale, [
      'order',
      'totalPayableAmount',
      'subTotal',
      'totalServiceChargePaying',
      'totalVATPaying',
      'totalDiscount'
    ]),
    ...mapState(useApp, ['location'])
  },

  methods: {
    round,
    numberWithCommas,

    ...mapActions(useSale, ['updateStatus']),

    printBill(payments = [], agreementData = {}) {
      this.updateStatus('cheque-requested')

      if (!isEmpty(payments)) {
        this.paymentStatus = true
        this.payments = payments
      }
      if (agreementData) {
        this.agreementData = { ...agreementData }
      }
      this.printDate = moment().format('HH:mm DD-MM-YYYY')
      setTimeout(() => {
        const cssText = `
					@page {
							size: auto;   /* auto is the initial value */
							/* this affects the margin in the printer settings */
							margin: 0mm 0mm 0mm 0mm;
					}

					@media print {
						body {
							zoom: 100%;
							margin: 0 auto;
						}
						.print-bill {
							height: auto;
							width: 95%;
							padding: 0px;
							font-size: 10pt;
						}
					}
					body{
						margin: 0;
						margin: 0 auto;
					}
					.print-bill {
						height: auto;
						width: 95%;
						padding: 0px;
						margin: 0 auto;
						font-size: 10pt;
					}
					.logo {
						display: flex;
						justify-content: center;
						margin-top: 5px;
					}

					.logo > img {
						width: 50%;
					}

					hr {
						margin-top: 10px;
						margin-bottom: 10px;
						border-top: dotted 1px;
					}

					.address-time {
						display: flex;
						justify-content: space-between;
					}

					.address-time > .address {
						text-align: left;
					}

					.address-time > .time {
						text-align: right;
					}

					.barbaard-club {
						text-align: center;
					}

					.barbaard-club > .title {
						font-weight: bold;
						font-size: 10pt;
					}

					.barbaard-club > .description {
						margin-top: 18px;
						margin-bottom: 18px;
					}

					.item-price-head {
						display: flex;
						justify-content: space-between;
						font-weight: bold;
					}

					.item-price-head > .item {
						text-align: left;
					}

					.item-price-head > .item > .normal-item {
						font-weight: normal;
					}

					.item-price-head > .price {
						text-align: right;
					}

					.item-price-head > .normal-price {
						text-align: right;
						font-weight: normal;
					}

					.item-price {
						display: flex;
						justify-content: space-between;
						margin-top: 15px;
						margin-bottom: 15px;
					}

					.item-price > .item {
						text-align: left;
					}

					.item-price > .price {
						text-align: right;
					}

					.item-price-foot {
						display: flex;
						justify-content: space-between;
						font-weight: bold;
						font-size: 9pt;
					}

          .item-price-foot.major {
						font-size: 12pt;
					}

					.item-price-foot.normal {
						font-weight: normal;
					}

					.item-price-foot > .item {
						text-align: left;
					}

					.item-price-foot > .price {
						text-align: right;
					}

					.payment {
						margin-bottom: 5px;
					}

					.download {
						text-align: center;
						font-weight: bold;
					}

					.barcode {
						display: flex;
						justify-content: center;
						margin-top: 5px;
					}

					.barcode > img {
						width: 25%;
					}

					.store {
						display: flex;
						justify-content: space-between;
						margin-top: 5px;
					}

					.store > .appstore {
						display: flex;
						justify-content: space-around;
						margin-top: 4px;
						width: 50%;
					}

					.store > .playstore {
						display: flex;
						justify-content: space-around;
						width: 50%;
					}

					.store > img {
						width: 80%;
					}
				`

        this.d.print(document.getElementById('printSection'), [cssText])
      }, 500)
      this.$forceUpdate()
    }
  }
}
</script>

<style lang="scss">
@page {
  size: auto;
  /* auto is the initial value */
  /* this affects the margin in the printer settings */
  margin: 0mm 0mm 0mm 0mm;
}

.print-bill {
  display: none;
}

@media print {
  body {
    zoom: 100%;
    margin: 0 auto;
  }

  .print-bill {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: block;
    height: auto;
    width: 95%;
    padding: 0px;
    font-size: 10pt;
  }
}

body {
  margin: 0;
  margin: 0 auto;
}

.print-bill {
  height: auto;
  width: 95%;
  padding: 0px;
  margin: 0 auto;
  font-size: 10pt;
}

.logo {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

.logo > img {
  width: 50%;
}

hr {
  margin-top: 10px;
  margin-bottom: 10px;
  border-top: dotted 1px;
}

.address-time {
  display: flex;
  justify-content: space-between;
}

.address-time > .address {
  text-align: left;
}

.address-time > .time {
  text-align: right;
}

.barbaard-club {
  text-align: center;
}

.barbaard-club > .title {
  font-weight: bold;
  font-size: 10pt;
}

.barbaard-club > .description {
  margin-top: 18px;
  margin-bottom: 18px;
}

.item-price-head {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.item-price-head > .item {
  text-align: left;
}

.item-price-head > .item > .normal-item {
  font-weight: normal;
}

.item-price-head > .price {
  text-align: right;
}

.item-price-head > .normal-price {
  text-align: right;
  font-weight: normal;
}

.item-price {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  margin-bottom: 15px;
}

.item-price > .item {
  text-align: left;
}

.item-price > .price {
  text-align: right;
}

.item-price-foot {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 9pt;
}

.item-price-foot.normal {
  font-weight: normal;
}

.item-price-foot > .item {
  text-align: left;
}

.item-price-foot > .price {
  text-align: right;
}

.payment {
  margin-bottom: 5px;
}

.download {
  text-align: center;
  font-weight: bold;
}

.barcode {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

.barcode > img {
  width: 25%;
}

.store {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

.store > .appstore {
  display: flex;
  justify-content: space-around;
  margin-top: 4px;
  width: 50%;
}

.store > .playstore {
  display: flex;
  justify-content: space-around;
  width: 50%;
}

.store > img {
  width: 80%;
}

text-normal {
  font-weight: normal;
}
</style>
