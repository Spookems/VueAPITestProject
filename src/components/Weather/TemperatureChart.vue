<template>
  <v-card elevation="4" style="width: 300px;">
    <v-card-title>Temperatures</v-card-title>
    <v-card-text>
      <v-responsive style="height: 310px;">
        <canvas ref="chartCanvas"></canvas>
      </v-responsive>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Tooltip,
  Legend
} from 'chart.js'
import type { WeatherEntry } from '../../Interfaces/WeatherData'

const props = defineProps<{
  weatherData: WeatherEntry[]
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let weatherChart: Chart | null = null

function renderChart() {
  if (weatherChart) weatherChart.destroy()
  const labels = props.weatherData.map((w) => w.dt_txt)
  const temps = props.weatherData.map((w) => w.main.temp - 273.15)

  weatherChart = new Chart(chartCanvas.value as HTMLCanvasElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temps,
          backgroundColor: '#1976D2'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  })
}

Chart.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip, Legend)

watch(() => props.weatherData, renderChart, { deep: true })
onMounted(renderChart)
onBeforeUnmount(() => weatherChart?.destroy())
</script>
