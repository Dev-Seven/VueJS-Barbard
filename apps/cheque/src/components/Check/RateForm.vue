<template>
  <div class="rate-form-holder">
    <div class="form-box" v-if="!submited">
      <div :style="{ visibility: show ? 'visible' : 'hidden' }">
        <h2 class="mt-0 component-title">What could we have done better?</h2>
        <form @submit.prevent="onFormSubmit">
          <base-textarea
            v-model="feedback"
            type="textarea"
            class="mb-1"
            label="Please let us know how we can improve."
            height="5.5625rem"
          />
          <base-switcher
            v-model="followUp"
            class="mb-4"
            label="A manager may contact me."
          />
        </form>
      </div>
      <div class="fixed bottom-8 w-96">
        <div class="flex flex-col gap-3 custom-border-top pt-6">
          <button
            class="w-full base-button yellow"
            @click="onFormSubmit"
            :disabled="!rated"
          >
            NEXT
          </button>

          <button
            class="w-full base-button reversed"
            @click="onSkip"
            :disabled="show || rated"
          >
            CONTINUE WITHOUT RATING
          </button>
        </div>
      </div>
    </div>

    <h2 class="mt-0 component-title" v-else>Thanks for your feedback</h2>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import BaseTextarea from "../BaseTextarea.vue";
import BaseSwitcher from "../BaseSwitcher.vue";

defineProps({
  show: Boolean,
  rated: Boolean,
});

const emit = defineEmits(["onSubmit"]);

let feedback = ref<string>("");
let followUp = ref<boolean>(true);
let submited = ref<boolean>(false);

const onFormSubmit = () => {
  const data = {
    feedback: feedback.value,
    followUp: followUp.value,
  };
  submited.value = true;

  emit("onSubmit", data);
};

const onSkip = () => {
  emit("onSubmit", null);
};
</script>

<style lang="scss" scoped>
.component-title {
  margin-bottom: 1.875rem;
}

.rate-form-holder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 24.0625rem;
  margin: 0 auto;
  min-height: 15.0625rem;
}
</style>
