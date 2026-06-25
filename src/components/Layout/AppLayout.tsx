import { useState, useEffect, useRef } from 'react';
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
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const navItems = [
  { key: '/dashboard',    icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/work-records', icon: <FileTextOutlined />,  label: 'ໜ້າວຽກປະຈຳວັນ' },
  { key: '/equipment',    icon: <LaptopOutlined />,    label: 'ອຸປະກອນ IT' },
  { key: '/borrowing',    icon: <InboxOutlined />,     label: 'ຢືມອຸປະກອນ' },
  { key: '/disbursement', icon: <ExportOutlined />,    label: 'ເບີກຈ່າຍ' },
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
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      touchStartX.current = x < 32 ? x : null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (dx > 60) setDrawerOpen(true);
      touchStartX.current = null;
    };
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, []);
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
    <Layout style={{ minHeight: '100vh' }}>
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
            <span onClick={() => setDrawerOpen(true)} style={{ cursor: 'pointer', fontSize: 18, color: token.colorTextSecondary }}>
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

        <Content style={{ margin: isMobile ? '12px 8px' : '24px', background: token.colorBgLayout }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
