import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, theme } from 'antd';
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
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

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
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token } = theme.useToken();

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: 'ອອກຈາກລະບົບ', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') { logout(); navigate('/login'); }
    },
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{ background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div style={{ padding: collapsed ? '16px 8px' : '16px 20px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Text strong style={{ fontSize: collapsed ? 12 : 16, color: token.colorPrimary, whiteSpace: 'nowrap', overflow: 'hidden', display: 'block' }}>
            {collapsed ? 'IT' : 'IT Masters'}
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['settings']}
          items={navItems}
          style={{ border: 'none', marginTop: 8 }}
          onClick={({ key }) => { if (!key.startsWith('settings')) navigate(key); }}
        />
      </Sider>

      <Layout>
        <Header style={{ background: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorderSecondary}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <span
            onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: 'pointer', fontSize: 18, color: token.colorTextSecondary }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>

          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
              <Text>{user?.fullName}</Text>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, background: token.colorBgLayout }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
