import { createRouter, createWebHistory } from 'vue-router'
import UserSection from '@/components/Users/UserSection.vue'
import WeatherIndex from '@/components/Weather/WeatherIndex.vue'
import PiniaStoreIndex from './components/PiniaStore/PiniaStoreIndex.vue'

const routes = [
  { path: '/', component: WeatherIndex },
  { path: '/users', component: UserSection },
  { path: '/weather', component: WeatherIndex },
  { path: '/piniaStore', component: PiniaStoreIndex },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
