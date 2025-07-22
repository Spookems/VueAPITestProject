<template>
  <div style="display: flex; gap: 1rem; height: 300px; overflow-x: scroll;
  max-width: 100%;">

    <v-card v-for="(entry, index) in weatherData" :key="index" :style="getCardStyle(entry.main.temp)" class="pa-4">
      <div><strong>{{ entry.dt_txt }}</strong></div>
      <div>🌡️ {{ (entry.main.temp - 273.15).toFixed(1) }} °C</div>
      <div>☁️ {{ entry.clouds.all }}%</div>
      <div>💨 {{ entry.wind.speed }} m/s</div>
      <v-btn style="margin-top: 100px;" @click="$emit('details', entry)" color="primary">
        Details
      </v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">


import { defineProps } from 'vue'
import type { WeatherEntry } from '../../Interfaces/WeatherData'

const { weatherData } = defineProps<{
  weatherData: WeatherEntry[]
}>()

function getCardStyle(tempK: number) {
  const tempC = tempK - 273.15
  const redIntensity = Math.min(255, Math.max(0, Math.round((tempC / 40) * 255)))
  return {
    backgroundColor: `rgb(${redIntensity}, 50, 50)`,
    color: '#fff',
    minWidth: 'max-content',
  }
}
</script>
