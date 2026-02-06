import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useLoadData } from './hooks/useLoadData'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Repairs from './pages/Repairs'
import Tasks from './pages/Tasks'
import RepairReports from './pages/RepairReports'
import WorkReports from './pages/WorkReports'
import Users from './pages/Users'

function AppContent() {
  // ໂຫຼດຂໍ້ມູນຈາກ Google Sheets ຕອນເລີ່ມຕົ້ນ
  useLoadData()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="repairs" element={<Repairs />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="repair-reports" element={<RepairReports />} />
        <Route path="work-reports" element={<WorkReports />} />
        <Route path="users" element={
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
