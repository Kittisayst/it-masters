import { GoogleSheetClient } from 'google-sheet-api-client'
import type { RepairTask, WorkTask } from '@/types/task'
import type { User } from '@/types/user'

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || ''

console.log('✅ Google Sheets Service initialized')
console.log('📋 Spreadsheet ID:', SPREADSHEET_ID)

// Initialize GoogleSheetClient
const client = new GoogleSheetClient({
  apiUrl: APPS_SCRIPT_URL,
  sheetKey: SPREADSHEET_ID,
})

// Helper function to find row index by ID
async function findRowIndexById(sheetName: string, id: string): Promise<number> {
  const response = await client.getData(sheetName)
  if (response.status === 'success' && response.data) {
    const data = response.data as Array<{ id: string }>
    const index = data.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${sheetName}`)
    }
    return index
  }
  throw new Error(`Failed to fetch data from ${sheetName}`)
}

export const googleSheetsService = {
  // ==================== REPAIR TASKS ====================
  async getRepairTasks(): Promise<RepairTask[]> {
    try {
      const response = await client.getData('RepairTasks')
      if (response.status === 'success') {
        return (response.data || []) as RepairTask[]
      }
      console.error('Error fetching repair tasks:', response.message)
      return []
    } catch (error) {
      console.error('Error fetching repair tasks:', error)
      return []
    }
  },

  async addRepairTask(task: Omit<RepairTask, 'id'>): Promise<RepairTask> {
    try {
      const newTask: RepairTask = {
        ...task,
        id: Date.now().toString(),
      }
      const response = await client.insertData('RepairTasks', newTask)
      if (response.status === 'success') {
        return newTask
      }
      throw new Error(response.message || 'Failed to add repair task')
    } catch (error) {
      console.error('Error adding repair task:', error)
      throw error
    }
  },

  async updateRepairTaskById(id: string, task: Partial<RepairTask>): Promise<RepairTask> {
    try {
      const rowIndex = await findRowIndexById('RepairTasks', id)
      const response = await client.updateData('RepairTasks', rowIndex, task)
      if (response.status === 'success') {
        return { ...task, id } as RepairTask
      }
      throw new Error(response.message || 'Failed to update repair task')
    } catch (error) {
      console.error('Error updating repair task:', error)
      throw error
    }
  },

  async deleteRepairTaskById(id: string): Promise<boolean> {
    try {
      const rowIndex = await findRowIndexById('RepairTasks', id)
      const response = await client.deleteData('RepairTasks', rowIndex)
      if (response.status === 'success') {
        return true
      }
      throw new Error(response.message || 'Failed to delete repair task')
    } catch (error) {
      console.error('Error deleting repair task:', error)
      throw error
    }
  },

  // ==================== WORK TASKS ====================
  async getWorkTasks(): Promise<WorkTask[]> {
    try {
      const response = await client.getData('WorkTasks')
      if (response.status === 'success') {
        return (response.data || []) as WorkTask[]
      }
      console.error('Error fetching work tasks:', response.message)
      return []
    } catch (error) {
      console.error('Error fetching work tasks:', error)
      return []
    }
  },

  async addWorkTask(task: Omit<WorkTask, 'id'>): Promise<WorkTask> {
    try {
      const newTask: WorkTask = {
        ...task,
        id: Date.now().toString(),
      }
      const response = await client.insertData('WorkTasks', newTask)
      if (response.status === 'success') {
        return newTask
      }
      throw new Error(response.message || 'Failed to add work task')
    } catch (error) {
      console.error('Error adding work task:', error)
      throw error
    }
  },

  async updateWorkTaskById(id: string, task: Partial<WorkTask>): Promise<WorkTask> {
    try {
      const rowIndex = await findRowIndexById('WorkTasks', id)
      const response = await client.updateData('WorkTasks', rowIndex, task)
      if (response.status === 'success') {
        return { ...task, id } as WorkTask
      }
      throw new Error(response.message || 'Failed to update work task')
    } catch (error) {
      console.error('Error updating work task:', error)
      throw error
    }
  },

  async deleteWorkTaskById(id: string): Promise<boolean> {
    try {
      const rowIndex = await findRowIndexById('WorkTasks', id)
      const response = await client.deleteData('WorkTasks', rowIndex)
      if (response.status === 'success') {
        return true
      }
      throw new Error(response.message || 'Failed to delete work task')
    } catch (error) {
      console.error('Error deleting work task:', error)
      throw error
    }
  },

  // ==================== USERS ====================
  async getUsers(): Promise<User[]> {
    try {
      const response = await client.getData('Users')
      if (response.status === 'success') {
        const users = (response.data || []) as User[]
        return users.map((user) => ({
          ...user,
          role: user.role || 'user',
          status: user.status || 'active',
        }))
      }
      console.error('Error fetching users:', response.message)
      return []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },

  async addUser(user: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<User> {
    try {
      const response = await client.register(user.username, user.password, {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
      })
      if (response.status === 'success') {
        return response.data as User
      }
      throw new Error(response.message || 'Failed to add user')
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  },

  async updateUserById(id: string, userData: Partial<User>): Promise<User> {
    try {
      const rowIndex = await findRowIndexById('Users', id)
      const response = await client.updateData('Users', rowIndex, userData)
      if (response.status === 'success') {
        return { ...userData, id } as User
      }
      throw new Error(response.message || 'Failed to update user')
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  async deleteUserById(id: string): Promise<boolean> {
    try {
      const rowIndex = await findRowIndexById('Users', id)
      const response = await client.deleteData('Users', rowIndex)
      if (response.status === 'success') {
        return true
      }
      throw new Error(response.message || 'Failed to delete user')
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  // ==================== UTILITY ====================
  async refreshData() {
    const [repairTasks, workTasks] = await Promise.all([
      this.getRepairTasks(),
      this.getWorkTasks(),
    ])
    return { repairTasks, workTasks }
  },
}
