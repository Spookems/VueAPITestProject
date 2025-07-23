<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Edit User Site</h2>
      <p v-if="validationMessage" class="text-error">{{ validationMessage }}</p>
      <p v-if="saveResultMessage" class="text-success">{{ saveResultMessage }}</p>
      <input v-model="form.UserSiteId" class="input" hidden="true" />

      <label>Site Id</label>
      <input v-model="form.userSiteId" class="input" disabled="true" />

      <label>Site Name</label>
      <input v-model="form.siteName" class="input" />

      <label>Site Type</label>
      <input v-model="form.siteType" class="input" />

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
  site: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'saved'])
const form = ref({
  userId: props.site.userId,
  userSiteId: props.site.userSiteId,
  siteName: props.site.siteName,
  siteType: props.site.siteType,
  createdAt: props.site.createdAt
})
const validationMessage = ref('')
const saveResultMessage = ref('')

async function submit() {
  const { userId, userSiteId, siteName, siteType } = form.value

  if (!siteName && !siteType) {
    validationMessage.value = 'Please enter at least one field.'
    setTimeout(() => (validationMessage.value = ''), 5000)
    return
  }
  try {
    const response = await fetch('https://localhost:7010/api/Users/UpsertSite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userSiteId,
        siteName,
        siteType
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
