<template>
  <v-card>
    <v-card-title>Forecast Data</v-card-title>
    <v-card-text>
      <div class="ag-theme-alpine" style="height: 400px; width: 100%;">
        <AgGridVue
          class="ag-grid"
          :columnDefs="columnDefs"
          :rowData="rowData"
          :defaultColDef="defaultColDef"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const columnDefs = ref([
  { field: 'time' },
  { field: 'temperature' },
  { field: 'chanceOfRain' },
  { field: 'windSpeed' }
])

const rowData = ref([
  { time: '14:00', temperature: '14°C', chanceOfRain: '0%', windSpeed: '18 km/h' },
  { time: '15:00', temperature: '14°C', chanceOfRain: '0%', windSpeed: '17 km/h' },
  // Add more rows here
])

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true
}
</script>
