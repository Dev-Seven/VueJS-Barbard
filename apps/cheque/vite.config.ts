import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        cleanupOutdatedCaches: true,
      },
      includeAssets: [],
      manifest: {
        name: "Barbaard Cheque",
        short_name: "Barbaard Cheque",
        description: "Barbaard managment Cheque app",
        icons: [
          {
            src: "/favicon/apple-touch-icon.png",
            sizes: "120x120",
            type: "image/png",
          },
          {
            src: "/favicon/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
          },
          {
            src: "/favicon/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png",
          },
          {
            src: "/favicon/android-chrome-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "/favicon/safari-pinned-tab.svg",
            type: "image/svg",
          },
          {
            src: "/assets/images/logo.svg",
            type: "image/svg",
          },
          {
            src: "/assets/images/service.svg",
            type: "image/svg",
          },
        ],
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#3367D6",
        display: "standalone",
        scope: "/",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env": JSON.stringify(process.env),
  },
});
