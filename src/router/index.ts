import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import ExtensionDetail from '@/components/ExtensionDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/extension/:id',
    name: 'ExtensionDetail',
    component: ExtensionDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
