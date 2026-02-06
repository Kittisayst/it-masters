export interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: 'admin' | 'technician' | 'user'
  department: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
