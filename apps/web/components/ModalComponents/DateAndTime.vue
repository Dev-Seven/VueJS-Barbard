<template>
  <div
    class="dateTimeContainer flex flex-col md:gap-y-3 sm:gap-y-4 max-sm:gap-y-4 no-scrollbar"
  >
    <div
      class="flex xl:flex-row lg:flex-col max-lg:flex-col justify-between items-center md:gap-y-4 sm:gap-y-6 max-sm:gap-y-6"
    >
      <div class="month-swiper">
        <SwiperMain
          class="h-full"
          :slidesPerView="1"
          :spaceBetween="20"
          @slideChange="monthSlideChange"
        >
          <SwiperSlide v-for="(slide, idx) in months" :key="idx">
            <p
              class="m-0 text-sm uppercase font-montserrat font-bold md:block sm:hidden max-sm:hidden"
            >
              {{ slide.month }} {{ slide.year }}
            </p>
            <p
              class="m-0 text-sm uppercase font-montserrat font-bold md:hidden sm:block max-sm:block"
            >
              {{ slide.month.substring(0, 3) }} {{ slide.year }}
            </p>
          </SwiperSlide>
        </SwiperMain>
      </div>
      <div class="day-swiper lg:block max-lg:block xl:hidden">
        <SwiperMain :slidesPerView="5" @slideChange="daySlideChange">
          <SwiperSlide class="w-7"></SwiperSlide>
          <SwiperSlide v-for="(slide, idx) in days" :key="idx">
            <button
              class="day-card flex flex-col text-center"
              @click="activeDay = idx"
              :class="activeDay == idx && 'activeDay'"
            >
              <p class="text-[0.75rem] golden-text uppercase w-full">
                {{ slide.day.substring(0, 3) }}
              </p>
              <p class="text-base uppercase w-full font-montserrat">
                {{ slide.date }}
              </p>
            </button>
          </SwiperSlide>
        </SwiperMain>
      </div>
      <div class="md:w-full max-md:w-full lg:w-3/6 sm:px-8 md:px-0 with-filter">
        <CustomVSelect
          :label="'Showing all barbers'"
          :items="userData"
          :isFilter="true"
          :isMultiple="true"
          @selected="selectBarbers"
        />
      </div>
    </div>
    <hr class="xl:block lg:hidden max-lg:hidden" />
    <div class="day-swiper xl:block lg:hidden max-lg:hidden">
      <SwiperMain :slidesPerView="9" @slideChange="daySlideChange">
        <!-- <SwiperSlide class="w-7"></SwiperSlide> -->
        <SwiperSlide v-for="(slide, idx) in days" :key="idx">
          <button
            class="day-card flex flex-col text-center"
            @click="activeDay = idx"
            :class="activeDay == idx && 'activeDay'"
          >
            <p class="text-[0.75rem] golden-text uppercase w-full">
              {{ slide.day.substring(0, 3) }}
            </p>
            <p class="text-base uppercase w-full font-montserrat">
              {{ slide.date }}
            </p>
          </button>
        </SwiperSlide>
      </SwiperMain>
    </div>
    <div
      class="time-slots no-scrollbar flex flex-col gap-y-[1.31rem] max-lg:hidden lg:hidden xl:flex"
    >
      <hr />
      <div class="grid grid-cols-7" v-for="(item, index) in timeSheetData">
        <div class="col-span-2">
          <div class="flex items-center gap-x-1">
            <div class="user-image">
              <img :src="User" />
            </div>
            <div class="flex flex-col">
              <p class="text-base golden-text">{{ item.fullName }}</p>
              <div class="flex gap-x-2 flex-wrap">
                <p class="font-montserrat opacity-60 text-[0.75rem]">
                  {{ item.nickName }}
                </p>
                <div class="flex">
                  <img :src="Star" class="user-star" />
                  <p class="font-montserrat opacity-60 text-[0.75rem]">
                    <!-- {{ item.rating }} -->
                    4.8
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="time-swiper col-span-5">
          <SwiperMain :slidesPerView="5" class="h-full">
            <!-- <SwiperSlide class="w-7"></SwiperSlide> -->
            <SwiperSlide v-for="(slide, idx) in item.timesheet" :key="idx">
              <button class="time-card" @click="selectTime(item, slide)">
                <p class="text-sm text-black font-montserrat font-bold">
                  {{ slide }}
                </p>
              </button>
            </SwiperSlide>
          </SwiperMain>
        </div>
      </div>
    </div>

    <div
      class="time-slot-resp lg:flex max-lg:flex flex-col gap-y-3 xl:hidden no-scrollbar"
    >
      <div class="flex flex-col gap-y-3" v-for="(item, index) in timeSheetData">
        <hr />
        <div class="">
          <div class="flex justify-between w-full">
            <div class="flex gap-x-[0.63rem] items-center">
              <div class="user-image">
                <img :src="User" />
              </div>
              <div class="flex flex-col">
                <p class="text-base golden-text">{{ item.fullName }}</p>
                <div class="flex gap-x-2 flex-wrap">
                  <p class="font-montserrat opacity-60 text-[0.75rem]">
                    {{ item.nickName }}
                  </p>
                  <div class="flex gap-x-1">
                    <img :src="Star" class="user-star" />
                    <p class="font-montserrat opacity-60 text-[0.75rem]">
                      <!-- {{ item.rating }} -->
                      4.8
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <img
              :src="Info"
              class="mix-blend-luminosity"
              @click="setInfo(true)"
            />
          </div>
        </div>
        <div class="time-swiper flex gap-x-2 no-scrollbar">
          <div v-for="(slide, idx) in item.timesheet" :key="idx">
            <button class="time-card" @click="selectTime(item, slide)">
              <p class="text-sm text-black font-montserrat font-bold">
                {{ slide }}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="date-time-data flex flex-col gap-y-4 sm:flex max-sm:flex md:hidden mobile-footer"
    >
      <!-- v-if="!isService" -->
      <div class="flex justify-between">
        <p class="text-[0.875rem] font-montserrat">
          {{
            bookingData && bookingData?.dateTime
              ? `${bookingData?.dateTime?.barber?.fullName} - ${bookingData?.dateTime?.slot}`
              : "Not selected"
          }}
        </p>
        <div class="flex gap-x-1 items-center">
          <p class="text-base font-montserrat">Total: đ{{ getTotalPrice() }}</p>
        </div>
      </div>

      <button
        class="btn-primary w-full"
        @click="setActiveTab(activeTab + 1)"
        v-if="bookingData && bookingData?.dateTime"
      >
        <p class="m-0">Confirm Date & Time</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import Info from "@/assets/svg/icons/white-info.svg";
