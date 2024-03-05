// import { createRouter, createWebHistory } from "vue-router";
// import { getCurrentUser } from "vuefire";

// const router = createRouter({
//   history: createWebHistory(),
//   routes: [
//     {
//       path: "/",
//       component: () => import("./pages/Home.vue"),
//       meta: {
//         requireAuth: true,
//       },
//     },
//     {
//       name: "login",
//       path: "/login",
//       component: () => import("./pages/Login.vue"),
//     },
//     {
//       path: "/cheques/:orderId",
//       component: () => import("./pages/Cheque.vue"),
//       meta: {
//         requireAuth: true,
//       },
//     },
//   ],
// });

// router.beforeEach(async (to) => {
//   if (to.meta.requireAuth) {
//     const currentUser = await getCurrentUser();
//     if (!currentUser) {
//       return {
//         path: "/login",
//       }
//     }
//   }
// });

// export default router;

import { createRouter, createWebHistory } from "vue-router";
import { type RouteRecordRaw } from "vue-router";
import { getCurrentUser } from "vuefire";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("./pages/Home.vue"),
    meta: {
      requireAuth: true,
    },
  },
  {
    name: "login",
    path: "/login",
    component: () => import("./pages/Login.vue"),
  },
  {
    path: "/cheques/:orderId",
    component: () => import("./pages/Cheque.vue"),
    meta: {
      requireAuth: true,
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (to.meta.requireAuth) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        path: "/login",
      };
    }
  }
});
