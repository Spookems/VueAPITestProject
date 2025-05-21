<!-- eslint-disable vue/block-lang -->
<template>
  <v-card elevation="3" class="pa-6">
    <v-card-title class="text-h6">
      Weather Summary
    </v-card-title>
    <v-card-text>
      <div v-if="locationName">
        <p><strong>📍 City:</strong> {{ locationName }}</p>
        <p><strong>🌡️ Min Temp:</strong> {{ minTemp.toFixed(1) }} °C</p>
        <p><strong>🔥 Max Temp:</strong> {{ maxTemp.toFixed(1) }} °C</p>
        <p><strong>💨 Avg Wind Speed:</strong> {{ avgWindSpeed.toFixed(1) }} m/s</p>
        <p><strong>📝 Summary:</strong> {{ weatherSummary }} </p>
      </div>
      <div v-else>
        <p>No location selected.</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  locationName: String,
  minTemp: { type: Number, default: 0 },
  maxTemp: { type: Number, default: 0 },
  avgWindSpeed: { type: Number, default: 0 }
})

const weatherSummary = computed(() => {
  const max = props.maxTemp ?? 0
  const wind = props.avgWindSpeed ?? 0

  let tempComment = ''
  if (max >= 30) tempComment = "Scorching. Don't forget your SPF 5000."
  else if (max >= 25) tempComment = "Hot and sweaty – great for BBQs, bad for armpits."
  else if (max >= 18) tempComment = "Warm and decent. T-shirt weather."
  else if (max >= 10) tempComment = "Cool – maybe grab a hoodie."
  else if (max >= 0) tempComment = "Chilly. Consider thermals and regrets."
  else tempComment = "Freezing. Stay inside unless you’re a penguin."

  let windComment = ''
  if (wind >= 15) windComment = "Windy as hell – expect hair problems and flying bins."
  else if (wind >= 10) windComment = "Breezy – enough to be annoying."
  else if (wind >= 5) windComment = "Light wind – good kite weather."
  else windComment = "Still and calm – almost eerie."

  return `${tempComment} ${windComment}`
})
</script>
