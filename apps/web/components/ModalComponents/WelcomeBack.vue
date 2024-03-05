<template>
  <div class="flex flex-col gap-y-[3rem]">
    <v-card class="modal-card">
      <div class="flex flex-col gap-y-4">
        <div class="flex gap-x-2">
          <div class="">
            <img
              :src="User1"
              alt="user"
              class="md:h-[5.8rem] md:w-[5.8rem] max-sm:w-[7rem] min-w-[5.8rem] min-h-[5.8rem]"
            />
          </div>
          <div class="flex flex-col gap-y-2">
            <h6 class="text-base golden-text">Your last Appointment:</h6>
            <div class="flex gap-x-2" v-for="item in appointMentDetail">
              <img :src="item.icon" class="h-[0.9rem] w-[0.9rem] mt-[0.1rem]" />
              <div class="">
                <p
                  class="text-white text-[0.6875rem] font-montserrat uppercase"
                >
                  {{ item.name }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-y-4">
          <button class="btn-secondary" @click="setModalState(5)">
            <p class="m-0">Rebook with {{ staffData?.nickName }}</p>
          </button>
          <button class="btn-secondary" @click="setModalState(5)">
            <p class="m-0">Rebook with any barber</p>
          </button>
        </div>
      </div>
    </v-card>
    <div ref="bottomBtn" class="btnResp w-full">
      <button class="btn-primary w-full" @click="setModalState(5)">
        <p class="m-0">Configure a new appointment</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import User1 from "@/assets/images/user1.png";

import Calendar from "@/assets/svg/icons/calendar.svg";
import Location from "@/assets/svg/icons/location.svg";
import Profile from "@/assets/svg/icons/profile.svg";
import { collection, doc, getDoc } from "firebase/firestore";

const db = useFirestore();
const { modalState, setModalState } = useModalState();
const { lastAppointmentData } = bookData();

const appointData = lastAppointmentData.value[0];

const getStaffData = async () => {
  const { value } = useDocument(
    doc(
      collection(db, "staff"),
      lastAppointmentData.value[0]?.services[0]?.staffId,
    ),
  );

  const staffRef = doc(
    db,
    "staff",
    lastAppointmentData.value[0]?.services[0]?.staffId,
  );
  const staffSnapshot = await getDoc(staffRef);
  return staffSnapshot.data();
};
const staffData = await getStaffData();

let appointMentDetail = [
  {
    icon: Calendar,
    name: appointData?.serviceName,
  },
  {
    icon: Location,
    name: appointData?.location?.name,
  },
  {
    icon: Profile,
    name: `${appointData?.staffName} (${staffData?.nickName})`,
  },
];
</script>

<style lang="scss" scoped>
.capitalize-text {
  text-transform: initial !important;
}

.modal-card {
  border-radius: 0.9375rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(78, 75, 97, 0.5);
  padding: 1rem;
}

@media only screen and (max-width: 599px) {
  .btnResp {
    position: fixed;
    padding: 1.2rem 1rem;
    bottom: 0;
    left: 0;

    border-top: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(78, 75, 97, 0.5);

    max-height: 90px;
  }
}
</style>
