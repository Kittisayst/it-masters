import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Spin, Modal, Space } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  ToolOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  ReloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useStore } from '@/store/useStore'
import { useAuth } from '@/contexts/AuthContext'
import { googleSheetsService } from '@/services/googleSheets'
import { format } from 'date-fns'

const { Header, Sider, Content } = AntLayout

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isLoading, setRepairTasks, setWorkTasks, setLoading } = useStore()
  const [collapsed, setCollapsed] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleLogout = () => {
    Modal.confirm({
      title: 'ອອກຈາກລະບົບ',
      content: 'ທ່ານຕ້ອງການອອກຈາກລະບົບບໍ່?',
      okText: 'ອອກຈາກລະບົບ',
      cancelText: 'ຍົກເລີກ',
      onOk: () => {
        logout()
        navigate('/login')
      },
    })
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setLoading(true)
    try {
      const [repairData, workData] = await Promise.all([
        googleSheetsService.getRepairTasks(),
        googleSheetsService.getWorkTasks(),
      ])
      
      if (repairData && Array.isArray(repairData)) {
        setRepairTasks(repairData)
      }
      if (workData && Array.isArray(workData)) {
        setWorkTasks(workData)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
      setLoading(false)
    }
  }

  
  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    user?.role !== 'user' && {
      key: '/repairs',
      icon: <ToolOutlined />,
      label: <Link to="/repairs">ສ້ອມແປງໄອທີ</Link>,
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: <Link to="/tasks">ວຽກງານ</Link>,
    },
    user?.role !== 'user' && {
      key: '/repair-reports',
      icon: <FileTextOutlined />,
      label: <Link to="/repair-reports">ລາຍງານສ້ອມແປງ</Link>,
    },
    {
      key: '/work-reports',
      icon: <BarChartOutlined />,
      label: <Link to="/work-reports">ລາຍງານວຽກງານ</Link>,
    },
    user?.role === 'admin' && {
      key: '/users',
      icon: <TeamOutlined />,
      label: <Link to="/users">ຈັດການຜູ້ໃຊ້</Link>,
    },
  ].filter(Boolean) as MenuProps['items']

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.fullName || user?.username,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ອອກຈາກລະບົບ',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        width={260}
        collapsedWidth={80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="flex items-center justify-center h-16 lao-gradient shadow-lao">
          {!collapsed ? (
            <div className="text-center">
              <h1 className="text-white text-lg font-bold mb-1">IT Management</h1>
              <div className="w-8 h-0.5 bg-yellow-400 mx-auto"></div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-white text-xl font-bold">IT</h1>
              <div className="w-4 h-0.5 bg-yellow-400 mx-auto mt-1"></div>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>

      {/* Main Layout */}
      <AntLayout style={{ marginLeft: collapsed ? 80 : 280, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: 'linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 6px -1px rgba(107, 70, 193, 0.1), 0 2px 4px -1px rgba(107, 70, 193, 0.06)',
            borderBottom: '1px solid rgba(107, 70, 193, 0.1)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          <Space size="middle">
            <span className="text-gray-600">
              {format(new Date(), 'dd/MM/yyyy HH:mm')}
            </span>

            <Button
              type="text"
              icon={<ReloadOutlined spin={isRefreshing} />}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              Sync
            </Button>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }} className="hover:bg-purple-50 px-3 py-2 rounded-lg transition-all">
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'var(--lao-purple)', boxShadow: '0 4px 6px -1px rgba(107, 70, 193, 0.3)' }} />
                <span className="text-gray-800 font-medium">{user?.fullName || user?.username}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ margin: '24px', minHeight: 'calc(100vh - 112px)' }}>
          <Spin spinning={isLoading} size="large">
            <Outlet />
          </Spin>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
