import { GoogleSheetClient } from 'google-sheet-api-client'
import type { User, LoginCredentials } from '@/types/user'

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

// Initialize GoogleSheetClient for authentication
const client = new GoogleSheetClient({
  apiUrl: APPS_SCRIPT_URL,
  sheetKey: SPREADSHEET_ID,
})

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await client.login(credentials.username, credentials.password)
    
    if (response.status === 'error') {
      throw new Error(response.message || 'Login failed')
    }

    return response.data as User
  },

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User> {
    const response = await client.getUserByUsername(username)
    
    if (response.status === 'error') {
      throw new Error(response.message || 'Failed to get user')
    }

    return response.data as User
  },

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    // This functionality would need to be added to the Google Apps Script
    // For now, we'll skip it or implement it via updateData
    console.log('Update last login for user:', userId)
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  /**
   * Save user to localStorage
   */
  saveUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user))
  },

  /**
   * Remove user from localStorage
   */
  removeUser(): void {
    localStorage.removeItem('currentUser')
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  },
}
