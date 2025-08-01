<template>
  <div class="page-container" style="max-width: none;">
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item @click="console.log('Users Section clicked')" link>
          <v-list-item-title><b>Users Section</b></v-list-item-title>
        </v-list-item>

        <v-list-item @click="goToWeatherSection" link>
          <v-list-item-title>Weather Section</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar color="gray-darken-4" elevate-on-scroll flat app height="64">
      <v-btn icon @click.stop="drawer = !drawer" aria-label="Toggle navigation">
        <span style="font-size: 24px;">☰</span>
      </v-btn>

      <v-toolbar-title class="text-black" style="max-width: 180px;">User Dashboard</v-toolbar-title>

      <div class="d-flex align-center gap-x-2 pr-2">

        <v-btn @click="startPolling">Poll Users</v-btn>
        <v-btn @click="showAddUserModal = true">➕ Add New User</v-btn>
        <v-btn @click="isEditMode = !isEditMode">✏️ Toggle Edit</v-btn>
        <v-btn @click="OpenUpsertUserPermission()">➕ Add User Permission</v-btn>
        <v-btn @click="OpenUpsertUserSite()">➕ Add User Site</v-btn>

        <v-btn block color="secondary" @click="goToWeatherSection">Go to Users</v-btn>
      </div>
    </v-app-bar>

    <div class="row">
      <div class="ag-theme-quartz styled-grid" :class="{ 'shift-left': showDetailGrid }"
        style="position: absolute; width: 50%; left: 24%">
        <h3 class="pl-4">Users</h3>
        <AgGridVue :rowData="users" :columnDefs="userColumnDefs" domLayout="autoHeight" theme="legacy"
          @rowClicked="onRowClicked" :pagination="true" :paginationPageSize="10" />
      </div>
    </div>

    <div style="justify-items: right; gap: 4px;">
      <transition name="slide-fade">
        <div v-if="showDetailGrid" class="detail-grid ag-theme-quartz styled-grid mb-3">
          <h3 class="pl-4">User Permissions</h3>
          <AgGridVue :rowData="detailGridData" :columnDefs="permissionColumnDefs" domLayout="autoHeight"
            :pagination="true" :paginationPageSize="3" @rowClicked="onPermissionsClicked" />
        </div>
      </transition>

      <transition name="slide-fade">
        <div v-if="showDetailGrid" class="detail-grid ag-theme-quartz styled-grid">
          <h3 class="pl-4">User Sites</h3>
          <AgGridVue :rowData="siteDetailGridData" :columnDefs="siteColumnDefs" domLayout="autoHeight"
            :pagination="true" :paginationPageSize="3" @rowClicked="onSiteClicked" />
        </div>
      </transition>
    </div>
    <transition name="slide-fade">
      <AddUserModal :model-value="showAddUserModal" @close="showAddUserModal = false" @saved="fetchUsers" />
    </transition>
    <transition name="slide-fade">
      <UserPermissionsModal v-if="showEditUserPermissionsModal" :permission="selectedPermission"
        @close="showEditUserPermissionsModal = false" @saved="handlePermissionSaved" />
    </transition>
    <transition name="slide-fade">
      <UserSiteModal v-if="showEditUserSiteModal" :site="selectedSite" @close="showEditUserSiteModal = false"
        @saved="handleSiteSaved" />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry } from 'ag-grid-community'
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community'
import { provideGlobalGridOptions } from 'ag-grid-community'
import { PaginationModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import '@/assets/users.css'
import AddUserModal from '@/components/Users/UserModals/AddUserModal.vue'
import UserPermissionsModal from './UserModals/UserPermissionsModal.vue'
import UserSiteModal from './UserModals/UserSitesModal.vue'
import { useRouter } from 'vue-router'
import {
  fetchAllUsers,
  fetchUserPermissions,
  fetchUserSites,
  deleteUser as apiDeleteUser,
  deletePermission as apiDeletePermission,
  deleteSite as apiDeleteSite
} from '@/Repository/UserRepository';

const drawer = ref(false)
const group = ref(null)


const router = useRouter()
function goToWeatherSection() {
  router.push('/weather')
}

watch(group, () => {
  drawer.value = false
})
provideGlobalGridOptions({ theme: "legacy" })
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule, PaginationModule])

const users = ref([])
const detailGridData = ref([])
const siteDetailGridData = ref([])
const showDetailGrid = ref(false)
const showAddUserModal = ref(false)
const showEditUserPermissionsModal = ref(false)
const showEditUserSiteModal = ref(false)
const isEditMode = ref(false)
const selectedPermission = ref(null)
const selectedSite = ref(null)
const selectedUserId = ref(null)
const isSiteDelete = ref(null)
const isPermissionDelete = ref(null)

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
        cellRenderer: () => `<button class='btn btn-success' style='height: 35px; padding: 5px; width: 60px; margin: 0;'>Edit</button>`,
        flex: 1,
        onCellClicked: (params) => {
          window.location.href = `/edit-user/${params.data.userId}`;
        }
      },
      {
        headerName: '',
        cellRenderer: () => `<button class='btn btn-danger' style='height: 35px; padding: 5px; width: 60px; margin: 0;'>❌</button>`,
        flex: 1,
        onCellClicked: (params) => deleteUser(params.data.userId, true)
      }
    ]
    : baseUserCols;
});


