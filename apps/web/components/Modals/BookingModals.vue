<template>
  <ModalLayout>
    <div class="booking-modals grid grid-cols-8" v-if="!final">
      <div
        class="modal-left max-sm:col-span-8 sm:col-span-8 md:col-span-5"
        v-if="!info"
      >
        <div
          class="main-container flex flex-col justify-between h-full md:p-[1rem] lg:p-[1.87rem] relative z-10 p-4 pt-20"
          :style="{
            maxHeight: widthDimension < 600 && `calc(100vh - ${size + 5}px)`,
          }"
        >
          <!-- <p class="text-base text-white">{{ footerHeight }}</p> -->
          <div
            class="flex flex-col gap-y-2 sm:mt-[10vh] max-sm:mt-[10vh] md:mt-0 mb-6"
            :class="
              (activeTab == 4 || activeTab == 5) &&
              'sm:hidden max-sm:hidden md:flex'
            "
          >
            <h3
              class="text-2xl sm:text-center max-sm:text-center md:text-start max-sm:hidden sm:hidden md:block"
            >
              {{
                activeTab <= 4
                  ? `Choose your ${tabs[activeTab - 1]?.name}`
                  : tabs[activeTab - 1]?.name
              }}
            </h3>
            <h3
              class="text-[1.5rem] sm:text-center max-sm:text-center md:text-start max-sm:block sm:block md:hidden"
              :class="activeTab == 4 && 'hide-it'"
            >
              {{
                activeTab <= 4
                  ? `Select your ${tabs[activeTab - 1].name}`
                  : tabs[activeTab - 1].name
              }}
            </h3>
            <p
              class="text-sm font-montserrat opacity-60 max-sm:hidden sm:hidden md:block"
            >
              {{ getTitles() }}
            </p>
          </div>

          <div v-if="activeTab == 1" class="h-full">
            <Locations />
          </div>

          <div v-if="activeTab == 2" class="h-full">
            <Services />
          </div>

          <div v-if="activeTab == 3" class="h-full">
            <Upgrades />
          </div>

          <div v-if="activeTab == 4" class="h-full">
            <DateAndTime />
          </div>

          <div v-if="activeTab == 5" class="h-full">
            <ConfirmAppointment @createEvent="createEvent" />
          </div>

          <div v-if="activeTab == 6" class="h-full py-4">
            <WhoForm />
          </div>

          <button
            class="gap-x-3 items-center max-sm:hidden sm:hidden md:flex mt-2"
            @click="
              activeTab > 1
                ? setActiveTab(activeTab - 1)
                : !!alreadyUser &&
                  lastAppointmentData.length &&
                  setModalState(4)
            "
          >
            <img :src="BackIcon" alt="back" />
            <p class="text-sm golden-text uppercase">Back</p>
          </button>
        </div>

        <!-- -------------- Background Set -------------------- -->
        <div
          class="bg-set"
          :class="
            activeTab == 1
              ? 'bg-set'
              : activeTab == 2
                ? 'bg-service'
                : activeTab == 3
                  ? 'bg-upgrade'
                  : activeTab == 4
                    ? 'no-bg'
                    : 'bg-standing'
          "
        ></div>
      </div>
      <div v-if="info" class="col-span-8">
        <div>
          <img :src="UserInfo" class="user-info-img w-full" />
          <div
            class="lg:px-[1.25rem] lg:py-1 md:px-4 sm:px-4 max-sm:px-2 max-h-[350px] overflow-y-auto"
          >
            <h5 class="text-xl golden-text">
              {{ bookingData?.dateTime?.barber?.fullName ?? "Meet Qui" }}: An
              Artist in every way
            </h5>
            <p class="text-[0.875rem] text-white font-montserrat">
              Lorem ipsum dolor sit amet consectetur. Hac aliquam nisl risus
              pellentesque. Scelerisque sagittis elementum velit metus amet
              nulla. Cursus scelerisque condimentum a quam risus diam
              adipiscing. <br /><br />Cursus in aenean aliquam mi tincidunt erat
              quis. Erat nisl vitae urna adipiscing leo in at. Purus urna
              adipiscing lorem magna mauris nibh mi nisi laoreet. Tellus
              pharetra eget faucibus sem egestas pulvinar.
            </p>
          </div>
        </div>
      </div>

      <!-- --------------- Right Modal----------------------- -->
      <div class="modal-right col-span-3">
        <div class="flex flex-col justify-between h-full">
          <div v-if="!isDateTime() || activeTab !== 4">
            <div class="py-[1.63rem] md:px-[1rem] lg:px-[1.25rem]">
              <h3 class="text-2xl text-white">Your Booking</h3>
            </div>

            <button
              class="tabs flex justify-between items-center"
              v-for="(item, index) in tabs.filter((item) => item.id <= 4)"
              :key="index"
              :class="activeTab == item.id ? 'active-tab' : 'inactive-tab'"
            >
              <!-- @click="setActiveTab(item.id)" -->
              <div class="flex flex-col gap-y-1">
                <h4
                  class="text-[1.375rem] text-start"
                  :class="activeTab == item.id && 'golden-text'"
                >
                  {{ item.name }}
                </h4>
                <p class="text-sm text-start">
                  {{ getTabDesc(item) }}
                </p>
              </div>
              <img :src="Tick" alt="true" v-if="isSelected(item)" />
            </button>
          </div>

          <div v-if="isDateTime() && activeTab == 4">
            <img :src="UserInfo" class="user-info-img w-full" />
            <div
              class="lg:px-[1.25rem] lg:py-1 md:px-4 max-h-[350px] overflow-y-auto"
            >
              <h5 class="text-xl golden-text">
                {{ bookingData?.dateTime?.barber?.fullName }}: An Artist in
                every way
              </h5>
              <p class="text-[0.875rem] text-white font-montserrat">
                Lorem ipsum dolor sit amet consectetur. Hac aliquam nisl risus
                pellentesque. Scelerisque sagittis elementum velit metus amet
                nulla. Cursus scelerisque condimentum a quam risus diam
                adipiscing. <br /><br />Cursus in aenean aliquam mi tincidunt
                erat quis. Erat nisl vitae urna adipiscing leo in at. Purus urna
                adipiscing lorem magna mauris nibh mi nisi laoreet. Tellus
                pharetra eget faucibus sem egestas pulvinar.
              </p>
            </div>
          </div>

          <div class="px-[1.25rem] pb-[1.63rem] flex flex-col gap-y-4">
            <!-- v-model="ex4" -->
            <div v-if="activeTab == 1">
              <CustomVCheckbox
                :label="'Remember my location next time'"
                :value="rememberLocation"
                @changeHandler="rememberLocation = !rememberLocation"
              />
            </div>
            <div
              class="golden-outline-card flex gap-x-2"
              v-if="activeTab == 2 || activeTab == 3"
            >
              <div>
                <img :src="Information" alt="info" class="mt-1" width="30" />
              </div>
              <p class="text-sm golden-text font-montserrat">
                Select multiple
                {{ tabs[activeTab - 1].name.toLowerCase() }} to receive combo
                discounts
              </p>
            </div>
            <div v-if="activeTab > 3">
              <p
                class="text-sm font-montserrat golden-text text-end cursor-pointer"
                v-if="activeTab > 4"
              >
                Promotion code?
              </p>
              <h6
                class="text-[1.375rem] text-white text-end font-montserrat mt-1"
              >
                Total:{{ getTotalPrice() }}
              </h6>
            </div>
            <button
              class="btn-primary w-full"
              :disabled="isNextDisabled()"
              @click="goNext()"
            >
              <p class="m-0">
                {{ getButtonTitle() }}
              </p>
            </button>
          </div>
        </div>
      </div>

      <!-- ----------- Mobile Location Footer ---------------- -->
      <div
        v-if="activeTab == 1"
        class="remember-bg sm:flex md:hidden mobile-footer flex-col gap-y-2"
        ref="mobileFooter"
      >
        <CustomVCheckbox
          :label="'Remember my location next time'"
          :value="rememberLocation"
          @changeHandler="rememberLocation = !rememberLocation"
        />
        <button
          class="btn-primary w-full"
          @click="setActiveTab(activeTab + 1)"
          v-if="bookingData && bookingData.location"
        >
          <p class="m-0">Confirm Date & Time</p>
        </button>
      </div>

      <!-- ---------------- Mobile Dots-------------------- -->
      <div class="max-sm:flex sm:flex md:hidden gap-x-3 nav-resp">
        <div
          v-for="(item, index) in tabs.filter((item) => item.id <= 5)"
          class="dot"
          :class="activeTab >= index + 1 && 'active-dot'"
        ></div>
        <!-- @click="setActiveTab(item.id)" -->
      </div>
    </div>

    <!-- ------------- Final Modal------------------------ -->
    <div v-if="final" class="booking-modals h-full">
      <Confirmed />
    </div>
  </ModalLayout>
