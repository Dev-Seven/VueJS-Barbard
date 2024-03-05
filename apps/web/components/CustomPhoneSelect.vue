<template>
  <div class="custom-phone-select grid grid-cols-8" v-if="!isVerify">
    <div
      class="left-part flex"
      :class="verified ? 'col-span-8 verified-border' : 'col-span-6'"
    >
      <v-autocomplete
        :items="Countries"
        item-title="name"
        item-value="code"
        class="font-montserrat w-5 custom-autocomplete max-w-[125px]"
        v-model="state.code"
      >
        <template v-slot:selection="{ props, item }">
          <div class="flex gap-x-2 itemx-center">
            <img :src="item?.raw?.flag" class="h-6 w-10 rounded-[0.2rem]" />
            <p class="text-sm font-montserrat">{{ item?.raw?.code }}</p>
            <img :src="Down" class="h-6 w-4" />
          </div>
        </template>

        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :prepend-avatar="item?.raw?.flag"
            :title="item?.raw?.name"
            :subtitle="item?.raw?.code"
            style="font-family: Montserrat"
            class="text-black list-items"
          ></v-list-item>
        </template>
      </v-autocomplete>
      <v-text-field
        label="Phone*"
        class="custom-textfield"
        type="text"
        v-model="state.phone"
      >
        <template v-slot:append-inner v-if="verified">
          <div class="min-w-[20px]">
            <img :src="Verified" class="" />
          </div>
        </template>
      </v-text-field>
    </div>

    <button
      class="right-part col-span-2"
      @click="isVerify = !isVerify"
      v-if="!verified"
    >
      <p class="text-sm uppercase">Verify</p>
    </button>
  </div>

  <div v-if="isVerify" class="grid grid-cols-8 items-center">
    <div class="col-span-6">
      <v-otp-input
        v-model="otp"
        length="4"
        variant="filled"
        v-on:finish="finished"
      ></v-otp-input>
    </div>
    <div class="col-span-2">
      <button class="w-full">
        <p class="text-[0.875rem] golden-text font-montserrat text-center">
          Resent OTP
        </p>
      </button>
      <button class="w-full" @click="isVerify = !isVerify">
        <p class="text-[0.875rem] golden-text font-montserrat text-center">
          Change number
        </p>
      </button>
    </div>
  </div>
</template>

<script setup>
import Down from "@/assets/svg/icons/down.svg";
import Verified from "@/assets/svg/icons/green-tick.svg";
import { Countries } from "../utils/CountryData";

const finished = () => {
  verified.value = !verified.value;
  isVerify.value = !isVerify.value;
};
const {
  items,
  label,
  isFilter = false,
  data,
} = defineProps(["items", "label", "isFilter", "data"]);

const state = reactive({
  ...data,
});

const emit = defineEmits(["selectPhone"]);

// const countries = useState("countries", () => []);
// const selected = useState("selected", () => "+84");
const isVerify = useState("isVerify", () => false);
const verified = useState("verified", () => false);

const otp = useState("otp", () => "");
// const phoneNumber = useState("phoneNumber", () => "");

watch(state, () => {
  emit("selectPhone", state);
});

watch(otp, (newValue) => {
  if (newValue.length == 4) {
    verified.value = !verified.value;
    isVerify.value = !isVerify.value;
  }
});
</script>

<style lang="scss" scoped>
.custom-phone-select {
  border-radius: 0.625rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.left-part {
  overflow: hidden;
}

.right-part {
  background-color: #ca7728;
  padding: 0.81rem 0.94rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-textfield.v-text-field.v-input {
  border-radius: 0px !important;
  background: none;
  box-shadow: none;
  border: none;
}

.custom-autocomplete.v-text-field.v-input {
  border-radius: 0px !important;
  border-top-left-radius: 0.625rem !important;
  border-bottom-left-radius: 0.625rem !important;

  background: none;
  box-shadow: none;
  border: none;
}

.verified-border .custom-textfield.v-text-field.v-input {
  border-top-right-radius: 0.625rem !important;
  border-bottom-right-radius: 0.625rem !important;
}
</style>
