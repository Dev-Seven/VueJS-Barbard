// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'

// type Theme = 'light' | 'dark'

// export const useThemeStore = defineStore('theme', () => {
//   const theme = ref<Theme>('light')
//   const isDark = computed(() => theme.value === 'dark')

//   function setTheme(newTheme: Theme) {
//     theme.value = newTheme
//   }

//   return {
//     theme, isDark, setTheme
//   }
// })

import { defineStore } from "pinia";

// type definition for Theme
type Theme = "light" | "dark";

// define theme store
export const useThemeStore = defineStore({
  id: "theme",
  state: () => ({
    theme: "light" as Theme,
  }),
  getters: {
    isDark: (state) => state.theme === "dark",
  },
  actions: {
    setTheme(theme: Theme) {
      this.theme = theme;
    },
  },
});
