<template>
  <div class="flex flex-col gap-y-5">
    <div class="appointment-card flex flex-col">
      <div class="card-data flex flex-col gap-y-3">
        <div class="flex gap-x-4">
          <div>
            <img :src="User" />
          </div>
          <div class="w-full flex flex-col gap-y-2">
            <h6 class="text-base golden-text">Your Appointment:</h6>
            <div class="flex flex-col">
              <p class="uppercase font-montserrat text-[0.6875rem]">
                <!-- Monday 24 April 2023 -->
                {{
                  `${bookingData?.dateTime?.day?.day} ${bookingData?.dateTime?.day?.date} ${bookingData?.dateTime?.data?.month} ${bookingData?.dateTime?.data?.year}`
                }}
              </p>
              <p class="uppercase font-montserrat text-[0.6875rem]">
                <!-- Melia Hanoi -->
                {{ bookingData?.location?.name }}
              </p>
              <p class="uppercase font-montserrat text-[0.6875rem]">
                <!-- Mr. Bao (Romeo) -->
                {{ bookingData?.dateTime?.barber?.fullName }} ({{
                  bookingData?.dateTime?.barber?.nickName
                }})
              </p>
            </div>
          </div>
        </div>
        <hr />
        <div>
          <div
            class="flex justify-between"
            v-for="item in bookingData?.service"
          >
            <p class="text-[0.875rem] font-montserrat opacity-60">
              <!-- Gentleman’s Haircut -->
              {{ item.name }}
            </p>
            <p class="text-[0.875rem] font-montserrat">đ{{ item.price }}</p>
          </div>
        </div>
        <hr v-if="bookingData?.upgrade?.length" />
        <div class="flex flex-col gap-y-1" v-if="bookingData?.upgrade?.length">
          <div
            class="flex justify-between"
            v-for="item in bookingData?.upgrade"
          >
            <p class="text-[0.875rem] font-montserrat opacity-60">
              <!-- Signature Drink Upgrade -->
              {{ item.name }}
            </p>
            <p class="text-[0.875rem] font-montserrat">đ{{ item.price }}</p>
          </div>
        </div>
        <hr />
        <div class="flex justify-between">
          <p class="text-[0.875rem] font-montserrat opacity-60">
            Combo Discount
          </p>
          <p class="text-[0.875rem] font-montserrat">-đ80.000</p>
        </div>
      </div>
      <div class="backdrop-set"></div>
    </div>

    <div class="flex flex-col gap-y-2">
      <h3 class="text-[1.5rem] sm:text-center max-sm:text-center md:text-start">
        Booking Notes:
      </h3>
      <v-text-field
        label="Anything we should know?"
        class="custom-textField"
        v-model="note"
        @input="noteChange"
      ></v-text-field>
      <CustomVCheckbox
        :value="iUnderstand"
        @changeHandler="iUnderstand = !iUnderstand"
        :label="'I understand that if I come more than 10 minutes late and the schedule doesn’t allow rescheduling, there is a chance that my booking will be cancelled.'"
      />
    </div>
    <div
      class="confirm-app-data flex flex-col gap-y-4 sm:flex max-sm:flex md:hidden mobile-footer"
    >
      <!-- v-if="!isService" -->
      <div class="flex justify-between">
        <p class="text-[0.875rem] font-montserrat golden-text">
          Promotion code?
        </p>
        <div class="flex gap-x-1 items-center">
          <p class="text-base font-montserrat">Total: {{ getTotalPrice() }}</p>
        </div>
      </div>

      <button
        class="btn-primary w-full"
        @click="goNext()"
        :disabled="!bookingData?.almostThere"
      >
        <p class="m-0">Final Check</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import User from "@/assets/images/user1.png";

const emit = defineEmits(["createEvent"]);

const { activeTab, setActiveTab } = useTabs();
const { bookingData, setBookingData } = useBooking();

const note = ref(bookingData.value?.note || "");
const iUnderstand = ref(bookingData.value?.almostThere || false);

const db = useFirestore();
const user = useCurrentUser();

const alreadyUser = await checkUserData(db, user);

const goNext = () => {
  if (!alreadyUser) {
    setActiveTab(activeTab + 1);
  } else {
    emit("createEvent");
  }
};

const noteChange = (e) => {
  setBookingData({
    name: "note",
    value: e.target.value,
  });
};

const getTotalPrice = () => {
  let total = 0;
  bookingData.value?.service?.forEach((item) => {
    total += Number(item.price);
  });
  bookingData.value?.upgrade?.forEach((item) => {
    total += Number(item.price);
  });
  return total;
};

watch([iUnderstand], () => {
  setBookingData({
    name: "almostThere",
    value: iUnderstand.value,
  });
});
</script>

<style lang="scss" scoped>
.appointment-card {
  position: relative;
  border-radius: 0.9375rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 1.25rem;
  overflow: hidden;
  background: rgba(78, 75, 97, 0.5);
}

.card-data {
  z-index: 10;
}

.backdrop-set {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  backdrop-filter: blur(25px);
  z-index: 9;
}

.confirm-app-data {
  z-index: 10;
  position: fixed;
  padding: 1rem;
  bottom: 0;
  left: 0;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(78, 75, 97, 0.5);
}
</style>
