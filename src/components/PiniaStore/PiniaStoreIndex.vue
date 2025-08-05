<template>
  <Layout>
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item @click="goToUsersSection" link>
          <v-list-item-title>Users Section</v-list-item-title>
        </v-list-item>

        <v-list-item @click="goToWeatherSection" link>
          <v-list-item-title>Weather Section</v-list-item-title>
        </v-list-item>

        <v-list-item link>
          <v-list-item-title><b>Pinia Tests</b></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="gray-darken-4" elevate-on-scroll flat app height="64">
      <v-btn icon @click.stop="drawer = !drawer" aria-label="Toggle navigation">
        <span style="font-size: 24px;">☰</span>
      </v-btn>

      <v-toolbar-title class="text-black" style="max-width: 180px;">Pinia Store Tests</v-toolbar-title>
    </v-app-bar>

    <div class="pa-4">
      <div style="margin: 1rem 0;">
        <PiniaLogo />
      </div>

      <h2>Hello {{ user.name }}</h2>

      <form @submit.prevent="addItemToCart" data-testid="add-items">
        <input type="text" class="input w-25" v-model="itemName" />
        <button>Add</button>
      </form>

      <form @submit.prevent="buy">
        <ul data-testid="items">
          <li v-for="item in cart.items" :key="item.name">
            {{ item.name }} ({{ item.amount }})
            <button class="btn btn-secondary" @click="cart.removeItem(item.name)" type="button">X</button>
          </li>
        </ul>

        <button :disabled="!user.name" class="btn btn-secondary">Buy</button>
        <button :disabled="!cart.items.length" @click="clearCart" type="button" class="btn btn-secondary"
          data-testid="clear">
          Clear the cart
        </button>
      </form>
    </div>
  </Layout>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../Classes/user'
import { useCartStore } from '../../Classes/cart'
import PiniaLogo from './PiniaLogo.vue'

export default defineComponent({
  components: { PiniaLogo },

  setup() {
    const drawer = ref(false)
    const group = ref(null)
    const router = useRouter()

    const user = useUserStore()
    const cart = useCartStore()

    const itemName = ref('')

    function goToWeatherSection() {
      drawer.value = false
      router.push('/weather')
    }

    function goToUsersSection() {
      drawer.value = false
      router.push('/users')
    }

    function addItemToCart() {
      if (!itemName.value) return
      cart.addItem(itemName.value)
      itemName.value = ''
    }

    function clearCart() {
      if (window.confirm('Are you sure you want to clear the cart?')) {
        cart.rawItems = []
      }
    }

    async function buy() {
      alert('Purchasing items...')
      const n = await cart.purchaseItems()
      console.log(`Bought ${n} items`)
      cart.rawItems = []
    }

    watch(group, () => {
      drawer.value = false
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.stores = { user, cart }

    return {
      drawer,
      group,
      itemName,
      user,
      cart,
      goToWeatherSection,
      goToUsersSection,
      addItemToCart,
      clearCart,
      buy,
    }
  },
})
</script>

<style scoped>
img {
  width: 200px;
}

button,
input {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
