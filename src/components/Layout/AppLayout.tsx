import { useState, useRef } from 'react';
import { Layout, Menu, Avatar, Typography, theme, Grid, Drawer, Popover, Switch, Divider, Button } from 'antd';
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
  KeyOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import BottomNav from './BottomNav';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const navItems = [
  { key: '/dashboard',    icon: <DashboardOutlined />, label: 'ໜ້າຫຼັກ' },
  { key: '/work-records', icon: <FileTextOutlined />,  label: 'ໜ້າວຽກປະຈຳວັນ' },
  { key: '/equipment',    icon: <LaptopOutlined />,    label: 'ອຸປະກອນ IT' },
  { key: '/borrowing',    icon: <InboxOutlined />,     label: 'ຢືມອຸປະກອນ' },
  { key: '/disbursement', icon: <ExportOutlined />,    label: 'ເບີກຈ່າຍ' },
  { key: '/reports',     icon: <BarChartOutlined />,   label: 'ລາຍງານ' },
  { key: '/it-info',    icon: <KeyOutlined />,         label: 'ຂໍ້ມູນ IT' },
  { key: '/qr-print',   icon: <QrcodeOutlined />,     label: 'ພິມ QR' },
  { key: '/qr-scan',    icon: <ScanOutlined />,        label: 'ສະແກນ QR' },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'ຕັ້ງຄ່າ',
    children: [
      { key: '/settings/users',       label: 'ຜູ້ໃຊ້ລະບົບ' },
      { key: '/settings/categories',  label: 'ປະເພດອຸປະກອນ' },
      { key: '/settings/departments', label: 'ຫ້ອງການ/ພະແນກ' },
      { key: '/settings/employees',   label: 'ພະນັກງານ' },
      { key: '/settings/work-types',  label: 'ປະເພດວຽກ' },
    ],
  },
];

function UserPopover({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuthStore();
  const { isDark, setDark } = useThemeStore();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    onClose();
    navigate('/profile');
  };

  return (
    <div style={{ width: 220 }}>
      {/* user header */}
      <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar size={40} icon={<UserOutlined />} style={{ background: token.colorPrimary, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.fullName}
          </div>
          <div style={{ color: token.colorTextSecondary, fontSize: 12 }}>{user?.username}</div>
          {user?.position && (
            <div style={{ color: token.colorTextTertiary, fontSize: 11 }}>{user.position}</div>
          )}
        </div>
      </div>

      <Divider style={{ margin: '4px 0' }} />

      {/* profile */}
      <div
        onClick={handleProfile}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', cursor: 'pointer', borderRadius: 6, margin: '2px 4px',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = token.colorFillSecondary)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <UserOutlined style={{ color: token.colorTextSecondary }} />
        <Text style={{ fontSize: 13 }}>ໂປຣໄຟລ໌</Text>
      </div>

      {/* theme toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', margin: '2px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BulbOutlined style={{ color: token.colorTextSecondary }} />
          <Text style={{ fontSize: 13 }}>{isDark ? 'ໂໝດມືດ' : 'ໂໝດສະຫວ່າງ'}</Text>
        </div>
        <Switch
          size="small"
          checked={isDark}
          onChange={setDark}
          checkedChildren="🌙"
          unCheckedChildren="☀️"
        />
      </div>

      <Divider style={{ margin: '4px 0' }} />

      {/* logout */}
      <div style={{ padding: '4px 8px 8px' }}>
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          block
          style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          onClick={handleLogout}
        >
          ອອກຈາກລະບົບ
        </Button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
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
  const { user } = useAuthStore();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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
      defaultOpenKeys={location.pathname.startsWith('/settings') ? ['settings'] : []}
      items={navItems}
      style={{ border: 'none', marginTop: 8 }}
      onClick={handleMenuClick}
    />
  );

  return (
    <Layout style={{ minHeight: '100dvh', position: 'relative' }}>
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

      {/* Swipe-to-open handle */}
      {isMobile && !drawerOpen && (
        <div
          onTouchStart={onSwipeTouchStart}
          onTouchEnd={onSwipeTouchEnd}
          style={{
            position: 'fixed', top: 64, left: 0,
            width: 24, height: 'calc(100dvh - 64px)', zIndex: 200, touchAction: 'pan-y',
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
            <Button
              type="text"
              icon={<MenuOutlined />}
              aria-label="ເປີດເມນູ"
              onClick={() => setDrawerOpen(true)}
              style={{ fontSize: 18 }}
            />
          ) : (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              aria-label={collapsed ? 'ຂະຫຍາຍເມນູ' : 'ຫຍໍ້ເມນູ'}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
          )}

          {isMobile && (
            <Text strong style={{ fontSize: 15, color: token.colorPrimary, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              IT Masters
            </Text>
          )}

          <Popover
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            content={<UserPopover onClose={() => setPopoverOpen(false)} />}
            trigger="click"
            placement="bottomRight"
            arrow={false}
            styles={{ content: { padding: 0 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = token.colorFillSecondary)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar size="small" icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
              {!isMobile && <Text style={{ fontSize: 13 }}>{user?.fullName}</Text>}
            </div>
          </Popover>
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
