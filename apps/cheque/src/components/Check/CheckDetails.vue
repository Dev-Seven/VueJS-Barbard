<template>
  <div class="check__details">
    <div class="component-container pb-8">
      <ul class="check__details-list">
        <li class="flex justify-between head">
          <div class="box">
            <span class="font-bold uppercase">Item</span>
          </div>
          <div class="text-right box">
            <span class="font-bold uppercase">Price</span>
          </div>
        </li>
        <li
          v-for="item in check.products"
          :key="item.id"
          class="flex justify-between"
        >
          <div class="flex gap-2 box">
            <span>{{ item.quantity }}x </span>
            <span>{{ item.name }}</span>
          </div>
          <div class="text-right box flex flex-col">
            <span class="font-bold text-base">
              <currency :value="getPriceForItem(item)" />
            </span>
            <span
              class="line-through text-sm"
              v-if="
                !!item.originalPrice &&
                getPriceForItem(item) != item.originalPrice
              "
            >
              <currency :value="item.originalPrice" />
            </span>
          </div>
        </li>
        <li class="sub-totla-line">
          <div class="flex justify-between">
            <div class="box">
              <span class="font-bold">Sub total</span>
            </div>
            <div class="text-right box">
              <span class="font-bold">
                <currency :value="check.totalWithoutVat" />
              </span>
            </div>
          </div>
          <div class="flex justify-between">
            <div class="box">
              <span>Service Charge 5%</span>
            </div>
            <div class="text-right box">
              <span>
                <currency :value="check.totalServiceCharge" />
              </span>
            </div>
          </div>

          <div
            class="flex justify-between"
            v-for="item in Object.keys(vatSum)"
            :key="item"
          >
            <div class="box">
              <span>VAT {{ item }}%</span>
            </div>
            <div class="text-right box">
              <currency :value="vatSum[item as unknown as number]" />
            </div>
          </div>

          <div class="flex justify-between" v-if="check?.tips?.amount">
            <div class="box">
              <span>Tip </span>
            </div>
            <div class="text-right box">
              <currency :value="check.tips.amount" />
            </div>
          </div>
          <div class="flex justify-between" v-if="check?.totalDiscount">
            <div class="box">
              <span>Discount </span>
            </div>
            <div class="text-right box">
              <currency :value="check.totalDiscount" />
            </div>
          </div>
        </li>
        <li class="flex justify-between totla-line">
          <div class="box">
            <span class="font-bold">Total</span>
          </div>
          <div class="text-right box">
            <span class="font-bold">
              <currency :value="check?.totalPayableAmount" />
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Order, BarbaardProduct } from "@barbaard/types";
import Currency from "../Currency.vue";

type VatSum = {
  [key: number]: number;
};

const props = defineProps<{
  check: Order;
}>();

//const orderTotalPrice = computed(() => {
//  const check = props.check;
//  const tipsAmount = check?.tips?.amount;
//
//  if (tipsAmount) return check.totalOrderValue + +tipsAmount;
//  return check.totalOrderValue;
//});

const getVatForItem = (
  item: any, //BarbaardProduct | BarbaardProductService,
): number => {
  const itemPrice = item.service
    ? item.service.originalPrice * item.agreementCount
    : getPriceForItem(item);
  const itemVatAmount = +item?.VAT?.amount;
  const itemServiceCharge = item?.serviceCharge
    ? +item.serviceCharge.amount
    : 0;

  console.log(itemServiceCharge * itemPrice);
  return (
    ((itemPrice ?? 0) + (itemPrice ?? 0) * (itemServiceCharge / 100)) *
    (itemVatAmount / 100)
  );
};

const getPriceForItem = (
  item: any, //BarbaardProduct | BarbaardProductService,
  mutiplier: number = 1,
): number => {
  if (item.service) {
    return getPriceForItem(
      item.service,
      item.agreementCount * (item.discount ? 1 - item.discount / 100 : 1),
    );
  }
  const itemPrice = !!item.manualPrice
    ? item.manualPrice
    : !!item.discount
      ? item.priceAfterDiscount
      : item.price;

  return itemPrice * mutiplier;
};

const calculateVatSum = (products: BarbaardProduct[]) => {
  const vatSum: VatSum = {};

  const discountPerc =
    1 - +(props.check.totalDiscount ?? 0) / +props.check.totalWithoutVat!;

  products.forEach((item) => {
    const itemVatAmount: number = +(
      item?.service?.VAT?.amount ?? item?.VAT?.amount
    );
    if (itemVatAmount) {
      if (!vatSum[itemVatAmount]) {
        vatSum[itemVatAmount] = 0;
      }
    }
    const vll = getVatForItem(item);

    vatSum[itemVatAmount] += vll;
  });

  // POS messes up => return abnormal value totalWithoutVat == nan
  return isNaN(discountPerc) || !isFinite(discountPerc)
    ? vatSum
    : Object.fromEntries(
        Object.entries(vatSum).map(([k, v]) => [k, v * discountPerc]),
      );
};

const products = computed(() => props.check.products || []);
let vatSum = computed(() => calculateVatSum(products.value));

// VAT:
// Separate %VAT (10%, 8%, etc.) (see pic below): referring to amount  in products array
// In products array, Sum of VAT of all objects per amount  (to separate %VAT ):
// VAT = (priceAfterDiscount + service charge)*%VAT
// whereas
// if priceAfterDiscount = 0, refer to price
// service charge = price*serviceCharge.amount/100
// if 'serviceCharge': false, service charge = 0
// %VAT = vat.amount/100
</script>

<style lang="scss" scoped>
.check__details {
  padding: 2.0625rem 0;
  font-family: var(--font-1);

  &-list {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0px 0.25rem 0.25rem rgba(0, 0, 0, 0.25);
    border-radius: 0.3125rem;
    padding: 0.4375rem 1.4375rem 0.6875rem;

    li {
      padding: 0.5rem 0;

      &.head {
        font-size: 0.875rem;
      }

      &:not(:last-child) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      &:first-child,
      &:nth-last-child(-n + 3) {
        border-bottom-color: rgba(255, 255, 255, 0.3);
      }

      .box {
        max-width: 50%;
      }

      &.totla-line {
        font-size: 1.25rem;
      }
    }
  }
}
</style>
