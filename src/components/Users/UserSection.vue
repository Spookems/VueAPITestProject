<template>
  <h2>User Grid</h2>
  <ag-grid-vue class="ag-theme-alpine" style="width: 100%; height: 400px;" :columnDefs="columnDefs" :rowData="rowData"
    :defaultColDef="{ resizable: true, sortable: true, filter: true }" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'

const columnDefs = ref([
  { field: 'firstName' },
  { field: 'lastName' },
  { field: 'email' },
  { field: 'age' },
])

const rowData = ref([
  { firstName: 'John', lastName: 'Doe', email: 'john@example.com', age: 32 },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', age: 28 },
  { firstName: 'Bob', lastName: 'Brown', email: 'bob@example.com', age: 45 },
])
</script>
