import { registerSW } from "virtual:pwa-register";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueFire, VueFireAuth, VueFireAppCheck } from "vuefire";
import { firebaseApp } from "./firebase";
import { router } from "./router";
import { createVfm } from "vue-final-modal";
import { ReCaptchaV3Provider } from "@firebase/app-check";
import App from "./App.vue";

import "vue-final-modal/style.css";
import "./theme/core.scss";

registerSW({
  immediate: true,
  onOfflineReady() {},
});

// register modal obj
const vfm = createVfm();

const app = createApp(App);
try {
  app.use(createPinia());
  app.use(router);
  app.use(vfm);
  app.use(VueFire, {
    firebaseApp,
    modules: [
      VueFireAuth(),
      VueFireAppCheck({
        debug: import.meta.env.DEV
          ? import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN
          : false,
        isTokenAutoRefreshEnabled: true,
        provider: new ReCaptchaV3Provider(
          import.meta.env.VITE_FIREBASE_APPCHECK_TOKEN,
        ),
      }),
    ],
  });
} catch (e) {
  console.log("errororor", e);
}

app.mount("#app");
