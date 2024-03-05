<template>
  <div
    class="radial-gradient rebook-card text-white flex flex-col gap-y-[2.13rem] items-center sm:w-full sm:m-4 max-sm:w-full max-sm:m-4 md:w-[600px] md:m-20"
  >
    <div class="flex flex-col gap-y-[0.87rem]">
      <h2 class="golden-text text-4xl tracking-[-0.15625rem] sm:text-center">
        Experience European Luxury
      </h2>
      <h5 class="font-bebas text-xl text-center tracking-[0.08125rem]">
        The perfrect place for Gentlemen
      </h5>
      <p class="text-1 text-center px-10">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque
        mauris, vulputate viverra elementum arcu tempus aliquet sit. Aenean ut
        pellentesque duis est sapien. Quis.
      </p>
    </div>
    <button class="btn-primary" @click="modalShow">
      <p class="m-0">Rebook with any barber</p>
    </button>

    <v-dialog v-model="modal" class="main-modal" @click:outside="modalHide">
      <div
        v-if="
          modalState == 1 ||
          modalState == 2 ||
          modalState == 3 ||
          modalState == 4
        "
      >
        <AuthModals />
      </div>
      <div v-else>
        <BookingModals />
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
const { modal, toggleModal } = useModal();
const { modalState, setModalState } = useModalState();
const { clearBookingData } = useBooking();

const { final, setFinal } = useFinal();
const { lastAppointmentData } = bookData();

const user = useCurrentUser();
const db = useFirestore();

const modalShow = async () => {
  setFinal(false);
  toggleModal(true);
  const isData = await checkUserData(db, user);
  if (user.value) {
    if (!!isData && lastAppointmentData.value.length && modalState.value < 5) {
      setModalState(4);
    } else {
      setModalState(5);
    }
  } else {
    setModalState(1);
  }
};

const modalHide = () => {
  toggleModal(false);
  // setModalState(0);
};

watch(modal, () => {
  if (final.value == true && modal.value == false) {
    clearBookingData();
    setFinal(false);
  }

  if (modal.value == false) {
    // setActiveTab(1);
    // setModalState(0);
    setFinal(false);
  }
});
</script>

<style lang="scss" scoped>
.rebook-card {
  padding: 1.5rem 2.75rem 3rem;
  width: 44rem;
  margin-right: 8.38rem;
}

.main-modal {
  min-width: 1024px;
  width: 1100px;
}

@media only screen and (min-width: 800px) and (max-width: 1200px) {
  .main-modal {
    min-width: 800px;
    width: 750px;
  }
}

@media only screen and (min-width: 600px) and (max-width: 799px) {
  .main-modal {
    min-width: 600px;
    width: 550px;
    height: 100vh;
  }
}

@media only screen and (max-width: 599px) {
  .main-modal {
    min-width: 100vw;
    width: 100vw;
    height: 100vh;
    margin: 0;
  }
}

@media only screen and (max-width: 400px) {
}
</style>
