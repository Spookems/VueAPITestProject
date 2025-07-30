// src/services/userService.ts
import type { User } from '@/Interfaces/User'
import type { Permission } from '@/Interfaces/Permission'
import type { Site } from '@/Interfaces/Site'

export async function fetchAllUsers(): Promise<User[]> {
  const response = await fetch('https://localhost:7010/api/Users/GetAllUsers')
  return await response.json()
}

export async function fetchUserPermissions(userId: number): Promise<Permission[]> {
  const response = await fetch(`https://localhost:7010/api/Users/GetUserPermissions/${userId}`)
  return await response.json()
}

export async function fetchUserSites(userId: number): Promise<Site[]> {
  const response = await fetch(`https://localhost:7010/api/Users/GetUserSites/${userId}`)
  return await response.json()
}

export async function deleteUser(userId: number): Promise<void> {
  await fetch(`https://localhost:7010/api/Users/DeleteUser/${userId}`, {
    method: 'DELETE',
  })
}

export async function deletePermission(permissionId: number): Promise<void> {
  await fetch(`https://localhost:7010/api/Users/DeletePermission/${permissionId}`, {
    method: 'DELETE',
  })
}

export async function deleteSite(siteId: number): Promise<void> {
  await fetch(`https://localhost:7010/api/Users/DeleteSite/${siteId}`, {
    method: 'DELETE',
  })
}
