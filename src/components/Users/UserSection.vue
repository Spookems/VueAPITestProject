<template>
  <div class="page-container">
    <div class="button-group" style="place-content: center; transition: transform 0.5s ease;">
      <button @click="startPolling" class="btn btn-primary" style="transition: transform 0.5s ease;">🔄 Start Polling
        Users</button>
      <button @click="showAddUserModal = true" class="btn btn-success" style="transition: transform 0.5s ease;">➕ Add
        New User</button>

      <transition name="slide-fade">
        <div v-if="showDetailGrid">
          <button @click="showAddUserModal = true" class="btn btn-success">➕ Add User Permission</button>
        </div>

      </transition>
    </div>
    <div class="row">

      <div class="ag-theme-quartz styled-grid" :class="{ 'shift-left': showDetailGrid }" style="position: absolute; width: 50%;
   left: 24%">
        <AgGridVue :rowData="users" :columnDefs="columnDefs" domLayout="autoHeight" theme="legacy"
          @rowClicked="onRowClicked" />
      </div>

      <transition name="slide-fade">
        <div v-if="showDetailGrid" class="detail-grid ag-theme-quartz styled-grid">
          <AgGridVue :rowData="detailGridData" :columnDefs="permissionsColumnDefs" domLayout="autoHeight" />
        </div>
      </transition>
    </div>


    <!-- Modal -->
    <div v-if="showAddUserModal" class="modal-overlay">
      <div class="modal">
        <h2>Add New User</h2>
        <p v-if="validationMessage" class="text-error">{{ validationMessage }}</p>
        <p v-if="saveResultMessage" class="text-success">{{ saveResultMessage }}</p>

        <label>First Name</label>
        <input v-model="newUser.firstName" class="input" />

        <label>Last Name</label>
        <input v-model="newUser.lastName" class="input" />

        <label>Email</label>
        <input v-model="newUser.email" class="input" />

        <div class="modal-buttons">
          <button @click="submitNewUser" class="btn btn-primary">Submit</button>
          <button @click="showAddUserModal = false" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry } from 'ag-grid-community'
import { ClientSideRowModelModule } from 'ag-grid-community'
import { ValidationModule } from 'ag-grid-community'
import { provideGlobalGridOptions } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import '@/assets/users.css'

provideGlobalGridOptions({
  theme: "legacy",
});

// Register required modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule
])

const users = ref([])

const validationMessage = ref('')
const saveResultMessage = ref('')
const showDetailGrid = ref(false)
const detailGridData = ref([])

const columnDefs = [
  { headerName: 'User ID', field: 'userId', flex: 1 },
  { headerName: 'First Name', field: 'firstName', flex: 1 },
  { headerName: 'Last Name', field: 'lastName', flex: 1 },
  { headerName: 'Email', field: 'email', flex: 1 },
]
const permissionsColumnDefs = [
  { headerName: 'User ID', field: 'userId', flex: 1 },
  { headerName: 'Permission Name', field: 'permissionName', flex: 1 },
  { headerName: 'Created At', field: 'createdAt', flex: 1 },
]
const showAddUserModal = ref(false)

const newUser = ref({
  firstName: '',
  lastName: '',
  email: ''
})

function startPolling() {
  fetchUsers()
}

async function fetchUsers() {
  try {
    const response = await fetch('https://localhost:7010/api/Users/GetAllUsers')
    const data = await response.json()
    users.value = Array.isArray(data) ? data : [data]
  } catch (error) {
    console.error('API fetch failed:', error)
  }
}

async function submitNewUser() {
  const { firstName, lastName, email } = newUser.value

  if (!firstName && !lastName && !email) {
    validationMessage.value = 'Please enter at least one field.'
    setTimeout(() => (validationMessage.value = ''), 5000)
    return
  }

  try {
    const response = await fetch('https://localhost:7010/api/Users/AddUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: crypto.randomUUID(),
        firstName,
        lastName,
        email
      })
    })

    const result = await response.json()

    if (result === true) {
      saveResultMessage.value = '✅ User saved successfully.'
    } else {
      saveResultMessage.value = '❌ Error saving user.'
    }
  } catch (error) {
    console.error('API fetch failed:', error)
    saveResultMessage.value = '❌ API error saving user.'
  }

  setTimeout(() => (saveResultMessage.value = ''), 5000)

  newUser.value = { firstName: '', lastName: '', email: '' }
  showAddUserModal.value = false

  fetchUsers();
}

async function onRowClicked(event) {
  const userId = event.data.userId
  try {
    const response = await fetch(`https://localhost:7010/api/Users/GetUserPermissions/${userId}`)
    const data = await response.json()
    detailGridData.value = Array.isArray(data) ? data : [data]
    showDetailGrid.value = true
  } catch (err) {
    console.error('Failed to fetch user:', err)
  }
}
</script>
