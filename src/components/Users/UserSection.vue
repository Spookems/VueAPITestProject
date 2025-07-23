<template>
  <div class="page-container" style="max-width: none;">
    <div class="button-group" style="place-content: center; transition: transform 0.5s ease;">
      <button @click="startPolling" class="btn btn-primary">🔄 Start Polling Users</button>
      <button @click="showAddUserModal = true" class="btn btn-success">➕ Add New User</button>
      <button @click="isEditMode = !isEditMode" class="btn btn-success">✏️ Toggle Edit button</button>
      <button @click="showEditUserPermissionsModal = true" class="btn btn-success">➕ Add User Permission</button>
      <button class="btn btn-success">➕ Add User Site</button>

    </div>

    <div class="row">
      <div class="ag-theme-quartz styled-grid" :class="{ 'shift-left': showDetailGrid }"
        style="position: absolute; width: 50%; left: 24%">
        <h3 class="pl-4">Users</h3>
        <AgGridVue :rowData="users" :columnDefs="userColumnDefs" domLayout="autoHeight" theme="legacy"
          @rowClicked="onRowClicked" />
      </div>
    </div>

    <div style="justify-items: right; gap: 4px;">
      <transition name="slide-fade">
        <div v-if="showDetailGrid" class="detail-grid ag-theme-quartz styled-grid mb-3">
          <h3 class="pl-4">User Permissions</h3>
          <AgGridVue :rowData="detailGridData" :columnDefs="permissionColumnDefs" domLayout="autoHeight" />
        </div>
      </transition>

      <transition name="slide-fade">
        <div v-if="showDetailGrid" class="detail-grid ag-theme-quartz styled-grid">
          <h3 class="pl-4">User Sites</h3>
          <AgGridVue :rowData="siteDetailGridData" :columnDefs="siteColumnDefs" domLayout="autoHeight" />
        </div>
      </transition>
    </div>
    <transition name="slide-fade">
      <AddUserModal v-if="showAddUserModal" @close="showAddUserModal = false" @saved="fetchUsers" />
    </transition>
    <transition name="slide-fade">
      <EditUserPermissionsModal v-if="showEditUserPermissionsModal" :permission="selectedPermission"
        @close="showEditUserPermissionsModal = false" @saved="fetchPermissions" />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry } from 'ag-grid-community'
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community'
import { provideGlobalGridOptions } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import '@/assets/users.css'
import AddUserModal from '@/components/Users/UserModals/AddUserModal.vue'
import EditUserPermissionsModal from './UserModals/EditUserPermissionsModal.vue'

provideGlobalGridOptions({ theme: "legacy" })
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule])

const users = ref([])
const detailGridData = ref([])
const siteDetailGridData = ref([])
const showDetailGrid = ref(false)
const showAddUserModal = ref(false)
const showEditUserPermissionsModal = ref(false)
const isEditMode = ref(false)
const selectedPermission = ref(null)

const baseUserCols = [
  { headerName: 'User ID', field: 'userId', flex: 1 },
  { headerName: 'First Name', field: 'firstName', flex: 1 },
  { headerName: 'Last Name', field: 'lastName', flex: 1 },
  { headerName: 'Email', field: 'email', flex: 1 }
]

const userColumnDefs = computed(() => {
  return isEditMode.value
    ? [
      ...baseUserCols,
      {
        headerName: 'Edit',
        cellRenderer: () => `<button class='btn btn-success' style='height: 35px; padding: 5px; width: 60px; margin: 0;''>Edit</button>`,
        flex: 1,
        onCellClicked: (params) => {
          window.location.href = `/edit-user/${params.data.userId}`
        }
      }
    ]
    : baseUserCols
})

const permissionCols = [
  { headerName: 'User ID', field: 'userId', hide: true, flex: 1 },
  { headerName: 'Permission Id', field: 'userPermissionId', hide: true, flex: 1 },
  { headerName: 'Permission Name', field: 'permissionName', flex: 1 },
  { headerName: 'Permission Type', field: 'permissionType', flex: 1 },
  { headerName: 'Created At', field: 'createdAt', flex: 1 }
]

const permissionColumnDefs = computed(() => {
  return isEditMode.value
    ? [
      ...permissionCols,
      {
        headerName: 'Edit',
        cellRenderer: () => `<button class='btn btn-success' style='height: 35px; padding: 5px; width: 60px; margin: 0;''>Edit</button>`,
        flex: 1,
        onCellClicked: (params) => {
          selectedPermission.value = params.data;
          selectedPermission.value.userId = params.data.userId;
          showEditUserPermissionsModal.value = true;
        }
      }
    ]
    : permissionCols
})

const siteCols = [
  { headerName: 'User ID', field: 'userId', flex: 1 },
  { headerName: 'Site Name', field: 'siteName', flex: 1 },
  { headerName: 'Site Type', field: 'siteType', flex: 1 },
  { headerName: 'Created At', field: 'createdAt', flex: 1 }
]
//<button @click="showAddUserModal = true" class="btn btn-success">➕ Add New User</button>
const siteColumnDefs = computed(() => {
  return isEditMode.value
    ? [
      ...siteCols,
      {
        headerName: 'Edit',
        cellRenderer: () => `<button class='btn btn-success' style='height: 35px; padding: 5px; width: 60px; margin: 0;''>Edit</button>`,
        flex: 1,
        onCellClicked: (params) => {
          selectedPermission.value = params.data;
          showEditUserPermissionsModal.value = true;
        }
      }
    ]
    : siteCols
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


async function onRowClicked(event) {
  const userId = event.data.userId
  try {
    const response = await fetch(`https://localhost:7010/api/Users/GetUserPermissions/${userId}`)
    const data = await response.json()
    detailGridData.value = Array.isArray(data) ? data : [data]

    const siteResponse = await fetch(`https://localhost:7010/api/Users/GetUserSites/${userId}`)
    const siteData = await siteResponse.json()
    siteDetailGridData.value = Array.isArray(siteData) ? siteData : [siteData]
    showDetailGrid.value = true
  } catch (err) {
    console.error('Failed to fetch user:', err)
  }
}
</script>
