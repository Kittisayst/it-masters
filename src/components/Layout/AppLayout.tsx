import { useState, useRef } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, theme, Grid, Drawer } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router';
import {
  DashboardOutlined,
  FileTextOutlined,
  LaptopOutlined,
  InboxOutlined,
  ExportOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  BarChartOutlined,
  QrcodeOutlined,
  ScanOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import BottomNav from './BottomNav';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const navItems = [
  { key: '/dashboard',    icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/work-records', icon: <FileTextOutlined />,  label: 'ໜ້າວຽກປະຈຳວັນ' },
  { key: '/equipment',    icon: <LaptopOutlined />,    label: 'ອຸປະກອນ IT' },
  { key: '/borrowing',    icon: <InboxOutlined />,     label: 'ຢືມອຸປະກອນ' },
  { key: '/disbursement', icon: <ExportOutlined />,    label: 'ເບີກຈ່າຍ' },
  { key: '/reports',     icon: <BarChartOutlined />,   label: 'ລາຍງານ' },
  { key: '/qr-print',   icon: <QrcodeOutlined />,     label: 'Print QR' },
  { key: '/qr-scan',    icon: <ScanOutlined />,        label: 'Scan QR' },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'ຕັ້ງຄ່າ',
    children: [
      { key: '/settings/users',       label: 'ຜູ້ໃຊ້ລະບົບ' },
      { key: '/settings/categories',  label: 'ປະເພດອຸປະກອນ' },
      { key: '/settings/departments', label: 'ຫ້ອງການ/ພະແນກ' },
      { key: '/settings/employees',   label: 'ພະນັກງານ' },
    ],
  },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const swipeStartX = useRef<number | null>(null);

  const onSwipeTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
  };
  const onSwipeTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    if (dx > 50) setDrawerOpen(true);
    swipeStartX.current = null;
  };
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: 'ອອກຈາກລະບົບ', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') { logout(); navigate('/login'); }
    },
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (!key.startsWith('settings')) {
      navigate(key);
      if (isMobile) setDrawerOpen(false);
    }
  };

  const sidebarLogo = (isCollapsed: boolean) => (
    <div style={{ padding: isCollapsed ? '16px 8px' : '16px 20px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
      <Text strong style={{ fontSize: isCollapsed ? 12 : 16, color: token.colorPrimary, whiteSpace: 'nowrap', overflow: 'hidden', display: 'block' }}>
        {isCollapsed ? 'IT' : 'IT Masters'}
      </Text>
    </div>
  );

  const sidebarMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={['settings']}
      items={navItems}
      style={{ border: 'none', marginTop: 8 }}
      onClick={handleMenuClick}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={220}
          style={{ background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorderSecondary}` }}
        >
          {sidebarLogo(collapsed)}
          {sidebarMenu}
        </Sider>
      )}

      {/* Swipe-to-open handle — invisible strip on left edge, mobile only */}
      {isMobile && !drawerOpen && (
        <div
          onTouchStart={onSwipeTouchStart}
          onTouchEnd={onSwipeTouchEnd}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 24,
            height: '100dvh',
            zIndex: 200,
            touchAction: 'pan-y',
          }}
        />
      )}

      {/* Mobile drawer */}
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ wrapper: { width: 220 }, body: { padding: 0 }, header: { display: 'none' } }}
      >
        {sidebarLogo(false)}
        {sidebarMenu}
      </Drawer>

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 12px' : '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          {isMobile ? (
            <span
              onClick={() => setDrawerOpen(true)}
              style={{ cursor: 'pointer', fontSize: 20, color: token.colorTextSecondary, padding: '12px 16px 12px 4px', margin: '-12px -16px -12px -4px', display: 'inline-flex', alignItems: 'center' }}
            >
              <MenuOutlined />
            </span>
          ) : (
            <span onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', fontSize: 18, color: token.colorTextSecondary }}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
          )}

          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
              {!isMobile && <Text>{user?.fullName}</Text>}
            </div>
          </Dropdown>
        </Header>

        <Content style={{
          margin: isMobile ? '12px 8px' : '24px',
          paddingBottom: isMobile ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : undefined,
          background: token.colorBgLayout,
        }}>
          <Outlet />
        </Content>

        {isMobile && <BottomNav />}
      </Layout>
    </Layout>
  );
}
