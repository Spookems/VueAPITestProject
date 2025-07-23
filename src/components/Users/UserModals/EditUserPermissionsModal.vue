<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Edit User Permissions</h2>
      <p v-if="validationMessage" class="text-error">{{ validationMessage }}</p>
      <p v-if="saveResultMessage" class="text-success">{{ saveResultMessage }}</p>
      <input v-model="form.userId" class="input" hidden="true" />

      <label>Permission Id</label>
      <input v-model="form.userPermissionId" class="input" disabled="true" />

      <label>Permission Name</label>
      <input v-model="form.permissionName" class="input" />

      <label>Permission Type</label>
      <input v-model="form.permissionType" class="input" />

      <label>Created At</label>
      <input v-model="form.createdAt" class="input" disabled="true">
      <div class="modal-buttons">
        <button @click="submit" class="btn btn-primary">Submit</button>
        <button @click="$emit('close')" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  permission: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'saved'])
const form = ref({
  userId: props.permission.userId,
  userPermissionId: props.permission.userPermissionId,
  permissionName: props.permission.permissionName,
  permissionType: props.permission.permissionType,
  createdAt: props.permission.createdAt
})
const validationMessage = ref('')
const saveResultMessage = ref('')

async function submit() {
  const { userId, userPermissionId, permissionName, permissionType } = form.value

  if (!permissionName && !permissionType && !email) {
    validationMessage.value = 'Please enter at least one field.'
    setTimeout(() => (validationMessage.value = ''), 5000)
    return
  }
  alert(userId);
  try {
    const response = await fetch('https://localhost:7010/api/Users/UpsertPermission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userPermissionId,
        permissionName,
        permissionType
      })
    })
    const result = await response.json();
    saveResultMessage.value = result === true ? '✅ User saved successfully.' : '❌ Error saving user.'
    emit('saved')
    emit('close')
  } catch (error) {
    console.error('API error:', error)
    saveResultMessage.value = '❌ API error saving user.'
  }

  setTimeout(() => (saveResultMessage.value = ''), 5000)
}
</script>
