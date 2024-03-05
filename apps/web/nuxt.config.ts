export default defineNuxtConfig({
  // Having SSR allows us to use `nuxt generate`, turn it off if you don't care
  ssr: false,
  devtools: { enabled: true },

  app: {
    head: {
      title: "Barbaard Booking",
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+SC&family=Montserrat:wght@400;700&family=Playfair+Display&display=swap'",
        },
      ],
    },
  },
  components: [
    { path: "~/components", extensions: ["vue"] },
    { path: "~/components/LandingPages", extensions: ["vue"] },
    { path: "~/components/Modals", extensions: ["vue"] },
    { path: "~/components/ModalComponents", extensions: ["vue"] },
    { path: "~/components/Swiper", extensions: ["vue"] },
  ],

  css: [
    "@/assets/css/global.scss",
    "@/assets/css/tailwind.css",
    "vuetify/styles/main.sass",
  ],

  nitro: {
    prerender: {
      routes: ["/"],
    },
    preset: "firebase",
    firebase: {
      gen: 1,
      serverFunctionName: "nuxtserver",
      region: "asia-southeast2",
      nodeVersion: "18",
      runtimeOptions: {
        maxInstances: 10,
      },
    },
  },

  modules: [
    "nuxt-vuefire",
    "@vueuse/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-swiper",
  ],

  build: {
    transpile: ["vuetify", "swiper"],
  },

  vuefire: {
    emulators: {
      // uncomment this line to run the application in production mode without emulators during dev
      enabled: true,
      auth: {
        options: {
          disableWarnings: false,
        },
      },
    },
    auth: {
      enabled: true
    },
    appCheck: {
      provider: "ReCaptchaV3",
      debug: process.env["VITE_FIREBASE_APPCHECK_DEBUG_TOKEN"] as string,
      // site key, NOT secret key
      key: process.env["VITE_FIREBASE_APPCHECK_TOKEN"] as string,
      isTokenAutoRefreshEnabled: true,
    },

    config: {
      apiKey: process.env["VITE_FIREBASE_API_KEY"] as string,
      authDomain: process.env["VITE_FIREBASE_AUTH_DOMAIN"] as string,
      databaseURL: process.env["VITE_FIREBASE_DATABASE_URL"] as string,
      projectId: process.env["VITE_FIREBASE_PROJECT_ID"] as string,
      storageBucket: process.env["VITE_FIREBASE_STORAGE_BUCKET"] as string,
      messagingSenderId: process.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] as string,
      appId: process.env["VITE_FIREBASE_APP_ID"] as string,
      measurementId: process.env["VITE_FIREBASE_MEASUREMENT_ID"] as string,
    },
  },

  experimental: {
    payloadExtraction: false,
  },
});
