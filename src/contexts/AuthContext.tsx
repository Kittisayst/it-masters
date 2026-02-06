import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, LoginCredentials, AuthState } from '@/types/user'
import { authService } from '@/services/authService'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Check for existing user on mount
  useEffect(() => {
    const user = authService.getCurrentUser()
    setState({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    })
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      const user = await authService.login(credentials)
      authService.saveUser(user)
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = () => {
    authService.removeUser()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
