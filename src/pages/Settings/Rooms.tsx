import { useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roomsApi } from '../../services/api';
import { useEmployees } from '../../hooks/useReferenceData';
import SkeletonTable from '../../components/common/SkeletonTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import StatusBadge from '../../components/common/StatusBadge';
import type { Room } from '../../types';

export default function RoomsSettings() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form] = Form.useForm();

  const { data: employees = [] } = useEmployees();
  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullName]));

  const { data = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await roomsApi.findAll()).data as Room[] ?? [],
  });

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      editing ? roomsApi.update(editing.id, values) : roomsApi.insert(values),
    onSuccess: (res) => {
      if (res.success) { toast.success('ບັນທຶກສຳເລັດ'); qc.invalidateQueries({ queryKey: ['rooms'] }); setFormOpen(false); }
      else toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); toast.success('ລົບສຳເລັດ'); },
  });

  const openForm = (room?: Room) => {
    setEditing(room ?? null);
    if (room) form.setFieldsValue(room); else form.resetFields();
    setFormOpen(true);
  };

  const columns = [
    { title: 'ລະຫັດ', dataIndex: 'code', width: 100 },
    { title: 'ຊື່ຫ້ອງ', dataIndex: 'name' },
    { title: 'ສະຖານທີ່', dataIndex: 'location' },
    { title: 'ຈຳນວນເຄື່ອງ', dataIndex: 'computerCount', width: 110 },
    { title: 'ຜູ້ຮັບຜິດຊອບ', dataIndex: 'responsiblePerson', render: (v: string) => empMap[v] ?? '-' },
    { title: 'ສະຖານະ', dataIndex: 'status', render: (v: string) => <StatusBadge status={v} /> },
    {
      title: '', width: 80,
      render: (_: unknown, row: Room) => (
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
        title="ຫ້ອງຄອມ"
        primaryAction={<Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>ເພີ່ມ</Button>}
      />
      <Card>
        {isLoading
          ? <SkeletonTable rows={4} cols={6} />
          : <ResponsiveTable columns={columns} dataSource={data} rowKey="id" scroll={{ x: 'max-content' }} mobilePrimaryFields={['code', 'name', 'status']} />
        }
      </Card>
      <Modal
        title={editing ? 'ແກ້ໄຂຫ້ອງຄອມ' : 'ເພີ່ມຫ້ອງຄອມ'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="code" label="ລະຫັດຫ້ອງ" rules={[{ required: true }]}>
            <Input placeholder="ຕົວຢ່າງ: A101" />
          </Form.Item>
          <Form.Item name="name" label="ຊື່ຫ້ອງ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="ສະຖານທີ່ (ຕຶກ/ຊັ້ນ)">
            <Input />
          </Form.Item>
          <Form.Item name="computerCount" label="ຈຳນວນເຄື່ອງຄອມ">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="responsiblePerson" label="ຜູ້ຮັບຜິດຊອບ">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={employees.map((e) => ({ value: e.id, label: e.fullName }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
