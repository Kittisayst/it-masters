import { GoogleSheetClient } from 'google-sheet-api-client'

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || ''

console.log('✅ Google Sheets Service initialized')
console.log('📋 Spreadsheet ID:', SPREADSHEET_ID)

// Initialize GoogleSheetClient
const client = new GoogleSheetClient({
  apiUrl: APPS_SCRIPT_URL,
  sheetKey: SPREADSHEET_ID,
})

export const googleSheetsService = {
  async getRepairTasks() {
    try {
      const response = await client.getData('RepairTasks')
      if (response.status === 'success') {
        return response.data || []
      }
      console.error('Error fetching repair tasks:', response.message)
      return []
    } catch (error) {
      console.error('Error fetching repair tasks:', error)
      return []
    }
  },

  async addRepairTask(task: any) {
    try {
      const response = await client.insertData('RepairTasks', task)
      if (response.status === 'success') {
        return task
      }
      throw new Error(response.message || 'Failed to add repair task')
    } catch (error) {
      console.error('Error adding repair task:', error)
      throw error
    }
  },

  async updateRepairTask(index: number, task: any) {
    try {
      const response = await client.updateData('RepairTasks', index, task)
      if (response.status === 'success') {
        return task
      }
      throw new Error(response.message || 'Failed to update repair task')
    } catch (error) {
      console.error('Error updating repair task:', error)
      throw error
    }
  },

  async deleteRepairTask(index: number) {
    try {
      const response = await client.deleteData('RepairTasks', index)
      if (response.status === 'success') {
        return true
      }
      throw new Error(response.message || 'Failed to delete repair task')
    } catch (error) {
      console.error('Error deleting repair task:', error)
      throw error
    }
  },

  async getWorkTasks() {
    try {
      const response = await client.getData('WorkTasks')
      if (response.status === 'success') {
        return response.data || []
      }
      console.error('Error fetching work tasks:', response.message)
      return []
    } catch (error) {
      console.error('Error fetching work tasks:', error)
      return []
    }
  },

  async addWorkTask(task: any) {
    try {
      const response = await client.insertData('WorkTasks', task)
      if (response.status === 'success') {
        return task
      }
      throw new Error(response.message || 'Failed to add work task')
    } catch (error) {
      console.error('Error adding work task:', error)
      throw error
    }
  },

  async updateWorkTask(index: number, task: any) {
    try {
      const response = await client.updateData('WorkTasks', index, task)
      if (response.status === 'success') {
        return task
      }
      throw new Error(response.message || 'Failed to update work task')
    } catch (error) {
      console.error('Error updating work task:', error)
      throw error
    }
  },

  async deleteWorkTask(index: number) {
    try {
      const response = await client.deleteData('WorkTasks', index)
      if (response.status === 'success') {
        return true
      }
      throw new Error(response.message || 'Failed to delete work task')
    } catch (error) {
      console.error('Error deleting work task:', error)
      throw error
    }
  },
}
