<template>
  <div
    class="location-container flex flex-col gap-y-5 min-h-full max-sm:justify-center sm:justify-center"
  >
    <button
      class="location-card text-start"
      v-for="(item, index) in locations"
      @click="bookingData?.location?.id !== item.id && locationSelect(item)"
    >
      <h6 class="text-[1.3125rem] golden-text">{{ item.name }}</h6>
      <hr class="hr-line" />
      <div
        class="grid grid-cols-2 md:py-[0.8rem] max-sm:py-[0.4rem] sm:py-[0.4rem] md:min-h-[4.5rem] max-sm:min-h-[3.6rem] sm:min-h-[3.6rem]"
      >
        <div
          class="flex md:gap-x-2 max-sm:gap-x-1 sm:gap-x-1"
          v-for="service in item.category"
        >
          <img
            :src="Isolation"
            class="w-[1rem] h-[1rem] max-sm:mt-[0.09rem] sm:mt-[0.09rem] md:mt-[0.2rem]"
          />
          <p
            class="font-montserrat opacity-60 md:text-sm max-sm:text-[0.75rem] sm:text-[0.75rem]"
          >
            {{ service }}
          </p>
        </div>
      </div>
      <hr class="hr-line" />
      <div class="py-[0.3rem] flex gap-x-2 items-center">
        <img :src="Location" />
        <p
          class="md:text-[0.75rem] max-sm:text-[0.625rem] sm:text-[0.625rem] m-0 font-montserrat opacity-60"
        >
          {{ item.addressFirst }}, {{ item.addressSecond }}
        </p>
      </div>
    </button>
  </div>
</template>

<script setup>
import Isolation from "@/assets/svg/icons/isolation.svg";
import Location from "@/assets/svg/icons/location.svg";

const db = useFirestore();
const { locations } = bookData();

const { bookingData, setBookingData } = useBooking();
const { setActiveTab } = useTabs();
const { setServices } = bookData();

// const locationData = [
//   {
//     name: "Sofitel Saigon Plaza",
//     services: ["Grooming Services"],
//     location: "17. Lê Duẩn, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
//   },
//   {
//     name: "Melia Hanoi",
//     services: ["Grooming Services", "Wellness Services", "Private Barbershop"],
//     location: "17. Lê Duẩn, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
//   },
// ];

const selectLocation = async (item) => {
  let data = {
    name: "location",
    value: item,
  };
  setBookingData(data);

  let serviceArray = await getServices(db, item.id);
  setServices(serviceArray);
};

const locationSelect = (item) => {
  selectLocation(item);
  setBookingData({
    name: "service",
    value: [],
  });
  delete bookingData.value.dateTime;
  // setActiveTab(2);
};
</script>

<style lang="scss" scoped>
.location-card {
  width: 100%;
  border-radius: 0.9375rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(78, 75, 97, 0.7);
  padding: 0.7rem 0.87rem;
}
@media only screen and (max-width: 599px) {
  .location-card {
    padding: 0.5rem 0.87rem;
  }
}
</style>
