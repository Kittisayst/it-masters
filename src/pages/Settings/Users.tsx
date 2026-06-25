import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '../../services/api';
import SkeletonTable from '../../components/common/SkeletonTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import type { User } from '../../types';

export default function UsersSettings() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await usersApi.findAll()).data as User[] ?? [],
  });

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      editing ? usersApi.update(editing.id, values) : usersApi.insert(values),
    onSuccess: (res) => {
      if (res.success) { toast.success('ບັນທຶກສຳເລັດ'); qc.invalidateQueries({ queryKey: ['users'] }); setFormOpen(false); }
      else toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('ລົບສຳເລັດ'); },
  });

  const openForm = (user?: User) => {
    setEditing(user ?? null);
    form.setFieldsValue(user ? { username: user.username, fullName: user.fullName, position: user.position, password: '' } : {});
    if (!user) form.resetFields();
    setFormOpen(true);
  };

  const columns = [
    { title: 'Username', dataIndex: 'username' },
    { title: 'ຊື່ເຕັມ', dataIndex: 'fullName' },
    { title: 'ຕຳແໜ່ງ', dataIndex: 'position' },
    {
      title: '', width: 80,
      render: (_: unknown, row: User) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openForm(row)} />
          <Popconfirm title="ຢືນຢັນລົບ?" onConfirm={() => deleteMutation.mutate(row.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="ຜູ້ໃຊ້ລະບົບ (IT Staff)"
        primaryAction={<Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>ເພີ່ມຜູ້ໃຊ້</Button>}
      />
      <Card>
        {isLoading ? <SkeletonTable rows={4} cols={4} /> : <ResponsiveTable columns={columns} dataSource={users} rowKey="id" scroll={{ x: 'max-content' }} />}
      </Card>
      <Modal
        title={editing ? 'ແກ້ໄຂຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="password" label={editing ? 'ລະຫັດຜ່ານໃໝ່ (ຫວ່າງ = ບໍ່ປ່ຽນ)' : 'ລະຫັດຜ່ານ'} rules={editing ? [] : [{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="fullName" label="ຊື່ເຕັມ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="ຕຳແໜ່ງ">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