</template>

<script setup>
import Tick from "@/assets/svg/icons/tick-mark.svg";
import BackIcon from "@/assets/svg/icons/back-icon.svg";
import Information from "@/assets/svg/icons/information.svg";
import UserInfo from "@/assets/images/user-info.png";
import moment from "moment";
import { getFunctions } from "firebase/functions";
import { httpsCallable } from "firebase/functions";

const app = useFirebaseApp();

const createEventFunction = httpsCallable(getFunctions(app), "createEvent");

const db = useFirestore();
const user = useCurrentUser();
const { lastAppointmentData } = bookData();

const mobileFooter = ref(null);
const rememberLocation = ref(false);
const alreadyUser = await checkUserData(db, user);

const footerHeight = useState("footerHeight", () => 110);
const widthDimension = useState("widthDimension", () => window.innerWidth);

const { bookingData, userForm, clearBookingData } = useBooking();

const { isUser, setModalState } = useModalState();

const { size, setSize } = useFooterSize();
const { info, setInfo } = useBarberInfo();

const { final, setFinal } = useFinal();

const { activeTab, setActiveTab } = useTabs();

let tabs = [
  {
    id: 1,
    name: "Location",
    key: "location",
    desc: bookingData?.location
      ? bookingData.location.name
      : "No location selected",
  },
  {
    id: 2,
    name: "Services",
    key: "service",
    desc: "No services selected",
  },
  {
    id: 3,
    name: "Upgrades",
    key: "upgrade",
    desc: "No upgradres selected",
  },
  {
    id: 4,
    name: "Date & time",
    key: "dateTime",
    desc: "No date & time selected",
  },
  {
    id: 5,
    name: "Almost There",
    key: "almostThere",
    desc: "No date & time selected",
  },
  {
    id: 6,
    name: "Who are you?",
    key: "whoareyou",
    desc: "No date & time selected",
  },
];

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

