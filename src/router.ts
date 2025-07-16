import { createRouter, createWebHistory } from 'vue-router'
import UserSection from '@/components/Users/UserSection.vue'
import WeatherIndex from '@/components/Weather/WeatherIndex.vue'

const routes = [
  { path: '/', component: WeatherIndex },
  { path: '/users', component: UserSection },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
