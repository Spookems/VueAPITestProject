import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../App.vue'
import UserPage from '../components/Users/UsersIndex.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/users', component: UserPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
