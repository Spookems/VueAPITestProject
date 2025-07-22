<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Add New User</h2>
      <p v-if="validationMessage" class="text-error">{{ validationMessage }}</p>
      <p v-if="saveResultMessage" class="text-success">{{ saveResultMessage }}</p>

      <label>First Name</label>
      <input v-model="form.firstName" class="input" />

      <label>Last Name</label>
      <input v-model="form.lastName" class="input" />

      <label>Email</label>
      <input v-model="form.email" class="input" />

      <div class="modal-buttons">
        <button @click="submit" class="btn btn-primary">Submit</button>
        <button @click="$emit('close')" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'saved'])

const form = ref({ firstName: '', lastName: '', email: '' })
const validationMessage = ref('')
const saveResultMessage = ref('')

async function submit() {
  const { firstName, lastName, email } = form.value

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
