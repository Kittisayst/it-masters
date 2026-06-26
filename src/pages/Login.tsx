import { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import type { User } from '../types';

const { Title, Text } = Typography;

const ICON = `${import.meta.env.BASE_URL}icons/icon-512.png`;

export default function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await authApi.login(values.username, values.password);
      if (res.success && res.data) {
        login(res.data as User);
        navigate('/dashboard');
      } else {
        setErrorMsg(res.error ?? 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Brand panel - desktop only */}
      <div className="login-brand">
        <div className="login-brand-bg" />
        <div className="login-brand-content">
          <img src={ICON} alt="IT Masters" className="login-brand-logo" />
          <Title level={2} style={{ color: '#fff', margin: '0 0 8px', fontWeight: 700 }}>
            IT Masters
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'block', letterSpacing: '0.01em' }}>
            ວິທະຍາໄລ ເຕັກນິກ-ວິຊາຊີບ ຫຼວງພະບາງ
          </Text>
        </div>
      </div>

      {/* Form panel */}
      <div className="login-form-panel">
        <div className="login-form-inner content-enter">
          {/* Mobile brand header */}
          <div className="login-mobile-header">
            <img src={ICON} alt="IT Masters" className="login-mobile-logo" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1a3a6b', lineHeight: 1.3 }}>IT Masters</div>
              <div style={{ fontSize: 11, color: '#888', lineHeight: 1.3 }}>ວິທະຍາໄລ ເຕັກນິກ-ວິຊາຊີບ ຫຼວງພະບາງ</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Title level={3} style={{ margin: '0 0 6px', fontSize: 22 }}>ເຂົ້າສູ່ລະບົບ</Title>
            <Text type="secondary" style={{ fontSize: 14 }}>ໃສ່ຂໍ້ມູນຜູ້ໃຊ້ຂອງທ່ານ</Text>
          </div>

          {errorMsg && (
            <Alert
              description={errorMsg}
              type="error"
              showIcon
              style={{ marginBottom: 24, borderRadius: 8 }}
            />
          )}

          <Form form={form} onFinish={onFinish} layout="vertical" size="large">
            <Form.Item
              name="username"
              label="ຊື່ຜູ້ໃຊ້"
              rules={[{ required: true, message: 'ກະລຸນາໃສ່ຊື່ຜູ້ໃຊ້' }]}
            >
              <Input placeholder="ໃສ່ຊື່ຜູ້ໃຊ້" autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label="ລະຫັດຜ່ານ"
              rules={[{ required: true, message: 'ກະລຸນາໃສ່ລະຫັດຜ່ານ' }]}
            >
              <Input.Password placeholder="ໃສ່ລະຫັດຜ່ານ" autoComplete="current-password" />
            </Form.Item>
            <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>
                ເຂົ້າສູ່ລະບົບ
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