const getTitles = () => {
  if (activeTab.value == 1) {
    return "Select the location of your preference";
  } else if (activeTab.value == 2) {
    return "Select one or more services for your visit";
  } else if (activeTab.value == 3) {
    return "Select one or more upgrades for your visit";
  } else if (activeTab.value == 4) {
    return "Select a suitable time and your barber of preference";
  } else if (activeTab.value == 5) {
    return "Double check your booking and add extra information";
  } else if (activeTab.value == 6) {
    return "Please fill out your details";
  } else {
    return "";
  }
};

const getTabDesc = (item) => {
  const selectedValue = bookingData?.value?.[item.key];

  if (Array.isArray(selectedValue)) {
    return `${selectedValue.length || "No"} ${item.name} Selected`;
  } else if (selectedValue) {
    if (item.key == "dateTime") {
      return `${selectedValue?.barber?.fullName} - ${moment(
        `${selectedValue?.day?.date} ${selectedValue?.data?.month}`,
        "DD MMMM",
      ).format("MMM Do")}, ${selectedValue?.slot}`;
    }
    return selectedValue.name;
  }

  return `No ${item.name} Selected`;
};

const isNextDisabled = () => {
  if (activeTab.value == 1 && !bookingData.value?.location) {
    return true;
  } else if (activeTab.value == 2 && !bookingData.value?.service?.length) {
    return true;
    // }
    // else if (activeTab.value == 3) {
    //   return true;
  } else if (activeTab.value == 4 && !bookingData.value?.dateTime) {
    return true;
  } else if (activeTab.value == 5 && !bookingData.value?.almostThere) {
    return true;
  } else {
    return false;
  }
};

