import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import type { User } from '../types';

const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onFinish = async (values: { username: string; password: string }) => {
    const res = await authApi.login(values.username, values.password);
    if (res.success && res.data) {
      login(res.data as User);
      navigate('/dashboard');
    } else {
      message.error(res.error ?? 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ margin: 0 }}>IT Masters</Title>
          <Text type="secondary">ລະບົບຄຸ້ມຄອງວຽກງານ IT ວິທະຍາໄລ</Text>
        </div>

        <Form form={form} onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="username" rules={[{ required: true, message: 'ກະລຸນາໃສ່ຊື່ຜູ້ໃຊ້' }]}>
            <Input prefix={<UserOutlined />} placeholder="ຊື່ຜູ້ໃຊ້" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'ກະລຸນາໃສ່ລະຫັດຜ່ານ' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="ລະຫັດຜ່ານ" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              ເຂົ້າສູ່ລະບົບ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
