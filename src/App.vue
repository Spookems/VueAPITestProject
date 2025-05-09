<template>
  <v-app>
    <v-main>

      <h1>Vue API Test</h1>
      <p>{{ message }}</p>

      <v-btn @click="getMessage" class="mr-2">Get message from API</v-btn>
      <v-btn @click="getSecondMessage">Get weather data</v-btn>
      <div style="display: flex; ; gap: 2rem; " class="mt-6">
        <v-container>

          <!-- Wind Speed Gauge -->
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
          <!-- Scrollable Weather Cards -->
          <div style="display: flex; gap: 1rem;overflow-x: auto; width: 1000px; height: 300px;">
            <v-card v-for="(entry, index) in weatherData" :key="index" :style="getCardStyle(entry.main.temp)"
              class="pa-4" style="min-width: 200px;">
              <div><strong>{{ entry.dt_txt }}</strong></div>
              <div>🌡️ {{ (entry.main.temp - 273.15).toFixed(1) }} °C</div>
              <div>☁️ {{ entry.clouds.all }}%</div>
              <div>💨 {{ entry.wind.speed }} m/s</div>
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
      <div class="alert-box">
        <div class="alert-icon">
          <img src="@/assets/flood-warning.png" alt="Flood warning icon" />
          <span class="warning-label">WARNING</span>
        </div>
        <div class="alert-content">
          <h2>Flood alerts in force for England</h2>
          <a href="https://www.gov.uk/check-flooding" target="_blank">Environment Agency</a>
          <p class="updated">Updated: 13:53 (UTC+1) on Fri 2 May 2025</p>
        </div>
      </div>
      <v-container class="pa-8">
        <v-card elevation="2" class="pa-4">
          <h2 class="text-h5 font-weight-bold mb-4">North East England weather forecast</h2>

          <!-- Toggle Button -->
          <v-btn @click="showDetails = !showDetails" color="grey lighten-2" variant="flat" class="mb-4">
            {{ showDetails ? 'Hide' : 'Show' }} forecast
            <v-icon end>{{ showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>

          <!-- Expandable Content -->
          <v-expand-transition>
            <div v-show="showDetails">
              <v-card class="pa-4" variant="tonal">
                <p><strong>Headline:</strong><br>Friday, dry with bright or sunny spells. Cooler.</p>

                <p><strong>Today:</strong><br>
                  Largely fine and dry, with some bright or sunny spells. Most parts a little cloudier in the afternoon.
                  Feeling noticeably cooler than of late, but still warm in sunshine.
                  Generally light winds. Maximum temperature 17 °C.
                </p>

                <p><strong>Tonight:</strong><br>
                  It will be a dry night with clear periods and generally light winds,
                  allowing temperatures to become chilly for most. Minimum temperature 4 °C.
                </p>

                <p><strong>Saturday:</strong><br>
                  Generally dry with bright or sunny spells, just the chance of an isolated light shower.
                  Feeling noticeably cooler in an increasing breeze. Maximum temperature 15 °C.
                </p>

                <p><strong>Outlook for Sunday to Tuesday:</strong><br>
                  Mainly dry conditions with bright or sunny spells.
                  However variable, occasionally large amounts of cloud, also giving a few light showers.
                  Brisk winds, easing later. Feeling much cooler.
                </p>

                <p class="text-caption mt-4">
                  <em>Updated: 05:00 (UTC+1) on Fri 2 May 2025</em>
                </p>
              </v-card>
            </div>
          </v-expand-transition>
        </v-card>
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

async function getSecondMessage() {


  try {
    const res = await fetch("http://api.openweathermap.org/data/2.5/forecast?id=524901&appid=43be5bacfb349f774b7fc719e379e4c1")
    const data = await res.json()
    weatherData.value = data.list.slice(0, 20)
    message.value = `Fetched ${weatherData.value.length} records.`
  } catch (err) {
    message.value = 'Error fetching weather data'
    console.error(err)
  }

  if (weatherChart) {
    weatherChart.destroy()
  }

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

<style scoped>
.alert-box {
  display: flex;
  border: 1px solid #ccc;
  padding: 1rem;
  border-left: 5px solid #005ea5;
  max-width: 700px;
  align-items: center;
  background-color: #fff;
  margin-left: 30px;
}

.alert-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 1rem;
  min-width: 80px;
}

.alert-icon img {
  width: 60px;
  height: auto;
}

.warning-label {
  font-weight: bold;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  color: #666;
}

.alert-content h2 {
  margin: 0;
  font-size: 1.4rem;
}

.alert-content a {
  color: #005ea5;
  text-decoration: underline;
  display: block;
  margin-top: 0.5rem;
}

.updated {
  font-size: 0.85rem;
  color: #555;
  margin-top: 0.3rem;
}
</style>
