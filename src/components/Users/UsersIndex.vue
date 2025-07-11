<template>
  <div class="ag-theme-alpine" style="height: 500px; width: 100%;">
    <ag-grid-vue class="ag-theme-alpine" :columnDefs="columnDefs" :rowData="rowData" rowSelection="single"
      :animateRows="true" style="width: 100%; height: 100%;" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

// Register the component
defineExpose({ AgGridVue })

const columnDefs = ref([
  { headerName: 'ID', field: 'id', sortable: true, filter: true },
  { headerName: 'First Name', field: 'firstName', sortable: true, filter: true },
  { headerName: 'Last Name', field: 'lastName', sortable: true, filter: true },
  { headerName: 'Email', field: 'email', sortable: true, filter: true },
  { headerName: 'Role', field: 'role', sortable: true, filter: true }
])

const rowData = ref([
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', role: 'Moderator' }
])
</script>
