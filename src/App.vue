<template>
  <v-app>
    <v-dialog v-model="dialog" max-width="1000px">
      <v-card>
        <v-card-title>
          Weather & Grid Tabs
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-tabs v-model="tab">
            <v-tab value="weather">Weather Cards</v-tab>
            <v-tab value="grid">AG-Grid Table
            </v-tab>
          </v-tabs>
          <v-window v-model="tab" class="mt-4">
            <v-window-item value="weather">
              <div style="display: flex; gap: 1rem; overflow-x: auto;">
                <div v-if="selectedWeather" class="mb-4">
                  <h3 class="text-h6">Details for {{ selectedWeather.dt_txt }}</h3>
                  <p>🌡️ Temp: {{ (selectedWeather.main.temp - 273.15).toFixed(1) }} °C</p>
                  <p>☁️ Clouds: {{ selectedWeather.clouds.all }}%</p>
                  <p>💨 Wind: {{ selectedWeather.wind.speed }} m/s</p>
                  <v-progress-linear :model-value="selectedWeather.wind.speed * 3" height="10" color="blue" />
                </div>
              </div>
            </v-window-item>
            <v-window-item value="grid">
              <ag-grid-vue class="ag-theme-alpine" style="height: 300px; width: 100%;" :rowData="weatherData"
                :columnDefs="gridColumns" :domLayout="'autoHeight'"
                :defaultColDef="{ resizable: true, sortable: true }" />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-main>

      <h1>Vue API Test</h1>
      <p>{{ message }}</p>

      <NavigationDrawer :locations="locations" :selected-location-id="selectedLocationId" @get-message="getMessage"
        @get-weather="getSecondMessage" @update:selected-location-id="selectedLocationId = $event" />
      <div style="display: flex; ; gap: 2rem; " class="mt-6">
        <v-container>
          <!-- Temperature Chart -->
          <v-card class="mt-5" elevation="4">
            <v-card-title>Temperatures</v-card-title>
            <v-card-text>
              <v-responsive style="height: 300px;">
                <canvas ref="chartCanvas"></canvas>
              </v-responsive>
            </v-card-text>
          </v-card>
        </v-container>
        <v-container>
          <!-- Weather Cards -->
          <div style="display: flex; gap: 1rem;overflow-x: auto; width: 1000px; height: 300px;">
            <v-card v-for="(entry, index) in weatherData" :key="index" :style="getCardStyle(entry.main.temp)"
              class="pa-4" style="min-width: 200px;">
              <div><strong>{{ entry.dt_txt }}</strong></div>
              <div>🌡️ {{ (entry.main.temp - 273.15).toFixed(1) }} °C</div>
              <div>☁️ {{ entry.clouds.all }}%</div>
              <div>💨 {{ entry.wind.speed }} m/s</div>
              <v-btn style="margin-top: 100px;" @click="dialog = true" color="primary">Details</v-btn>
            </v-card>
          </div>
        </v-container>
        <v-container>
          <!-- Wind Speed Gauge -->
          <v-card elevation="4" class="pa-4" style="min-width: 300px; ">
            <v-card-title>Average Wind Speed</v-card-title>
            <v-card-text>
              <v-responsive style="height: 200px;">
                <canvas ref="windGauge"></canvas>
              </v-responsive>
              <div class="text-center mt-2">
                <strong>{{ avgWindSpeed.toFixed(1) }} m/s</strong>
              </div>
            </v-card-text>
          </v-card>
        </v-container>

      </div>
      <v-alert v-for="(alert, index) in weatherAlerts" :key="index" type="warning" border="left" prominent class="mb-3">
        <strong>{{ alert.event }}</strong> ({{ alert.severity }})
        <div>{{ alert.description }}</div>
      </v-alert>
      <v-container class="pa-8">
        <alertView :selectedLocationId="selectedLocationId"
          :locationName="locations.find(loc => loc.id === selectedLocationId)?.name"
          :minTemp="Math.min(...weatherData.map(w => w.main.temp - 273.15))"
          :maxTemp="Math.max(...weatherData.map(w => w.main.temp - 273.15))" :avgWindSpeed="avgWindSpeed" />

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ref, watch } from 'vue'
import {
  Chart, ArcElement, Tooltip, Legend, DoughnutController, BarController,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js'
import alertView from './components/alertView.vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import NavigationDrawer from './components/NavigationDrawer.vue'

const dialog = ref(false)
const tab = ref('weather')

const gridColumns = [
  { field: 'dt_txt', headerName: 'Date/Time' },
  { field: 'main.temp', headerName: 'Temperature (K)' },
  { field: 'clouds.all', headerName: 'Clouds (%)' },
  { field: 'wind.speed', headerName: 'Wind (m/s)' }
]

const locations = [
  { name: 'Moscow', id: 524901 },
  { name: 'London', id: 2643743 },
  { name: 'New York', id: 5128581 },
  { name: 'Tokyo', id: 1850147 },
  { name: 'Sydney', id: 2147714 }
]

const selectedLocationId = ref(locations[0].id)
Chart.register(ArcElement, Tooltip, Legend, DoughnutController, BarController, CategoryScale, LinearScale, BarElement)

const message = ref('Nothing yet')
const weatherData = ref([])
const avgWindSpeed = ref(0)
const windGauge = ref(null)
let windChart = null
const chartCanvas = ref(null)
let weatherChart = null
const showDetails = ref(true)



const vuetify = createVuetify({
  components,
  directives,
})

function getCardStyle(tempK) {
  const tempC = tempK - 273.15
  const redIntensity = Math.min(255, Math.max(0, Math.round((tempC / 40) * 255)))
  return {
    backgroundColor: `rgb(${redIntensity}, 50, 50)`,
    color: '#fff'
  }
}

async function getMessage() {
  try {
    const res = await fetch("https://localhost:7010/api/message")
    const data = await res.json()
    message.value = data.message
  } catch (err) {
    message.value = 'Error fetching message'
    console.error(err)
  }
}

function openWeatherModal(entry) {
  selectedWeather.value = entry
  dialog.value = true
  tab.value = 'weather'
}

async function getSecondMessage() {
  try {
    const res = await fetch(`http://api.openweathermap.org/data/2.5/forecast?id=${selectedLocationId.value}&appid=43be5bacfb349f774b7fc719e379e4c1`)
    const data = await res.json()
    weatherData.value = data.list.slice(0, 20)
    message.value = `Fetched ${weatherData.value.length} records.`
  } catch (err) {
    message.value = 'Error fetching weather data'
    console.error(err)
  }

  if (weatherChart) weatherChart.destroy()

  const labels = weatherData.value.map(item => item.dt_txt)
  const temps = weatherData.value.map(item => item.main.temp - 273.15)

  weatherChart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        backgroundColor: '#1976D2'
      }]
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

watch(weatherData, () => {
  const winds = weatherData.value.map(e => e.wind.speed)
  avgWindSpeed.value = winds.reduce((a, b) => a + b, 0) / winds.length

  if (windChart) windChart.destroy()

  windChart = new Chart(windGauge.value, {
    type: 'doughnut',
    data: {
      labels: ['Wind Speed', 'Remaining'],
      datasets: [{
        data: [avgWindSpeed.value, 30 - avgWindSpeed.value],
        backgroundColor: ['#1976D2', '#E0E0E0'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: '70%',
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  })
})
</script>
