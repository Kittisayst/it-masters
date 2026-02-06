import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wrench, ClipboardList, FileText, BarChart3, RefreshCw, Menu, X, LogOut, User, Users } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useAuth } from '@/contexts/AuthContext'
import { googleSheetsService } from '@/services/googleSheets'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isLoading, setRepairTasks, setWorkTasks, setLoading } = useStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'technician', 'user'] },
    { path: '/repairs', icon: Wrench, label: 'ສ້ອມແປງໄອທີ', roles: ['admin', 'technician'] },
    { path: '/tasks', icon: ClipboardList, label: 'ວຽກງານ', roles: ['admin', 'technician', 'user'] },
    { path: '/repair-reports', icon: FileText, label: 'ລາຍງານສ້ອມແປງ', roles: ['admin', 'technician'] },
    { path: '/work-reports', icon: BarChart3, label: 'ລາຍງານວຽກງານ', roles: ['admin', 'technician', 'user'] },
    { path: '/users', icon: Users, label: 'ຈັດການຜູ້ໃຊ້', roles: ['admin'] },
  ]

  // Filter menu items based on user role
  const visibleNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setLoading(true)
    try {
      const [repairData, workData] = await Promise.all([
        googleSheetsService.getRepairTasks(),
        googleSheetsService.getWorkTasks(),
      ])
      
      if (repairData && Array.isArray(repairData)) {
        setRepairTasks(repairData as any)
      }
      if (workData && Array.isArray(workData)) {
        setWorkTasks(workData as any)
      }
      console.log('✅ Refreshed data from Google Sheets')
    } catch (error) {
      console.error('❌ Error refreshing data:', error)
      alert('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ')
    } finally {
      setIsRefreshing(false)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {isSidebarOpen && (
            <h1 className="text-lg font-bold text-gray-900">
              ລະບົບຄຸ້ມຄອງໄອທີ
            </h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        {user && (
          <div className="p-3 border-t border-gray-200">
            <div className={`flex items-center ${isSidebarOpen ? 'mb-3' : 'justify-center mb-2'}`}>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              {isSidebarOpen && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.role === 'admin' ? 'ຜູ້ດູແລລະບົບ' : user.role === 'technician' ? 'ຊ່າງເຕັກນິກ' : 'ຜູ້ໃຊ້'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>ອອກຈາກລະບົບ</span>
            </button>
          </div>
        )}

        {/* Sync Button */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className={`w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isRefreshing || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={!isSidebarOpen ? 'Sync ຂໍ້ມູນ' : undefined}
          >
            <RefreshCw
              className={`w-5 h-5 ${isSidebarOpen ? 'mr-2' : ''} ${
                isRefreshing || isLoading ? 'animate-spin' : ''
              }`}
            />
            {isSidebarOpen && (
              <span>
                {isRefreshing || isLoading ? 'ກຳລັງໂຫຼດ...' : 'Sync ຂໍ້ມູນ'}
              </span>
            )}
          </button>
        </div>

        {/* Loading Indicator */}
        {(isLoading || isRefreshing) && isSidebarOpen && (
          <div className="px-3 pb-3">
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              <span>ກຳລັງ sync ກັບ Google Sheets...</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center">
            {(isLoading || isRefreshing) && (
              <div className="flex items-center text-sm text-gray-600">
                <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600" />
                <span>ກຳລັງໂຫຼດຂໍ້ມູນ...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.fullName}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-gray-500">{user.department}</span>
              </div>
            )}
            <div className="text-sm text-gray-500">
              {format(new Date(), 'dd/MM/yyyy')}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ອອກຈາກລະບົບ</AlertDialogTitle>
            <AlertDialogDescription>
              ທ່ານຕ້ອງການອອກຈາກລະບົບບໍ່?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ຍົກເລີກ</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>ອອກຈາກລະບົບ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
