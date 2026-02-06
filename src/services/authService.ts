import type { User, LoginCredentials } from '@/types/user'

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const params = new URLSearchParams({
      action: 'login',
      sheetKey: SPREADSHEET_ID,
      username: credentials.username,
      password: credentials.password,
    })

    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)
    const result = await response.json()

    if (result.status === 'error') {
      throw new Error(result.message)
    }

    return result.data
  },

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User> {
    const params = new URLSearchParams({
      action: 'getUserByUsername',
      sheetKey: SPREADSHEET_ID,
      username: username,
    })

    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)
    const result = await response.json()

    if (result.status === 'error') {
      throw new Error(result.message)
    }

    return result.data
  },

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    const params = new URLSearchParams({
      action: 'updateLastLogin',
      sheetKey: SPREADSHEET_ID,
      userId: userId,
    })

    const response = await fetch(`${APPS_SCRIPT_URL}?${params}`)
    const result = await response.json()

    if (result.status === 'error') {
      throw new Error(result.message)
    }
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
