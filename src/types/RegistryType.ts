import type { User } from './UserType'

export type RegistryRecord = {
  lines: string
  title: string
  id: string
  createdAt: number
  updatedAt?: number
  users: User[]
}
