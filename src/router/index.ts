import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/design',
      name: 'design',
      component: () => import('../views/DesignView.vue')
    },
    {
      path: '/prepare',
      name: 'prepare',
      component: () => import('../views/PrepareView.vue')
    },
    {
      path: '/device',
      name: 'device',
      component: () => import('../views/DeviceView.vue')
    },
    {
      path: '/project-notes',
      name: 'project-notes',
      component: () => import('../views/ProjectNotesView.vue'),
    },
    {
      path: '/ship-it',
      name: 'ship-it',
      component: () => import('../views/ShipItView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
  ]
})

export default router
