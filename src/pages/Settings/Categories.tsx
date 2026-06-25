import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi } from '../../services/api';
import type { Category } from '../../types';

const { Title } = Typography;

export default function CategoriesSettings() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.findAll();
      return (res.data as Category[]) ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      editing
        ? categoriesApi.update(editing.id, values)
        : categoriesApi.insert(values),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('ບັນທຶກສຳເລັດ');
        qc.invalidateQueries({ queryKey: ['categories'] });
        setFormOpen(false);
      } else {
        toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
      }
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('ລົບສຳເລັດ');
    },
    onError: () => toast.error('ລົບບໍ່ສຳເລັດ'),
  });

  const openForm = (cat?: Category) => {
    setEditing(cat ?? null);
    if (cat) {
      form.setFieldsValue({ name: cat.name, description: cat.description });
    } else {
      form.resetFields();
    }
    setFormOpen(true);
  };

  const columns = [
    { title: 'ຊື່ປະເພດ', dataIndex: 'name' },
    { title: 'ລາຍລະອຽດ', dataIndex: 'description', ellipsis: true },
    {
      title: '', width: 80,
      render: (_: unknown, row: Category) => (
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
        <Title level={4} style={{ margin: 0 }}>ປະເພດອຸປະກອນ (Categories)</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>
          ເພີ່ມປະເພດ
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editing ? 'ແກ້ໄຂປະເພດ' : 'ເພີ່ມປະເພດ'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="name" label="ຊື່ປະເພດ" rules={[{ required: true, message: 'ກະລຸນາໃສ່ຊື່ປະເພດ' }]}>
            <Input placeholder="ຕົວຢ່າງ: ຄອມພິວເຕີ" />
          </Form.Item>
          <Form.Item name="description" label="ລາຍລະອຽດ">
            <Input.TextArea rows={3} placeholder="ອະທິບາຍສັ້ນໆ ກ່ຽວກັບປະເພດນີ້" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
