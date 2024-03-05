<template>
  <div class="booking-modals h-full w-full flex justify-center items-center">
    <div class="flex flex-col gap-y-24 justify-center py-20">
      <h3
        class="md:text-2xl sm:text-[1.5rem] max-sm:text-[1.5rem] text-white text-center"
      >
        Your booking is confirmed
      </h3>
      <div class="flex flex-col justify-center text-center gap-y-5">
        <p class="text-[1.125rem] text-white text-center">
          We look forward to welcome you on:
        </p>
        <div class="confirm-card">
          <!-- <p class="text-base golden-text">Monday 4 August at 13:15</p> -->
          <p class="text-base golden-text">
            {{
              `${bookingData.dateTime.day.day} ${bookingData.dateTime.day.date} ${bookingData.dateTime.data.month} at ${bookingData.dateTime.slot}`
            }}
          </p>
          <p class="text-base golden-text">
            at {{ bookingData.location.name }}
          </p>
        </div>
        <div class="opacity-60">
          <p class="text-[0.75rem] text-white font-montserrat">
            A confirmation email has been send to
          </p>
          <p class="text-[0.75rem] text-white font-montserrat">
            <!-- tom@barbaard.com. -->
            {{ user.email }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { bookingData } = useBooking();
const user = useCurrentUser();
</script>

<style lang="scss" scoped>
.confirm-card {
  border-radius: 0.9375rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(78, 75, 97, 0.5);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1.45rem;
}
</style>
