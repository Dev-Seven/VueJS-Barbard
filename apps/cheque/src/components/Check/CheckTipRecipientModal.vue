<template>
  <base-modal
    v-bind="$attrs"
    title="Thanks!"
    subTitle="For who would you like the tip to be?"
  >
    <div class="grid grid-cols-2 gap-7" v-if="singleStaff">
      <div>
        <button
          @click="() => setRewardType('staff')"
          class="w-full base-button yellow"
        >
          {{ servicesArr[0]?.salesPerson?.staffName }}
        </button>
      </div>
      <div>
        <button
          @click="() => setRewardType('team')"
          class="w-full base-button yellow"
        >
          THE ENTIRE TEAM
        </button>
      </div>
    </div>
    <div v-else>
      <ul class="staff-list">
        <li v-for="(item, index) in staffArr" :key="item.staffId">
          <label class="box">
            <base-checkbox v-model="item.enabled" :value="item.enabled" />

            <span>staffName {{ +index + 1 }}</span>
            <strong>{{ item.staffName }}</strong>
          </label>
        </li>
      </ul>

      <div class="buttons-holder">
        <div>
          <button
            @click="() => setRewardType('staff')"
            class="w-full base-button yellow"
            :disabled="!checkedStaffNames"
          >
            {{ checkedStaffNames ? checkedStaffNames : "Choose staff for tip" }}
          </button>
        </div>
        <div class="separ"></div>
        <div>
          <button
            @click="() => setRewardType('team')"
            class="w-full base-button yellow"
          >
            THE ENTIRE TEAM
          </button>
        </div>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Order, BarbaardProduct, Tips, TipType } from "@barbaard/types";
// Tips

import BaseModal from "@/components/BaseModal.vue";
import BaseCheckbox from "@/components/BaseCheckbox.vue";

const props = defineProps<{
  check: Order;
  servicesArr: BarbaardProduct[];
  amount: number;
}>();
const emit = defineEmits(["onRecipientChoosed"]);

const singleStaff = computed(() => props.servicesArr.length === 1);
type exmpl = {
  staffId?: string;
  staffName?: string;
  enabled?: boolean;
};
const staffArr = ref<exmpl[]>([]);

onMounted(() => {
  staffArr.value = props.servicesArr
    .filter((i) => i?.salesPerson?.staffId)
    .map((i2) => {
      return {
        ...i2.salesPerson,
        enabled: true,
      };
    });

  // check staff from order root
  const staffId = props?.check?.staffId;
  if (staffId) {
    const find = staffArr.value.find((i) => i.staffId === staffId);
    if (!find) {
      staffArr.value.push({
        staffId: staffId,
        staffName: props?.check?.staffName,
        enabled: true,
      });
    }
  }
});

// staff checkboxes
const checkedStaff = computed(() => {
  const arr = staffArr.value.filter((i) => i.enabled === true);
  return arr;
});

const checkedStaffNames = computed(() => {
  const arr = checkedStaff.value;
  if (arr.length) return arr.map((i) => i.staffName).join(" & ");
  return null;
});

const setRewardType = (val: TipType) => {
  const data: Tips = {
    rewardType: val,
  };
  if (val === "team") {
    data.amount = +props.amount;
  } else {
    if (singleStaff.value) {
      const item = staffArr.value[0];
      if (item) {
        data.tip = [
          {
            amount: props.amount,
            staffId: item.staffId!,
            staffName: item.staffName!,
          },
        ];
      }
    } else {
      const amount = +props.amount / +checkedStaff.value.length;
      data.tip = checkedStaff.value.map((i) => {
        return {
          amount: +amount.toFixed(1),
          staffId: i.staffId!,
          staffName: i.staffName!,
        };
      });
    }
  }
  emit("onRecipientChoosed", data);
};
</script>

<style lang="scss" scoped>
.staff-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0;
  margin: 0;
  list-style: none;
  align-items: flex-start;
  span {
    color: var(--color-red);
    display: block;
  }
  strong {
    font-weight: 700;
    font-size: 1.125rem;
  }
  .box {
    position: relative;
    padding-left: 1.875rem;
    display: block;
  }
  .base-checkbox {
    position: absolute;
    left: 0;
    top: auto;
    bottom: 0.25rem;
  }
}

.buttons-holder {
  padding-top: 0.75rem;
  .separ {
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(115, 97, 68, 0) 0%,
      #736144 50.52%,
      rgba(115, 97, 68, 0) 100%
    );
    margin: 0.875rem 0;
  }
}
</style>
