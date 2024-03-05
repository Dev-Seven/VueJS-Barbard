<script setup>
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  signInWithEmailLink,
} from "firebase/auth";

const user = useCurrentUser();
const db = useFirestore();
const router = useRouter();
const auth = useFirebaseAuth();

const { setModalState } = useModalState();
const { bookingData } = useBooking();
const { userData, setLastAppointmentData } = bookData();

// watch(user, async (currentUser, previousUser) => {
onAuthStateChanged(auth, async (user) => {
  if (user) {
    getData();

    userData.value = user;
    const isData = await checkUserData(db, user);

    if (user.email) {
      const lastAppointmentData = await checkLastAppointment(db, user);
      if (lastAppointmentData.length) {
        setLastAppointmentData(lastAppointmentData);
      }

      if (!!isData || !lastAppointmentData.length) {
        setModalState(5);
      } else {
        setModalState(4);
      }
    }
  } else {
    // console.log("Not Logged In");
    // setModalState(1);
  }
});
// });
watch([userData], () => {
  // console.log("User Info is ::", userData.value);
});

let emailLink = `${window.location.origin}/${router.currentRoute.value.fullPath}`;
if (isSignInWithEmailLink(auth, emailLink) && !user.value) {
  let email = localStorage.getItem("email");
  await signInWithEmailLink(auth, email, emailLink)
    .then((res) => {
      localStorage.setItem("user", JSON.stringify(res));
    })
    .catch((err) => {
      console.log(err);
    });
}

const { setLocations, setServices, setUpgrades } = bookData();

const getData = async () => {
  let locationArray = await getLocations(db);

  if (locationArray.length) {
    setLocations(locationArray);
  }

  let upgradesAray = await getUpgrades(db);
  if (upgradesAray.length) {
    setUpgrades(upgradesAray);
  }
};

watch([bookingData], async (cb) => {
  // console.log(bookingData.value);
});
</script>

<template>
  <div class="overflow-hidden">
    <div class="landing-page-1">
      <LandingFirst />
    </div>
  </div>
</template>

<style scoped>
.landing-page-1 {
  background-image: url("@/assets/images/bg-1.png");
  background-repeat: no-repeat;
  background-size: cover;
  height: 1000px;
  display: flex;
  justify-content: end;
  align-items: center;
}
</style>
