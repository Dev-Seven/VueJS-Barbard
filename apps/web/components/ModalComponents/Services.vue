<template>
  <div
    class="service-container no-scrollbar flex flex-col md:gap-y-4 sm:gap-y-3 max-sm:gap-y-3"
  >
    <div v-if="isSelected()" class="flex flex-col gap-y-2">
      <div class="selectedService">
        <div class="flex justify-between px-4 py-2">
          <div class="flex flex-col gap-y-2">
            <h6 class="text-base golden-text">
              {{ bookingData?.service[0]?.category }}
            </h6>
            <p class="text-[0.6875rem] uppercase">
              {{ bookingData?.service[0]?.name }} selected
            </p>
          </div>
          <img :src="Tick" alt="selected" />
        </div>
        <div class="bg-set"></div>
      </div>
      <p
        class="text-white text-[1.5rem] max-sm:block sm:block md:hidden text-center"
      >
        Complete your experience:
      </p>
    </div>
    <div
      class="flex flex-col gap-y-2"
      v-for="(item, index) in services"
      v-if="!isService"
    >
      <div class="grid grid-cols-8 gap-2">
        <div
          class="max-lg:col-span-8 lg:col-span-8 xl:col-span-3 service-dotted"
          @click="isService = item"
        >
          <div class="flex flex-col gap-y-1">
            <h5
              class="md:text-base sm:text-[1.125rem] max-sm:text-[1.125rem] golden-text"
            >
              {{ item.name }}
            </h5>
            <p class="uppercase font-montserrat text-[0.687rem] opacity-60">
              {{ item.services.length }} Services available
            </p>
          </div>
        </div>
        <div
          class="max-lg:col-span-8 lg:col-span-8 xl:col-span-5 flex flex-col gap-y-2 max-sm:hidden sm:hidden md:flex"
        >
          <button
            class="service-card flex text-start"
            :class="isTicked(item, service) && 'active-service'"
            v-for="(service, index) in item.services"
            @click="selectService(service)"
          >
            <img :src="HairCut" class="max-w-[90px] w-[90px] h-full" />
            <div
              class="flex flex-col justify-between gap-y-[0.3] lg:px-2 max-md:px-1 md:px-1 py-1 flex-1 h-100"
            >
              <div class="flex justify-between items-center">
                <p class="text-sm golden-text">{{ service?.name }}</p>
                <!-- class="h-[1rem]" -->
                <img :src="Tick" v-if="isTicked(item, service)" />
              </div>
              <!-- class="text-[0.75rem] opacity-60 lg:w-5/6 max-md:w-full md:w-full font-montserrat" -->
              <p
                class="text-[0.75rem] opacity-60 lg:w-5/6 max-md:w-full md:w-full font-montserrat"
              >
                {{ service?.desc }}
              </p>
              <div class="flex justify-between">
                <p class="text-[0.75rem] font-montserrat">
                  {{ service?.duration }} Mins
                </p>
                <p class="text-[0.75rem] font-montserrat">
                  đ{{ service?.price }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
      <hr class="md:block sm:hidden max-sm:hidden" />
    </div>
    <div v-if="isService" class="col-span-8 flex flex-col gap-y-3">
      <button class="gap-x-3 items-center flex" @click="isService = undefined">
        <img :src="BackIcon" alt="back" />
        <p class="text-sm golden-text uppercase">select {{ isService.name }}</p>
      </button>
      <button
        class="service-card flex text-start"
        v-for="(service, index) in isService.services"
        @click="selectService(service), (isService = undefined)"
      >
        <img :src="HairCut" class="h-full" />
        <div
          class="flex flex-col gap-y-[0.3] md:px-4 sm:px-2 max-sm:px-2 py-1 h-full w-full justify-between flex-1 h-100"
        >
          <p class="text-sm golden-text">{{ service.name }}</p>
          <p
            class="text-[0.75rem] opacity-60 md:w-5/6 sm:w-full max-sm:w-full font-montserrat"
          >
            {{ service.desc }}
          </p>
          <div class="flex justify-between">
            <p class="text-[0.75rem] font-montserrat">{{ service.duration }}</p>
            <p class="text-[0.75rem] font-montserrat">
              {{ service.price }}
            </p>
          </div>
        </div>
      </button>
    </div>

    <div
      class="service-data mobile-footer flex flex-col gap-y-4 sm:flex max-sm:flex md:hidden"
      v-if="!isService"
    >
      <div class="flex justify-between">
        <p class="text-[0.875rem] font-montserrat opacity-60">
          {{
            !bookingData?.service?.length
              ? "No Service Selected"
              : `${bookingData?.service?.length} Service Selected`
          }}
        </p>
        <div class="flex gap-x-2 items-center">
          <p class="text-[0.875rem] font-montserrat opacity-60">
            No combo discount
          </p>
          <img :src="Info" class="mix-blend-luminosity opacity-60" />
        </div>
      </div>
      <div
        class="flex justify-center gap-x-1 opacity-60"
        v-if="bookingData && !bookingData.service?.length"
      >
        <img :src="Location" />
        <p class="text-[0.875rem] font-montserrat">
          {{ bookingData?.location?.name }}
        </p>
        <a
          class="text-[0.875rem] font-montserrat golden-text underline cursor-pointer"
          @click="setActiveTab(1)"
        >
          change
        </a>
      </div>
      {{ bookingData.value?.service?.length }}
      <button
        class="btn-primary w-full"
        @click="setActiveTab(activeTab + 1)"
        v-if="bookingData && bookingData.service?.length"
        :disabled="!bookingData?.service?.length"
      >
        <p class="m-0">Next: Select Upgrades</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import HairCut from "@/assets/images/hair-cut.png";
import Tick from "@/assets/svg/icons/tick-mark.svg";
import BackIcon from "@/assets/svg/icons/back-icon.svg";
import Info from "@/assets/svg/icons/information.svg";
import Location from "@/assets/svg/icons/location.svg";

const { bookingData, setBookingData, selectService } = useBooking();
const { services } = bookData();

const isService = useState("isService", () => undefined);
const { size, setSize } = useFooterSize();

watch(isService, (newValue) => {
  if (newValue) {
    setSize(0);
  } else {
    setTimeout(() => {
      if (document.getElementsByClassName("mobile-footer")) {
        setSize(
          document.getElementsByClassName("mobile-footer")[0]?.clientHeight,
        );
      }
    });
  }
});

const { activeTab, setActiveTab } = useTabs();

// const selectServiceData = (parent, child) => {
//   // let data = {
//   //   name: "service",
//   //   value: {
//   //     name: parent.name,
//   //     selected: child,
//   //   },
//   // };
//   // setBookingData(data);
// };

const isSelected = () => {
  if (
    bookingData.value &&
    bookingData.value.service &&
    bookingData.value.service.length == 1
  ) {
    return true;
  }
  return false;
};

// const services = [
//   {
//     name: "Head & Hair Services",
//     totalService: 3,
//     services: [
//       {
//         name: "Gentleman’s Haircut",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         duration: "45 min",
//         price: "from 480.000",
//       },
//       {
//         name: "Express Haircut",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         duration: "45 min",
//         price: "from 480.000",
//       },
//       {
//         name: "Head Shave",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         duration: "45 min",
//         price: "from 480.000",
//       },
//     ],
//   },
//   {
//     name: "Beard & Shaving Services",
//     totalService: 3,
//     services: [
//       {
//         name: "Gentleman’s Haircut",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         duration: "45 min",
//         price: "from 480.000",
//       },
//       {
//         name: "Express Haircut",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         duration: "45 min",
//         price: "from 480.000",
//       },
//       {
//         name: "Head Shave",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         duration: "45 min",
//         price: "from 480.000",
//       },
//     ],
//   },
//   {
//     name: "Wellness Services",
//     totalService: 3,
//     services: [
//       {
//         name: "Gentleman’s Haircut",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         duration: "45 min",
//         price: "from 480.000",
//       },
//       {
//         name: "Express Haircut",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         duration: "45 min",
//         price: "from 480.000",
//       },
//       {
//         name: "Head Shave",
//         desc: "The ultimate Haircut experience for the ultimate gentleman’",
//         duration: "45 min",
//         price: "from 480.000",
//       },
//     ],
//   },
// ];

const isTicked = (item, service) => {
  if (bookingData?.value?.service?.find((prev) => prev.id == service.id)) {
    return true;
  }
  return false;
};
</script>

<style lang="scss" scoped>
.service-container {
  color: white;
  overflow: auto;
  height: 500px;
}

.service-card {
  border-radius: 0.9375rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(78, 75, 97, 0.5);
  //backdrop-filter: blur(25px);
}

.selectedService {
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

.active-service {
  background: #ada9c59d;
}

@media only screen and (max-width: 599px) {
  .service-dotted {
    border-radius: 0.9375rem;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    background: rgba(78, 75, 97, 0.5);
    padding: 0.5rem 1rem;
  }

  .service-container {
    height: 100%;
    //max-height: 80%;
    overflow-y: auto;
  }

  .service-data {
    z-index: 10;
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
