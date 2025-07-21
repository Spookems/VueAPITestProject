<template>
  <div class="page-container">
    <div class="button-group">
      <button @click="startPolling" class="btn btn-primary">🔄 Start Polling Users</button>
      <button @click="showAddUserModal = true" class="btn btn-success">➕ Add New User</button>
    </div>
    <div class="ag-theme-quartz styled-grid">
      <AgGridVue :rowData="users" :columnDefs="columnDefs" domLayout="autoHeight" theme="legacy" />


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
// Mark all grids as using legacy themes
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
</script>

<style>
/* Layout */
.page-container {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* AG Grid Enhancements */
.styled-grid {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Buttons */
.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  color: white;
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

/* Modal */
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

/* Inputs */
.input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

/* Text colors */
.text-error {
  color: #dc3545;
}

.text-success {
  color: #28a745;
}
</style>
