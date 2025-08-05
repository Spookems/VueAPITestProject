<template>
  <v-app class="full-width-wrapper pa-0 fill-width">

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item @click="goToUsersSection" link>
          <v-list-item-title>Users Section</v-list-item-title>
        </v-list-item>

        <v-list-item link>
          <v-list-item-title><b>Weather Section</b></v-list-item-title>
        </v-list-item>

        <v-list-item @click="goToPiniaStoreSection" link>
          <v-list-item-title>Pinia Tests</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar color="gray-darken-4" elevate-on-scroll flat app height="64">
      <v-btn icon @click.stop="drawer = !drawer" aria-label="Toggle navigation" style="background-color: transparent;">
        <span class="text-h5" style="line-height: 1; color: black;">☰</span>
      </v-btn>

      <v-toolbar-title class="text-black" style="max-width: 180px;">Weather Section</v-toolbar-title>

      <div class="d-flex align-center gap-x-2 pr-2">
      </div>
    </v-app-bar>

    <v-main>
      <router-view />
      <WeatherDialog v-model:dialog="dialog" v-model:tab="tab" :selected-weather="selectedWeather"
        :grid-row-data="gridRowData" :grid-columns="gridColumns" />

      <h1>Vue API Test</h1>
      <p>{{ message }}</p>
      <div class="weather-container">
        <input type="text" v-model="inputValue" placeholder="Enter city name" />
        <button @click="getWeatherForCity(inputValue)">Get Weather</button>

        <transition name="fade-slide">
          <div v-if="personalisedWeatherData" class="weather-card">
            <h2>{{ personalisedWeatherData.city }}</h2>
            <p>🌡️ Temperature: {{ personalisedWeatherData.temp }} °C</p>
            <p>💨 Wind Speed: {{ personalisedWeatherData.windSpeed }} m/s</p>
          </div>
        </transition>
      </div>
      <NavigationDrawer :locations="locations" :selected-location-id="selectedLocationId" @get-message="getMessage"
        @get-weather="getSecondMessage" @update:selected-location-id="selectedLocationId = $event" />

      <div style="display: flex; overflow-x: auto; flex-wrap: nowrap; margin: 0;">
        <v-container style="max-width: 12vw; min-width: 300px; padding: 0;">
          <TemperatureChart :weatherData="weatherData" />
        </v-container>


        <v-container class="weather-card-container"
          style="width: 50vw; overflow: hidden; margin: 10px; padding: 0; flex-shrink: 1;">
          <WeatherCardList :weatherData="weatherData" @details="openDetails" />
        </v-container>


        <v-container style="padding: 0; right: 0; padding-right: 3vw; width: 20vw; min-width: 300px; flex-shrink: 0;">
          <v-card class="mr-4" elevation="4">
            <v-card-title>Average Wind Speed</v-card-title>
            <v-card-text>
              <v-responsive style="height: 300px;">
                <canvas ref="windGauge"></canvas>
              </v-responsive>
              <div class="text-center">
                <strong>{{ avgWindSpeed.toFixed(1) }} m/s</strong>
              </div>
            </v-card-text>
          </v-card>
        </v-container>

      </div>

      <v-alert v-for="(alert, index) in weatherAlerts" :key="index" type="warning" prominent class="mb-3">
        <strong>{{ alert.event }}</strong> ({{ alert.severity }})
        <div>{{ alert.description }}</div>
      </v-alert>

      <v-container class="pa-8">
        <AlertView :selectedLocationId="selectedLocationId"
          :locationName="locations.find((loc) => loc.id === selectedLocationId)?.name"
          :minTemp="Math.min(...weatherData.map((w) => w.main.temp - 273.15))"
          :maxTemp="Math.max(...weatherData.map((w) => w.main.temp - 273.15))" :avgWindSpeed="avgWindSpeed" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import 'vuetify/styles'
import { ref, watch } from 'vue'
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js'

import AlertView from './alertView.vue'
import NavigationDrawer from './NavigationDrawer.vue'
import WeatherDialog from './WeatherDialog.vue'
import TemperatureChart from './TemperatureChart.vue'
import WeatherCardList from './WeatherCardList.vue'


import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { ClientSideRowModelModule } from 'ag-grid-community'
import { ModuleRegistry } from 'ag-grid-community'
import type { WeatherEntry } from '../../Interfaces/WeatherData'
import { useRouter } from 'vue-router'

const router = useRouter()
function goToUsersSection() {
  router.push('/users')
}

function goToPiniaStoreSection() {
  router.push('/piniaStore')
}

ModuleRegistry.registerModules([ClientSideRowModelModule])


const drawer = ref(false)
interface WeatherAlert {
  event: string
  severity: string
  description: string
}

interface GridRow {
  Parameter: string
  Value: string | number
}

// Refs with explicit types
const dialog = ref<boolean>(false)
const tab = ref<string>('weather')
const message = ref<string>('Nothing yet')
const selectedLocationId = ref<number>(2643743) // London default

const weatherData = ref<WeatherEntry[]>([])
const selectedWeather = ref<WeatherEntry | null>(null)
const weatherAlerts = ref<WeatherAlert[]>([])