const getButtonTitle = () => {
  if (activeTab.value == 4) {
    return "Confirm Date & Time";
  } else if (activeTab.value == 5) {
    return "Confirm your appointment";
  } else if (activeTab.value == 6) {
    return "Final Check";
  } else {
    return `Next: Select ${tabs[activeTab.value].name}`;
  }
};

const isSelected = (item) => {
  if (bookingData.value) {
    if (
      item.id == 2 &&
      bookingData.value?.service &&
      bookingData.value?.service?.length
    ) {
      return true;
    } else if (item.id == 1 && bookingData.value?.location) {
      return true;
    } else if (
      item.id == 3 &&
      bookingData.value?.upgrade &&
      bookingData.value?.upgrade?.length
    ) {
      return true;
    } else if (item.id == 4 && bookingData.value?.dateTime) {
      return true;
    }
  }

  return false;
};

const isDateTime = () => {
  // if (bookingData.value && bookingData.value.dateTime) {
  //   return true;
  // }
  return false;
};

const goNext = () => {
  if (activeTab.value < 5) {
    setActiveTab(activeTab.value + 1);
  } else if (activeTab.value == 5 && !alreadyUser) {
    setActiveTab(activeTab.value + 1);
  } else {
    createEvent();
  }
};

const createEvent = async () => {
  if (!alreadyUser && userForm.value) {
    await createUserWithDetails(db, {
      ...userForm.value,
      email: user.value.email,
      fullName: userForm.value.firstName + " " + userForm.value.lastName,
      birthday: new Date(
        moment(userForm.value.birthday, "YYYY-MM-DD").format("LLLL"),
      ),
      createdAt: new Date(),
    });
  }

  const userData = await getUserData(db, user.value.email);

  const dateData = {
    ...bookingData.value.dateTime?.data,
    ...bookingData.value.dateTime?.day,
    slot: bookingData.value.dateTime?.slot,
  };

  let startDate = new Date(
    moment(
      `${dateData.slot} ${dateData.date}-${dateData.monthNum}-${dateData.year}`,
      "HH:mm DD-MM-YYYY",
    ).format(),
  );

  let reminderDate = new Date(moment(startDate).subtract(2, "hours").format());

  let endDate = new Date(
    moment(startDate).add(
      "minutes",
      bookingData.value.dateTime.barber.timeData.serviceTime,
    ),
  );

  const eventData = {
    firstVisit: true,
    internalNote: bookingData.value?.note ?? "",
    reminderDate,
    serviceName: "",
    services: bookingData.value.service
      .filter(
        (item1) =>
          item1.category == "Head & Hair" ||
          item1.category == "Beard & Shaving",
      )
      .map((item) => ({
        duration: item.duration * 60,
        id: item.id,
        name: item.name,
        price: item.price,
        staff: bookingData.value.dateTime.barber.fullName,
        staffId: bookingData.value.dateTime.barber.staffId,
      })),
    staffAny: true,
    staffName: bookingData.value.dateTime.barber.fullName,
    startDate,
    endDate,
    status: "approved",
    type: "appointment",
    updatedAt: new Date(),
    createdAt: new Date(),
    upgrades: bookingData.value?.upgrade ?? [],
    userId: userData.id,
    userName: userData.fullName,
  };
  const location = bookingData.value.location.id;

  const book = bookingData.value;

  await createEventFunction({ location, eventData, book }).then(async (res) => {
    if (res) {
      setFinal(true);
      setActiveTab(1);
      // clearBookingData();
      // await updateTimeSheet(db, bookingData);
    }
  });
  // await createAppointment(db, location, eventData).then(async (res) => {
  //   if (res) {
  //     setFinal(true);
  //     await updateTimeSheet(db, bookingData);
  //     clearBookingData();
  //     setActiveTab(1);
  //   }
  // });
};

onMounted(() => {
  if (document.getElementsByClassName("mobile-footer")) {
    footerHeight.value =
      document.getElementsByClassName("mobile-footer")[0]?.clientHeight;
    setSize(document.getElementsByClassName("mobile-footer")[0]?.clientHeight);
  }
});