import Star from "@/assets/svg/icons/star.svg";
import User from "@/assets/images/user1.png";
import moment from "moment";

const db = useFirestore();

const { bookingData, setBookingData } = useBooking();
const { activeTab, setActiveTab } = useTabs();
const { info, setInfo } = useBarberInfo();

const activeDay = ref(0);

let data = await getTimesheet(db, moment().format("DD-MM-YYYY"));

const userData = reactive({
  barbers: data,
});
const timeSheetData = ref(data);

//--------- Filter Barber Emit From Drodown --------------
const selectBarbers = (barbers) => {
  timeSheetData.value = barbers.value;
};

//---------- Select Date & Time--------------------------
const selectTime = (parent, child) => {
  let data = {
    name: "dateTime",
    value: {
      barber: parent,
      slot: child,
      data: months.value[activeMonthIndex.value],
      day: days.value[activeDay.value],
    },
  };
  setBookingData(data);
};

const months = ref(generateMonthsArray());
const days = ref(getDaysArray(moment().month(), moment().year()));

const activeMonthIndex = ref(0);
const monthSlideChange = (swiper) => {
  if (swiper) {
    activeMonthIndex.value = swiper.activeIndex;
    days.value = getDaysArray(
      months.value[swiper.activeIndex].monthNum,
      parseInt(months.value[swiper.activeIndex].year),
    );
    activeDay.value = 0;
  }
};
const daySlideChange = (swiper) => {
  if (swiper && swiper.activeIndex > 0) {
    if (swiper.previousIndex > swiper.activeIndex) {
      activeDay.value--;
    } else {
      activeDay.value++;
    }
  }
};

