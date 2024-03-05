<template>
  <ModalLayout>
    <div class="grid lg:grid-cols-2">
      <div class="modal-left relative">
        <div
          class="main-container flex flex-col gap-y-2 lg:gap-y-2 md:gap-y-10 justify-between h-full max-sm:pt-16 md:pt-8"
          :class="`h-[calc(100%-${bottomHeight}px)]`"
        >
          <div class="flex flex-col gap-y-8 h-full overflow-y-auto">
            <div class="flex flex-col gap-y-10 justify-center md:hidden">
              <div class="flex justify-center">
                <img :src="HouseBarbaard" />
              </div>
              <h3
                class="md:text-2xl sm:text-[1.5rem] max-sm:text-[1.5rem] text-center text-white md:hidden"
              >
                {{ pageTitle() }}
              </h3>
            </div>
            <h3 class="text-2xl text-center text-white hidden md:block">
              {{ pageTitle() }}
            </h3>

            <!-- -----------1---------- -->
            <div
              class="flex flex-col justify-between h-full gap-y-2"
              v-if="modalState == 1"
            >
              <Login />
            </div>

            <!-- -----------2---------- -->
            <div
              class="flex flex-col justify-between md:justify-around h-full md:gap-y-6"
              v-if="modalState == 2"
            >
              <SendEmail />
            </div>

            <!-- -----------3---------- -->
            <div
              class="flex flex-col justify-between h-full"
              v-if="modalState == 3"
            >
              <CheckEmail />
            </div>

            <!-- -----------4---------- -->
            <div
              class="flex flex-col justify-between overflow-y-auto mb-[90px]"
              v-if="modalState == 4"
            >
              <WelcomeBack />
            </div>
          </div>

          <p
            class="text-[0.6875rem] text-white text-center font-montserrat opacity-40"
            :class="modalState != 1 && 'hidden md:block'"
          >
            If you are creating a new account,
            <a class="font-montserrat underline cursor-pointer"
              >Terms & Conditions</a
            >
            and
            <a class="font-montserrat underline cursor-pointer"
              >Privacy Policy</a
            >
            will apply. You can also set up your
            <a class="font-montserrat underline cursor-pointer"
              >communication preferences</a
            >
          </p>
        </div>
        <div class="bg-set"></div>
      </div>
      <div class="modal-right">
        <img :src="StandingMan" class="w-full object-cover h-full" />
      </div>
    </div>
  </ModalLayout>
</template>

<script setup>
import StandingMan from "@/assets/images/standing-man.png";
import HouseBarbaard from "@/assets/svg/icons/house-of-barbaard.svg";

const { modalState } = useModalState();

const bottomHeight = useState("bottomHeight", () => 0);
const user = useCurrentUser();
const db = useFirestore();

const userData = await getUserData(db, user?.value?.email ?? user.email);

const pageTitle = () => {
  if (modalState.value == 1) {
    return "Your next appointment";
  } else if (modalState.value == 2 || modalState.value == 3) {
    return "Check your email";
  } else {
    return `Welcome back, ${userData?.firstName ?? "User"}`;
  }
};
</script>

<style lang="scss" scoped>
.modal-left {
  padding: 6.75rem 3rem 1.63rem;
}

@media only screen and (min-width: 800px) and (max-width: 1200px) {
  .modal-left {
    padding: 6.75rem 1rem 1.63rem;
  }
}

@media only screen and (min-width: 600px) and (max-width: 799px) {
  .modal-right {
    display: none;
  }
}

@media only screen and (max-width: 599px) {
  .modal-left {
    height: 100vh;
    padding: 1rem;
    overflow-y: auto;
    min-height: 100vh;
  }
  .bg-set {
    position: absolute;
    background: url("@/assets/images/standing-man.png"), #101225b6;
    background-position: 0px -278px;
    top: -194px;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #101225;
    opacity: 0.1;

    background-position: top;
    background-repeat: no-repeat;
    background-size: contain;
    background-size: 574px;
    pointer-events: none;

    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  }

  .modal-right {
    display: none;
  }
}

@media only screen and (max-width: 400px) {
  .modal-right {
    display: none;
  }
}
</style>
