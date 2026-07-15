import { createRouter, createWebHistory } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
  }
}

const APP_NAME = 'Mortgage Prequal Dashboard';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { title: 'Dashboard' },
    },
    {
      path: '/applications/new',
      name: 'new-application',
      component: () => import('@/views/NewApplicationView.vue'),
      meta: { title: 'New Application' },
    },
    {
      path: '/applications/:id',
      name: 'application-detail',
      component: () => import('@/views/ApplicationDetailView.vue'),
      meta: { title: 'Application Detail' },
    },
    {
      path: '/applications/:id/edit',
      name: 'application-edit',
      component: () => import('@/views/EditApplicationView.vue'),
      meta: { title: 'Edit Application' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Not Found' },
    },
  ],
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${APP_NAME}` : APP_NAME;
});

export default router;
