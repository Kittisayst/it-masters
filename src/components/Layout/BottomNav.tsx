import { theme } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  InboxOutlined,
  ExportOutlined,
  ScanOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router';

const NAV_ITEMS = [
  { key: '/dashboard',    label: 'ໜ້າຫຼັກ',     icon: <DashboardOutlined /> },
  { key: '/work-records', label: 'ວຽກປະຈຳວັນ', icon: <FileTextOutlined /> },
  { key: '/qr-scan',      label: 'Scan QR',     icon: <ScanOutlined /> },
  { key: '/borrowing',    label: 'ຢືມອຸປະກອນ', icon: <InboxOutlined /> },
  { key: '/disbursement', label: 'ເບີກຈ່າຍ',    icon: <ExportOutlined /> },
];

export default function BottomNav() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.key;
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? token.colorPrimary : token.colorTextQuaternary,
              padding: '10px 4px 10px',
              position: 'relative',
              transition: 'color 0.15s',
            }}
          >
            {active && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 3,
                  borderRadius: '0 0 4px 4px',
                  background: token.colorPrimary,
                }}
              />
            )}
            <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 11, lineHeight: 1.6, whiteSpace: 'nowrap', fontFamily: "'Noto Sans Lao', sans-serif" }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
