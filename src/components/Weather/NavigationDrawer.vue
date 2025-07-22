<template>
  <v-navigation-drawer app permanent>
    <v-list nav dense>
      <v-list-item-title class="text-h6 px-4 py-2">Actions</v-list-item-title>
      <v-divider></v-divider>
      <v-list-item>
        <v-btn block color="primary" @click="$emit('get-message')">Get Message from API</v-btn>
      </v-list-item>
      <v-list-item>
        <v-btn block color="secondary" @click="$emit('get-weather')">Get Weather Data</v-btn>
      </v-list-item>
      <v-list-item>
        <v-btn block color="secondary" @click="$emit('get-weather')">AG-Grid breakdown</v-btn>
      </v-list-item>
      <v-list-item>
        <v-select :model-value="selectedLocationId" @update:model-value="$emit('update:selected-location-id', $event)"
          :items="locations" item-title="name" item-value="id" label="Select Location" dense outlined class="mb-2" />
      </v-list-item>
      <v-list-item>
        <v-btn block color="secondary" @click="goToUsersSection">Go to About</v-btn>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router'

const router = useRouter()

function goToUsersSection() {
  router.push('/users')
}

defineProps({
  locations: Array,
  selectedLocationId: Number
})

defineEmits(['get-message', 'get-weather', 'update:selected-location-id'])
</script>
