import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import { Toaster } from 'sonner';

import { useAuthStore } from './store/useAuthStore';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkRecordsPage from './pages/WorkRecords';
import EquipmentPage from './pages/Equipment';
import BorrowingPage from './pages/Borrowing';
import DisbursementPage from './pages/Disbursement';
import UsersSettings from './pages/Settings/Users';
import CategoriesSettings from './pages/Settings/Categories';
import DepartmentsSettings from './pages/Settings/Departments';
import EmployeesSettings from './pages/Settings/Employees';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#5c6bc0', borderRadius: 8, fontFamily: "'Noto Sans Lao', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" } }}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"    element={<Dashboard />} />
                <Route path="work-records" element={<WorkRecordsPage />} />
                <Route path="equipment"    element={<EquipmentPage />} />
                <Route path="borrowing"    element={<BorrowingPage />} />
                <Route path="disbursement" element={<DisbursementPage />} />
                <Route path="settings/users"       element={<UsersSettings />} />
                <Route path="settings/categories"  element={<CategoriesSettings />} />
                <Route path="settings/departments" element={<DepartmentsSettings />} />
                <Route path="settings/employees"   element={<EmployeesSettings />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}
