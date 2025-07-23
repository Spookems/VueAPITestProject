<template>
  <v-dialog v-model="internalDialog" max-width="10%">
    <v-card>
      <v-card-title>
        Weather & Grid Tabs
        <v-spacer></v-spacer>
        <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text>
        <v-tabs v-model="internalTab">
          <v-tab value="weather">Weather Cards</v-tab>
          <v-tab value="grid">AG-Grid Table</v-tab>
        </v-tabs>
        <v-window v-model="internalTab" class="mt-4">
          <v-window-item value="weather">
            <div v-if="selectedWeather">
              <h3>Details for {{ selectedWeather.dt_txt }}</h3>
              <p>🌡️ Temp: {{ (selectedWeather.main.temp - 273.15).toFixed(1) }} °C</p>
              <p>☁️ Clouds: {{ selectedWeather.clouds.all }}%</p>
              <p>💨 Wind: {{ selectedWeather.wind.speed }} m/s</p>
              <v-progress-linear :model-value="selectedWeather.wind.speed * 3" height="10" color="blue" />
            </div>
          </v-window-item>
          <v-window-item value="grid">
            <ag-grid-vue class="ag-theme-alpine" style="height: 300px; width: 100%;" :rowData="gridRowData"
              :columnDefs="gridColumns" :defaultColDef="{ resizable: true, sortable: true }" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import type { ColDef, ColGroupDef } from 'ag-grid-community'


interface WeatherMain {
  temp: number
  feels_like: number
  humidity: number
  pressure: number
}

interface WeatherClouds {
  all: number
}

interface WeatherWind {
  speed: number
  deg: number
}

interface WeatherEntry {
  dt_txt: string
  main: WeatherMain
  clouds: WeatherClouds
  wind: WeatherWind
  visibility: number
}

const props = defineProps<{
  dialog: boolean
  tab: string
  selectedWeather: WeatherEntry | null
  gridRowData: Array<Record<string, unknown>>
  gridColumns: (ColDef | ColGroupDef)[]
}>()

const emit = defineEmits(['update:dialog', 'update:tab'])

function close() {
  emit('update:dialog', false)
}

const internalDialog = computed({
  get: () => props.dialog,
  set: val => emit('update:dialog', val)
})

const internalTab = computed({
  get: () => props.tab,
  set: val => emit('update:tab', val)
})
</script>
