<template>
  <div
    class="upgrade-container no-scrollbar flex flex-col md:gap-y-4 sm:gap-y-3 max-sm:gap-y-3"
  >
    <div v-if="isSelected()" class="">
      <div class="selectedUpgrade">
        <div class="flex justify-between px-4 py-2">
          <div class="flex flex-col gap-y-2">
            <h6 class="text-base golden-text">
              <!-- {{ bookingData.upgrade.name }} -->
              Upgrades
            </h6>
            <p class="text-[0.6875rem] uppercase tracking-wide">
              {{ bookingData.upgrade[0].name }} selected
            </p>
          </div>
          <img :src="Tick" alt="selected" />
        </div>
        <div class="bg-set"></div>
      </div>
    </div>
    <div class="flex flex-col gap-y-2">
      <div class="grid grid-cols-8 gap-2">
        <div
          class="max-sm:hidden max-lg:col-span-8 lg:col-span-8 xl:col-span-3 sm:hidden md:block"
        >
          <div>
            <h5 class="text-base golden-text">Upgrades</h5>
            <p class="uppercase">{{ upgrades.length }} Upgrades available</p>
          </div>
        </div>
        <div
          class="max-lg:col-span-8 lg:col-span-8 xl:col-span-5 flex flex-col sm:gap-y-3 max-sm:gap-y-3 md:gap-y-2"
        >
          <button
            class="upgrade-card flex text-start"
            v-for="(upgrade, index) in upgrades"
            :class="isTicked(upgrade) && 'active-upgrade'"
            @click="selectUpgrade(upgrade)"
            :key="index"
          >
            <img :src="HairCut" class="h-full" />
            <div
              class="flex flex-col gap-y-[0.3] lg:px-2 md:px-1 max-md:px-1 py-1 h-full w-full justify-between"
            >
              <div class="flex justify-between items-center">
                <p class="text-sm golden-text">{{ upgrade?.name }}</p>
                <img :src="Tick" class="h-[1rem]" v-if="isTicked(upgrade)" />
              </div>
              <!-- <p class="text-sm golden-text">{{ upgrade.name }}</p> -->
              <p
                class="text-[0.75rem] opacity-60 md:w-full sm:w-full max-sm:w-full font-montserrat"
              >
                {{ upgrade?.desc }}
              </p>
              <div class="flex justify-between">
                <p class="text-[0.75rem] font-montserrat">
                  {{ upgrade?.time }}
                </p>
                <p class="text-[0.75rem] font-montserrat">
                  đ{{ upgrade?.price }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
      <hr class="md:block sm:hidden max-sm:hidden" />
    </div>

    <div
      class="upgrade-data mobile-footer flex flex-col gap-y-4 sm:flex max-sm:flex md:hidden"
    >
      <div class="flex justify-between">
        <p class="text-[0.875rem] font-montserrat opacity-60">
          {{ `${bookingData?.upgrade?.length || "No"} Upgrade Selected` }}
        </p>
        <div class="flex gap-x-2 items-center">
          <p class="text-[0.875rem] font-montserrat opacity-60">
            No combo discount
          </p>
          <img :src="Info" class="mix-blend-luminosity opacity-60" />
        </div>
      </div>

      <button class="btn-primary w-full" @click="setActiveTab(activeTab + 1)">
        <!-- :disabled="!bookingData?.upgrade?.length" -->
        <!-- v-if="bookingData && bookingData.upgrade?.length" -->
        <p class="m-0">Next: Select Date & Time</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import HairCut from "@/assets/images/hair-cut.png";
import Tick from "@/assets/svg/icons/tick-mark.svg";
import Info from "@/assets/svg/icons/information.svg";

const { upgrades } = bookData();
const { bookingData, setBookingData, selectUpgrade } = useBooking();
const { activeTab, setActiveTab } = useTabs();

// const selectUpgrad = (parent, child) => {
//   let data = {
//     name: "upgrade",
//     value: {
//       name: parent.name,
//       selected: child,
//     },
//   };
//   setBookingData(data);
// };

const isSelected = () => {
  if (
    bookingData.value &&
    bookingData.value.upgrade &&
    bookingData.value.upgrade.length == 1
  ) {
    return true;
  }
  return false;
};

const isTicked = (upgrade) => {
  if (bookingData?.value?.upgrade?.find((prev) => prev.id == upgrade.id)) {
    return true;
  }
  return false;
};

// const upgradesArray = [
//   {
//     name: "Upgrades",
//     totalService: 3,
//     upgradeList: [
//       {
//         name: "Drink Upgrade",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         time: "45 min",
//         price: "from 480.000",
//       },
//       {
//         name: "Food Upgrade",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         time: "45 min",
//         price: "from 480.000",
//       },
//       {
//         name: "Cigar Upgrade",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         time: "45 min",
//         price: "from 480.000",
//       },
//     ],
//   },
// ];
</script>

<style lang="scss" scoped>
.upgrade-container {
  color: white;
  overflow: auto;
  height: 500px;
}

.upgrade-card {
  border-radius: 0.9375rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(78, 75, 97, 0.5);
  backdrop-filter: blur(25px);
}

.selectedUpgrade {
  border-radius: 0.9375rem;
  border: 1px solid rgba(255, 255, 255, 0.2);

  width: 100%;
  position: relative;
}

.bg-set {
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: 0.5;
  background: #ada9c5;
  border-radius: 0.9375rem;
  z-index: -1;
  top: 0;
  overflow: hidden;
}

.active-upgrade {
  background: #ada9c59d;
}

@media only screen and (min-width: 800px) and (max-width: 1200px) {
}

@media only screen and (min-width: 600px) and (max-width: 799px) {
}

@media only screen and (max-width: 599px) {
  .upgrade-container {
    height: 100%;
    overflow-y: auto;
  }

  .upgrade-data {
    z-index: 1000;
    position: fixed;
    padding: 1rem;
    bottom: 0;
    left: 0;
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(78, 75, 97, 0.5);
  }
}

@media only screen and (max-width: 400px) {
}
</style>
