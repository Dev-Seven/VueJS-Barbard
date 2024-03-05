<template>
  <div class="modal-main">
    <slot />
    <div class="loader-container" v-if="loading">
      <img :src="Loader" class="loader-gif" />
    </div>

    <button class="close-icon" @click="closeModal()">
      <img :src="CloseIcon" />
    </button>
    <div class="btns-resp">
      <button @click="goBack()" :class="final && 'invisible'">
        <img :src="BackIcon" />
      </button>
      <button @click="closeModal()">
        <img :src="GoldenCloseIcon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import GoldenCloseIcon from "@/assets/svg/icons/golden-close.svg";
import CloseIcon from "@/assets/svg/icons/close.svg";
import BackIcon from "@/assets/svg/icons/back-icon.svg";
import Loader from "@/assets/loader.gif";

const { clearBookingData } = useBooking();
const { final, setFinal } = useFinal();

const { toggleModal } = useModal();
const { modalState, setModalState } = useModalState();
const { activeTab, setActiveTab } = useTabs();
const { info, setInfo } = useBarberInfo();
const loading = ref(false);

const closeModal = () => {
  toggleModal(false);
  setTimeout(() => {
    // clearBookingData();
    // setActiveTab(1);
    setInfo(false);
  }, 200);
};

watch([activeTab, modalState], () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
});

const goBack = () => {
  if (info.value) {
    setInfo(false);
  } else {
    if (
      modalState.value < 5 &&
      modalState.value != 1 &&
      modalState.value !== 4
    ) {
      setModalState(modalState.value - 1);
    } else if (modalState.value == 4) {
      setModalState(1);
    }
    if (activeTab.value > 1 && modalState.value > 4) {
      setActiveTab(activeTab.value - 1);
    } else {
      setModalState(4);
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-main {
  border-radius: 0.625rem;
  background: radial-gradient(
    11733.82% 50% at 50% -0%,
    #15172c 0%,
    #0a0a1c 100%
  );
  overflow: hidden;
}

div.modal-main > * {
  font-family: Montserrat !important;
}

.close-icon {
  position: absolute;
  right: -10px;
  top: -10px;
  z-index: 11;
}

.btns-resp {
  display: none;
}

.loader-container {
  z-index: 10;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.664);
  border-radius: 0.625rem;
}

.loader-gif {
  height: 200px;
  width: 200px;
}

@media only screen and (max-width: 599px) {
  .modal-main {
    min-width: 100vw;
    width: 100vw;
    height: 100vh;
    margin: 0;
    border-radius: 0rem;
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
}
</style>
