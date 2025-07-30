<template>
  <v-dialog v-model="isOpen" max-width="600px" persistent>
    <v-card>
      <v-card-title>User Management</v-card-title>
      <v-tabs v-model="tab" background-color="primary" dark>
        <v-tab>Details</v-tab>
        <v-tab>Permissions</v-tab>
        <v-tab>Sites</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- Details Tab -->
        <v-window-item :value="0">
          <v-card-text>
            <v-text-field label="First Name" v-model="form.firstName" />
            <v-text-field label="Last Name" v-model="form.lastName" />
            <v-text-field label="Email" v-model="form.email" />
          </v-card-text>
        </v-window-item>

        <!-- Permissions Tab -->
        <v-window-item :value="1">
          <v-card-text>
            <div v-for="(permission, index) in form.permissions" :key="index" class="d-flex align-center mb-2"
              style="gap: 1rem;">
              <v-text-field v-model="permission.permissionName" label="Permission Name" hide-details />
              <v-select v-model="permission.permissionType" :items="['Read', 'Write', 'Admin']" label="Type"
                hide-details />
              <v-btn icon @click="removePermission(index)">
                ❌
              </v-btn>
            </div>

            <v-btn @click="addPermission" class="mt-2" color="secondary" variant="outlined">➕ Add Permission</v-btn>
          </v-card-text>
        </v-window-item>

        <!-- Sites Tab -->
        <v-window-item :value="2">
          <v-card-text>
            <div v-for="(sites, index) in form.sites" :key="index" class="d-flex align-center mb-2" style="gap: 1rem;">
              <v-text-field v-model="sites.siteName" label="Site Name" />
              <v-select v-model="sites.siteType" :items="['HQ', 'Remote', 'Field']" label="Site Type" />
              <v-btn icon @click="removeSite(index)">
                ❌
              </v-btn>
            </div>

            <v-btn @click="addSite" class="mt-2" color="secondary" variant="outlined">➕ Add Sites</v-btn>
          </v-card-text>
        </v-window-item>
      </v-window>

      <v-card-actions>
        <v-btn color="primary" @click="submit">Submit</v-btn>
        <v-btn @click="emit('close')">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['close', 'saved'])

const isOpen = ref(props.modelValue)
const tab = ref(0)

watch(() => props.modelValue, (val) => isOpen.value = val)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  permissions: [{ permissionName: '', permissionType: '' }],
  sites: [{ siteName: '', siteType: '' }]
})

function addPermission() {
  form.value.permissions.push({ permissionName: '', permissionType: '' })
}

function removePermission(index) {
  form.value.permissions.splice(index, 1)
}

function addSite() {
  form.value.sites.push({ siteName: '', siteType: '' })
}

function removeSite(index) {
  form.value.sites.splice(index, 1)
}


async function submit() {
  const { firstName, lastName, email, permissions, sites } = form.value

  if (!firstName && !lastName && !email) return

  const userId = crypto.randomUUID()

  const payload = {
    user: {
      userId,
      firstName,
      lastName,
      email
    },
    userPermissions: permissions.map(p => ({
      userPermissionId: crypto.randomUUID(),
      userId,
      PermissionName: p.permissionName,
      PermissionTypeName: p.permissionType,
      CreatedAt: new Date().toISOString()
    })),
    userSites: sites.map(s => ({
      userSiteId: crypto.randomUUID(),
      userId,
      siteName: s.siteName,
      siteType: s.siteType,
      createdAt: new Date().toISOString()
    }))
  }

  try {
    const response = await fetch('https://localhost:7010/api/Users/AddUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    if (result === true) {
      emit('saved')
      emit('close')
    } else {
      console.error('Failed to save user.')
    }
  } catch (error) {
    console.error('API error:', error)
  }
}
</script>
