<template>
  <div class="container">
    <div class="button-group">
      <button @click="startPolling" class="btn btn-primary">🔄 Start Polling Users</button>
      <button @click="showAddUserModal = true" class="btn btn-success">➕ Add New User</button>
    </div>

    <ag-grid-vue class="ag-theme-alpine" style="height: 400px; width: 100%;" :rowData="users" :columnDefs="columnDefs"
      :domLayout="'autoHeight'" />

    <!-- Modal -->
    <div v-if="showAddUserModal" class="modal-overlay">
      <div class="modal">
        <h2>Add New User</h2>

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
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const users = ref([])

const columnDefs = [
  { headerName: 'User ID', field: 'userId', flex: 1 },
  { headerName: 'First Name', field: 'firstName', flex: 1 },
  { headerName: 'Last Name', field: 'lastName', flex: 1 },
  { headerName: 'Email', field: 'email', flex: 1 },
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
    const response = await fetch('https://localhost:7010/UsersController')
    const data = await response.json()
    users.value = Array.isArray(data) ? data : [data]
  } catch (error) {
    console.error('API fetch failed:', error)
  }
}

function submitNewUser() {
  console.log('Submitting new user:', newUser.value)
  showAddUserModal.value = false
}
</script>

<style scoped>
.container {
  padding: 1.5rem;
  max-width: 80%;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: background 0.2s ease-in-out;
}

.btn-primary {
  background-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-success {
  background-color: #28a745;
}

.btn-success:hover {
  background-color: #1e7e34;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.input {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
