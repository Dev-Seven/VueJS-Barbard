<template>
  <div class="h-full md:pt-20 sm:pt-5 max-sm:pt-5">
    <div class="flex flex-col gap-y-4">
      <div class="grid grid-cols-2 gap-x-4 gap-y-4">
        <v-text-field
          label="First Name*"
          class="custom-textField sm:col-span-2 max-sm:col-span-2 md:col-span-1"
          v-model="state.firstName"
        ></v-text-field>
        <v-text-field
          label="Last Name*"
          class="custom-textField sm:col-span-2 max-sm:col-span-2 md:col-span-1"
          v-model="state.lastName"
        ></v-text-field>
      </div>
      <CustomPhoneSelect
        :label="'Phone*'"
        :items="['Vietname', 'India', 'USA']"
        :isFilter="true"
        :data="phoneState"
        @selectPhone="selectPhone"
      />
      <v-text-field
        label="Nationality"
        class="custom-textField"
        v-model="state.nationality"
      ></v-text-field>
      <v-text-field
        label="Birth Date"
        type="date"
        v-model="state.birthday"
      ></v-text-field>
    </div>
    <div class="confirm-app-data sm:flex max-sm:flex md:hidden mobile-footer">
      <button class="btn-primary w-full" @click="createUser()">
        <p class="m-0">Confirm Your Appointment</p>
      </button>
    </div>
  </div>
</template>

<script setup>
const { final, setFinal } = useFinal();
const { userForm, setUserForm } = useBooking();

const db = useFirestore();
const user = useCurrentUser();

const phoneState = reactive({
  phone: "",
  code: "+84",
});

const state = reactive({
  firstName: "",
  lastName: "",
  nationality: "",
  birthday: "",
});

const selectPhone = (phone) => {
  phoneState.phone = phone.phone;
  phoneState.code = phone.code;
};

const createUser = async () => {
  const data = {
    ...phoneState,
    ...state,
    email: user.email,
  };
  await createUserWithDetails(db, data);
};

watch([phoneState, state], () => {
  setUserForm({
    ...state,
    phone: phoneState.code + phoneState.phone,
  });
});
</script>

<style lang="scss" scoped>
.confirm-app-data {
  z-index: 10;
  position: fixed;
  padding: 1rem;
  bottom: 0;
  left: 0;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(78, 75, 97, 0.5);
}
</style>
