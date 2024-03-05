import { defineStore } from "pinia";
import { ref } from "vue";

// type definition for ChekState

export const useCheckStore = defineStore("check", () => {
  const activeStep = ref<Number>(1);
  function set_cehck_step(value: Number) {
    activeStep.value = value;
  }
  return { activeStep, set_cehck_step };
});

// define pinia store
// export const useCheckStore = defineStore({
//   id: 'check',
//   state: (): CheckState => ({
//     activeStep: 1
//   }),
//   actions: {
//     set_cehck_step(value: number) {
//       this.activeStep = value
//     }
//   }
// })
