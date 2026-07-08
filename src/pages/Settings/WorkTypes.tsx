import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workTypesApi } from '../../services/api';
import SkeletonTable from '../../components/common/SkeletonTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import type { WorkType } from '../../types';

export default function WorkTypesSettings() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkType | null>(null);
  const [form] = Form.useForm();

  const { data: workTypes = [], isLoading } = useQuery({
    queryKey: ['workTypes'],
    queryFn: async () => {
      const res = await workTypesApi.findAll();
      return (res.data as WorkType[]) ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      editing
        ? workTypesApi.update(editing.id, values)
        : workTypesApi.insert(values),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('ບັນທຶກສຳເລັດ');
        qc.invalidateQueries({ queryKey: ['workTypes'] });
        setFormOpen(false);
      } else {
        toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
      }
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workTypesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workTypes'] });
      toast.success('ລົບສຳເລັດ');
    },
    onError: () => toast.error('ລົບບໍ່ສຳເລັດ'),
  });

  const openForm = (wt?: WorkType) => {
    setEditing(wt ?? null);
    if (wt) {
      form.setFieldsValue({ name: wt.name, description: wt.description });
    } else {
      form.resetFields();
    }
    setFormOpen(true);
  };

  const columns = [
    { title: 'ຊື່ປະເພດວຽກ', dataIndex: 'name' },
    { title: 'ລາຍລະອຽດ', dataIndex: 'description', ellipsis: true },
    {
      title: '', width: 80,
      render: (_: unknown, row: WorkType) => (
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
        title="ປະເພດວຽກ (Work Types)"
        primaryAction={<Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>ເພີ່ມປະເພດ</Button>}
      />

      <Card>
        {isLoading ? <SkeletonTable rows={4} cols={3} /> : (
          <ResponsiveTable columns={columns} dataSource={workTypes} rowKey="id" pagination={{ pageSize: 20 }} scroll={{ x: 'max-content' }} />
        )}
      </Card>

      <Modal
        title={editing ? 'ແກ້ໄຂປະເພດວຽກ' : 'ເພີ່ມປະເພດວຽກ'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="name" label="ຊື່ປະເພດວຽກ" rules={[{ required: true, message: 'ກະລຸນາໃສ່ຊື່ປະເພດ' }]}>
            <Input placeholder="ຕົວຢ່າງ: ສ້ອມແປງ" />
          </Form.Item>
          <Form.Item name="description" label="ລາຍລະອຽດ">
            <Input.TextArea rows={3} placeholder="ອະທິບາຍສັ້ນໆ ກ່ຽວກັບປະເພດວຽກນີ້" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