function generateMonthsArray() {
  const monthsArray = [];
  const currentMonth = moment();

  for (let i = 0; i < 18; i++) {
    const monthInfo = {
      month: currentMonth.format("MMMM"),
      year: currentMonth.format("YYYY"),
      monthNum: currentMonth.month() + 1,
      id: currentMonth.format("MMM-YY").toLowerCase(),
    };

    monthsArray.push(monthInfo);
    currentMonth.add(1, "month");
  }

  return monthsArray;
}

function getDaysArray(month, year) {
  const currentDate = moment();
  const inputDate = moment({ year, month: month - 1 });
  const daysArray = [];
  const isFutureDate = inputDate.isAfter(currentDate, "month");

  const startDate = isFutureDate ? inputDate : currentDate;

  const endDate = moment(startDate).endOf("month");

  while (startDate.isSameOrBefore(endDate, "day")) {
    daysArray.push({
      day: startDate.format("dddd"),
      date: startDate.format("DD"),
    });

    startDate.add(1, "day");
  }

  return daysArray;
}

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

watch([activeDay, activeMonthIndex], async () => {
  const data = {
    ...months.value[activeMonthIndex.value],
    ...days.value[activeDay.value],
  };
  const formattedDate = moment(
    `${data.date} ${data.month} ${data.year}`,
    "DD MMMM YYYY",
  ).format("DD-MM-YYYY");

  const result = await getTimesheet(db, formattedDate);
  userData.barbers = result;
  timeSheetData.value = result;
});
</script>

<style lang="scss" scoped>
.dateTimeContainer {
  overflow-y: auto;
}
.month-swiper {
  width: 230px;
  height: 100%;
  min-height: 30px;
}

.day-swiper {
  width: 100%;
}

.day-card {
  border-radius: 0.3125rem;
  border: 2px solid #ef9934;

  min-width: 2.8125rem;
  opacity: 0.3;
}

.custom-select {
  height: 40px !important;
}

.user-image {
  width: 2.5rem;
  height: 2.5rem;
  min-width: 2.5rem;
  border-radius: 2.5rem;
  border: 1px solid #736144;
}

.user-star {
  height: 15px;
}

.time-swiper {
  width: 100%;
}

.time-card {
  border-radius: 0.3125rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: #f6d69a;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);

  display: flex;
  padding: 0.3125rem 0.375rem;
  flex-direction: column;
  align-items: center;
  min-width: 45px;
}

.time-slots {
  height: 350px;
  overflow-y: auto;
}

.activeDay {
  opacity: 1 !important;
}

@media only screen and (min-width: 800px) and (max-width: 1200px) {
  .time-swiper {
    width: 100%;
    overflow-x: auto;
  }
}

@media only screen and (min-width: 600px) and (max-width: 799px) {
  .time-swiper {
    width: 100%;
    overflow-x: auto;
  }
}

@media only screen and (max-width: 599px) {
  .day-card {
    min-width: 3.2rem;
    opacity: 0.6;
  }

  .time-slot-resp {
    height: 700px;
    display: flex !important;
    flex-direction: column;
    gap: 14px 0px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .dateTimeContainer {
    //height: 689px;
    height: 100%;
    overflow-y: auto;
  }

  .date-time-data {
    z-index: 10;
    position: fixed;
    padding: 1rem;
    bottom: 0;
    left: 0;
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(78, 75, 97, 0.5);
    backdrop-filter: blur(10px);
  }

  .time-swiper {
    width: 100%;
    overflow-x: auto;
  }

  .month-swiper {
    width: 160px;
  }
}

@media only screen and (max-width: 400px) {
  .time-swiper {
    width: 100%;
    overflow-x: auto;
  }
}
</style>
