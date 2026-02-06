import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'technician' | 'user'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">ກຳລັງໂຫຼດ...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role if required
  if (requiredRole && user) {
    const roleHierarchy = {
      admin: 3,
      technician: 2,
      user: 1,
    }

    const userLevel = roleHierarchy[user.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    if (userLevel < requiredLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ບໍ່ມີສິດເຂົ້າເຖິງ</h1>
            <p className="text-gray-600 mb-4">ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້</p>
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ກັບຄືນ
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