const permissionCols = [
  { headerName: 'User ID', field: 'userId', hide: true, flex: 1 },
  { headerName: 'Permission Id', field: 'userPermissionId', hide: true, flex: 1 },
  { headerName: 'Permission Name', field: 'permissionName', flex: 1 },
  { headerName: 'Permission Type', field: 'permissionTypeName', flex: 1 },
  { headerName: 'Created At', field: 'createdAt', flex: 1 }
]

function onPermissionsClicked(event) {
  if (isPermissionDelete.value) {
    OpenUpsertUserPermission(event.data);
  }
  isPermissionDelete.value = false;
}

function onSiteClicked(event) {
  if (isSiteDelete.value) {
    OpenUpsertUserSite(event.data);
  }
  isSiteDelete.value = false;
}

function OpenUpsertUserPermission(data = null) {
  if (data != null) {
    selectedPermission.value = data;
  }
  else {

    selectedPermission.value = {};
    selectedPermission.value.userId = selectedUserId.value;
  }
  showEditUserPermissionsModal.value = true;
}

function OpenUpsertUserSite(data = null) {
  if (data != null) {
    selectedSite.value = data;
  }
  else {

    selectedSite.value = {};
    selectedSite.value.userId = selectedUserId.value;
  }
  showEditUserSiteModal.value = true;
}

const permissionColumnDefs = computed(() => {
  return isEditMode.value
    ? [
      ...permissionCols,
      {
        headerName: 'Edit',
        cellRenderer: () => `<button class='btn btn-success' style='height: 35px; padding: 5px; width: 60px; margin: 0;''>Edit</button>
                             <button class='btn btn-info' style='height: 35px; padding: 5px; width: 60px; margin: 0;''>X</button>`,
        flex: 1,
        onCellClicked: (params) => {
          OpenUpsertUserPermission(params.data);
        }
      },
      {
        headerName: 'Delete',
        cellRenderer: () => `<button class='btn btn-danger' style='height: 35px; padding: 5px; width: 60px; margin: 0;'>❌</button>`,
        flex: 1,
        onCellClicked: (params) => deletePermission(params.data.userPermissionId)
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

const siteColumnDefs = computed(() => {
  return isEditMode.value
    ? [
      ...siteCols,
      {
        headerName: 'Edit',
        cellRenderer: () => `<button class='btn btn-success' style='height: 35px; padding: 5px; width: 60px; margin: 0;''>Edit</button>`,
        flex: 1,
        onCellClicked: (params) => {
          OpenUpsertUserSite(params.data);
        }
      },
      {
        headerName: 'Delete',
        cellRenderer: () => `<button class='btn btn-danger' style='height: 35px; padding: 5px; width: 60px; margin: 0;'>❌</button>`,
        flex: 1,
        onCellClicked: (params) => deleteSite(params.data.userSiteId)
      }
    ]
    : siteCols
})

function startPolling() {
  PollUsers()
}

function handlePermissionSaved() {
  showEditUserPermissionsModal.value = false;
  PollUserPermissions();
}


function handleSiteSaved() {
  showEditUserSiteModal.value = false;
  PollUserSites();
}
async function onRowClicked(event) {
  selectedUserId.value = event.data.userId
  try {
    await PollUserPermissions();
    await PollUserSites();
    showDetailGrid.value = true
  } catch (err) {
    console.error('Failed to fetch user information:', err)
  }
}

async function PollUsers() {
  try {
    const data = await fetchAllUsers();
    users.value = Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('API fetch failed:', error);
  }
}

async function PollUserPermissions() {
  if (selectedUserId.value != null) {
    try {
      const data = await fetchUserPermissions(selectedUserId.value);
      detailGridData.value = Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Permission fetch failed:', error);
    }
  }
}

async function PollUserSites() {
  if (selectedUserId.value != null) {
    try {
      const data = await fetchUserSites(selectedUserId.value);
      siteDetailGridData.value = Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Site fetch failed:', error);
    }
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    await apiDeleteUser(userId);
    await PollUsers();
  } catch (err) {
    console.error('Failed to delete user:', err);
  }
}

async function deletePermission(userPermissionId) {
  isPermissionDelete.value = true;
  if (!confirm('Are you sure you want to delete this permission?')) return;
  try {
    await apiDeletePermission(userPermissionId);
    await PollUserPermissions();
  } catch (err) {
    console.error('Failed to delete permission:', err);
  }
}

async function deleteSite(siteId) {
  isSiteDelete.value = true;
  if (!confirm('Are you sure you want to delete this site?')) return;
  try {
    await apiDeleteSite(siteId);
    await PollUserSites();
  } catch (err) {
    console.error('Failed to delete site:', err);
  }
}

</script>
<style scoped>
.v-app-bar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.gap-x-2>*+* {
  margin-left: 8px;
}
</style>