watch([activeTab, bookingData, widthDimension], (newIndex) => {
  setTimeout(() => {
    if (document.getElementsByClassName("mobile-footer")) {
      footerHeight.value =
        document.getElementsByClassName("mobile-footer")[0]?.clientHeight;
      setSize(
        document.getElementsByClassName("mobile-footer")[0]?.clientHeight,
      );
    }
  });
});
</script>

<style lang="scss" scoped>
.booking-modals {
  min-height: 680px;
  min-width: 1000px;
}
.modal-left {
  color: white;
  position: relative;
}

.modal-right {
  background: rgba(0, 0, 0, 0.61);
  background: #080815;
}

.tabs {
  width: 100%;
  padding: 0.5rem 1.25rem;
  color: white;
}

.active-tab {
  background: rgba(78, 75, 97, 0.5);
}
.inactive-tab {
  opacity: 0.5;
}

.bg-set {
  position: absolute;
  background: url("@/assets/images/choose-location.png"), #101225b6;

  top: 0px;
  height: 100%;
  width: 100%;
  background-color: #101225;
  opacity: 0.1;

  background-position: top;
  background-repeat: no-repeat;
  background-size: contain;

  pointer-events: none;
}

.bg-service {
  background: url("@/assets/images/bg-service.png"), #101225b6;
  background-color: #101225;
  background-position: top;
  background-repeat: no-repeat;
  background-size: contain;
}
.bg-upgrade {
  background: url("@/assets/images/bg-upgrade.png"), #101225b6;
  background-color: #101225;
  background-position: top;
  background-repeat: no-repeat;
  background-size: contain;
}
.bg-standing {
  background: url("@/assets/images/standing-man.png"), #101225b6;
  background-color: #101225;

  background-repeat: no-repeat;
  background-size: contain;

  background-position: 0px -275px;
  background-repeat: no-repeat;
  background-size: 120%;

  -webkit-mask-image: linear-gradient(
    to bottom,
    black -37%,
    transparent 50%
  ) !important;
}

.no-bg {
  background: none;
}

.location-card {
  width: 100%;
  border-radius: 0.9375rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(78, 75, 97, 0.7);
  // backdrop-filter: blur(25px);
  padding: 0.7rem 0.87rem;
}

.golden-outline-card {
  border: 1px solid #c1a36d;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.61);
  padding: 0.44rem 0.63rem;
}

.user-info-img {
  -webkit-mask-image: linear-gradient(to bottom, black 52%, transparent 100%);
}
.hide-it {
  display: none !important;
}

@media only screen and (min-width: 800px) and (max-width: 1200px) {
  .booking-modals {
    min-height: 100%;
    min-width: 100%;
  }
}

@media only screen and (min-width: 600px) and (max-width: 799px) {
  .booking-modals {
    min-height: 100%;
    min-width: 100%;
  }

  .tabs {
    padding: 0.5rem 1rem;
  }
}

@media only screen and (max-width: 599px) {
  .modal-main {
    min-width: 100vw;
    width: 100vw;
    height: 100vh;
    margin: 0;
  }

  .close-icon {
    display: none;
  }

  .btns-resp {
    z-index: 10;
    position: absolute;
    top: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 1rem;
  }

  .booking-modals {
    min-height: 100%;
    min-width: 100%;
  }

  .modal-right {
    display: none;
  }

  .modal-left {
    padding: 0rem;
  }

  .bg-set {
    opacity: 1;
    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 35%);
  }

  .remember-bg {
    z-index: 10;
    position: absolute;
    padding: 1rem;
    bottom: 0;
    left: 0;
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(78, 75, 97, 0.5);

    div {
      justify-content: center;
      align-items: center;
    }
  }

  .nav-resp {
    position: absolute;
    top: 12px;
    right: calc(50% - 45px);
    padding: 1rem 0;
    z-index: 11;
  }

  .dot {
    height: 10px;
    width: 10px;
    border-radius: 50%;
    background-color: white;
    opacity: 50%;
  }

  .active-dot {
    opacity: 1;
  }

  .main-container {
    overflow-y: auto;
  }
}

@media only screen and (max-width: 400px) {
}
</style>
