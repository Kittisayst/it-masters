import { useState } from 'react';
import { Avatar, Button, Card, Descriptions, Form, Input, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import PageHeader from '../components/common/PageHeader';

const { Title } = Typography;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [showPwForm, setShowPwForm] = useState(false);

  const changePwMutation = useMutation({
    mutationFn: (values: { oldPassword: string; newPassword: string }) =>
      authApi.changePassword(user!.username, values.oldPassword, values.newPassword),
    onSuccess: (res) => {
      if ((res as { success: boolean; error?: string }).success) {
        toast.success('ປ່ຽນລະຫັດຜ່ານສຳເລັດ');
        form.resetFields();
        setShowPwForm(false);
      } else {
        toast.error((res as { error?: string }).error ?? 'ບໍ່ສຳເລັດ');
      }
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  return (
    <div style={{ maxWidth: 560 }}>
      <PageHeader title="ໂປຣໄຟລ໌ຂອງຂ້ອຍ" />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ background: '#5c6bc0', flexShrink: 0 }} />
          <div>
            <Title level={5} style={{ margin: 0 }}>{user?.fullName}</Title>
            <div style={{ color: '#8c8c8c', fontSize: 13 }}>{user?.position}</div>
          </div>
        </div>

        <Descriptions column={1} size="small" styles={{ label: { color: '#8c8c8c', width: 120 } }}>
          <Descriptions.Item label="Username">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="ຊື່ເຕັມ">{user?.fullName}</Descriptions.Item>
          <Descriptions.Item label="ຕຳແໜ່ງ">{user?.position ?? '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={<span><LockOutlined style={{ marginRight: 6 }} />ປ່ຽນລະຫັດຜ່ານ</span>}
        extra={
          !showPwForm && (
            <Button size="small" onClick={() => setShowPwForm(true)}>ປ່ຽນ</Button>
          )
        }
      >
        {showPwForm ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => changePwMutation.mutate(v)}
            style={{ maxWidth: 360 }}
          >
            <Form.Item name="oldPassword" label="ລະຫັດຜ່ານເກົ່າ" rules={[{ required: true, message: 'ໃສ່ລະຫັດຜ່ານເກົ່າ' }]}>
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item name="newPassword" label="ລະຫັດຜ່ານໃໝ່" rules={[{ required: true, min: 4, message: 'ຢ່າງໜ້ອຍ 4 ຕົວອັກສອນ' }]}>
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item name="confirmPassword" label="ຢືນຢັນລະຫັດໃໝ່" rules={[
              { required: true, message: 'ຢືນຢັນລະຫັດຜ່ານ' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('ລະຫັດຜ່ານບໍ່ຕົງກັນ'));
                },
              }),
            ]}>
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="primary" htmlType="submit" loading={changePwMutation.isPending}>ບັນທຶກ</Button>
              <Button onClick={() => { setShowPwForm(false); form.resetFields(); }}>ຍົກເລີກ</Button>
            </div>
          </Form>
        ) : (
          <div style={{ color: '#8c8c8c', fontSize: 13 }}>ກົດ "ປ່ຽນ" ເພື່ອອັບເດດລະຫັດຜ່ານ</div>
        )}
      </Card>
    </div>
  );
}
