import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { departmentsApi } from '../../services/api';
import type { Department } from '../../types';

const { Title } = Typography;

export default function DepartmentsSettings() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form] = Form.useForm();

  const { data = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await departmentsApi.findAll()).data as Department[] ?? [],
  });

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      editing ? departmentsApi.update(editing.id, values) : departmentsApi.insert(values),
    onSuccess: (res) => {
      if (res.success) { toast.success('ບັນທຶກສຳເລັດ'); qc.invalidateQueries({ queryKey: ['departments'] }); setFormOpen(false); }
      else toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast.success('ລົບສຳເລັດ'); },
  });

  const openForm = (dept?: Department) => {
    setEditing(dept ?? null);
    if (dept) form.setFieldsValue(dept); else form.resetFields();
    setFormOpen(true);
  };

  const columns = [
    { title: 'ຊື່ຫ້ອງການ/ພະແນກ', dataIndex: 'name' },
    { title: 'ລະຫັດ', dataIndex: 'code', width: 100 },
    {
      title: '', width: 80,
      render: (_: unknown, row: Department) => (
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>ຫ້ອງການ / ພະແນກ</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>ເພີ່ມ</Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={data} rowKey="id" loading={isLoading} />
      </Card>
      <Modal
        title={editing ? 'ແກ້ໄຂ' : 'ເພີ່ມຫ້ອງການ/ພະແນກ'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="name" label="ຊື່ຫ້ອງການ/ພະແນກ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="ລະຫັດ">
            <Input placeholder="ຕົວຢ່າງ: IT, HR, FIN" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