const gridRowData = ref<GridRow[]>([])
const avgWindSpeed = ref<number>(0)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const windGauge = ref<HTMLCanvasElement | null>(null)

let weatherChart: Chart | null = null
let windChart: Chart | null = null
const inputValue = ref('');
const personalisedWeatherData = ref<null | { city: string; temp: number; windSpeed: number }>(null);

const locations = [
  { name: 'Moscow', id: 524901 },
  { name: 'London', id: 2643743 },
  { name: 'New York', id: 5128581 },
  { name: 'Tokyo', id: 1850147 },
  { name: 'Sydney', id: 2147714 }
]

const gridColumns = [
  { field: 'Parameter', headerName: 'Parameter' },
  { field: 'Value', headerName: 'Value' }
]

function openDetails(entry: WeatherEntry) {
  selectedWeather.value = entry
  dialog.value = true

  gridRowData.value = [
    { Parameter: 'Temperature (°C)', Value: (entry.main.temp - 273.15).toFixed(1) },
    { Parameter: 'Feels Like (°C)', Value: (entry.main.feels_like - 273.15).toFixed(1) },
    { Parameter: 'Humidity (%)', Value: entry.main.humidity },
    { Parameter: 'Cloud Cover (%)', Value: entry.clouds.all },
    { Parameter: 'Wind Speed (m/s)', Value: entry.wind.speed },
    { Parameter: 'Wind Direction (°)', Value: entry.wind.deg },
    { Parameter: 'Visibility (m)', Value: entry.visibility },
    { Parameter: 'Pressure (hPa)', Value: entry.main.pressure }
  ]
}

watch(selectedWeather, (newWeather) => {
  if (!newWeather) return
  gridRowData.value = [
    { Parameter: 'Temperature (°C)', Value: (newWeather.main.temp - 273.15).toFixed(1) },
    { Parameter: 'Clouds (%)', Value: newWeather.clouds.all },
    { Parameter: 'Wind Speed (m/s)', Value: newWeather.wind.speed },
    { Parameter: 'Pressure (hPa)', Value: newWeather.main.pressure },
    { Parameter: 'Humidity (%)', Value: newWeather.main.humidity }
  ]
})

async function getMessage() {
  try {
    const res = await fetch('https://localhost:7010/api/message')
    const data = await res.json()
    message.value = data.message
  } catch (err) {
    message.value = 'Error fetching message'
    console.error(err)
  }
}

// Example call for Tokyo : https://api.openweathermap.org/data/2.5/forecast?id=1850147&appid=43be5bacfb349f774b7fc719e379e4c1
async function getSecondMessage() {
  try {
    const res = await fetch(
      `http://api.openweathermap.org/data/2.5/forecast?id=${selectedLocationId.value}&appid=43be5bacfb349f774b7fc719e379e4c1`
    )
    const data = await res.json()
    weatherData.value = data.list.slice(0, 20)
    message.value = 'Success'
  } catch (err) {
    message.value = 'Error fetching weather data'
    console.error(err)
  }

  if (weatherChart) weatherChart.destroy()
  const labels = weatherData.value.map((item) => item.dt_txt)

  // Celsius to Kelvin conversion
  const temps = weatherData.value.map((item) => item.main.temp - 273.15)

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
// for ref this works https://api.openweathermap.org/data/2.5/weather?lat=1&lon=1&appid=43be5bacfb349f774b7fc719e379e4c1&units=metric
async function getWeatherForCity(cityName = "", apiKey = '43be5bacfb349f774b7fc719e379e4c1') {

  const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`);
  const geoData = await geoRes.json();
  if (!geoData.length) throw new Error('City not found');

  const { lat, lon, name } = geoData[0];
  const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
  const data = await weatherRes.json();

  personalisedWeatherData.value = {
    city: name,
    temp: data.main.temp,
    windSpeed: data.wind.speed
  };
}

watch(weatherData, () => {
  const winds = weatherData.value.map((e) => e.wind.speed)
  avgWindSpeed.value = winds.reduce((a, b) => a + b, 0) / winds.length

  if (windChart) windChart.destroy()

  windChart = new Chart(windGauge.value as HTMLCanvasElement, {
    type: 'doughnut',
    data: {
      labels: ['Wind Speed', 'Remaining'],
      datasets: [
        {
          data: [avgWindSpeed.value, 30 - avgWindSpeed.value],
          backgroundColor: ['#1976D2', '#E0E0E0'],
          borderWidth: 0,
          circumference: 180,
          rotation: 270
        }
      ]
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

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement
)

// Initial fetches
//getMessage()
//getSecondMessage()
</script>
<style scoped>
.weather-container {
  max-width: 400px;
  margin: 20px auto;
  text-align: center;
  font-family: sans-serif;
}

input {
  padding: 8px;
  width: 70%;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.weather-card {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #dbeafe, #93c5fd);
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease;
}

.fade-slide-enter-active {
  transition: all 0.5s ease;
}

.fade-slide-leave-active {
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(-20px);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 1100px) {
  .weather-card-container {
    display: none;
  }
}

.v-app-bar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.gap-x-2>*+* {
  margin-left: 8px;
}
</style>
