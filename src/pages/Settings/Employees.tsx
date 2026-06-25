import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeesApi } from '../../services/api';
import { useDepartments } from '../../hooks/useReferenceData';
import SkeletonTable from '../../components/common/SkeletonTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import type { Employee } from '../../types';

export default function EmployeesSettings() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  const { data: departments = [] } = useDepartments();

  const { data = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await employeesApi.findAll()).data as Employee[] ?? [],
  });

  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      editing ? employeesApi.update(editing.id, values) : employeesApi.insert(values),
    onSuccess: (res) => {
      if (res.success) { toast.success('ບັນທຶກສຳເລັດ'); qc.invalidateQueries({ queryKey: ['employees'] }); setFormOpen(false); }
      else toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); toast.success('ລົບສຳເລັດ'); },
  });

  const openForm = (emp?: Employee) => {
    setEditing(emp ?? null);
    if (emp) form.setFieldsValue(emp); else form.resetFields();
    setFormOpen(true);
  };

  const columns = [
    { title: 'ຊື່ເຕັມ', dataIndex: 'fullName' },
    { title: 'ຕຳແໜ່ງ', dataIndex: 'position' },
    { title: 'ຫ້ອງການ', dataIndex: 'departmentId', render: (v: string) => deptMap[v] ?? v },
    { title: 'ເບີໂທ', dataIndex: 'phone', width: 130 },
    {
      title: '', width: 80,
      render: (_: unknown, row: Employee) => (
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
        title="ພະນັກງານ (ຜູ້ຢືມ/ຮັບ)"
        primaryAction={<Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>ເພີ່ມ</Button>}
      />
      <Card>
        {isLoading ? <SkeletonTable rows={4} cols={4} /> : <ResponsiveTable columns={columns} dataSource={data} rowKey="id" scroll={{ x: 'max-content' }} mobilePrimaryFields={['fullName', 'position', 'departmentId']} />}
      </Card>
      <Modal
        title={editing ? 'ແກ້ໄຂ' : 'ເພີ່ມພະນັກງານ'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="fullName" label="ຊື່ເຕັມ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="ຕຳແໜ່ງ">
            <Input />
          </Form.Item>
          <Form.Item name="departmentId" label="ຫ້ອງການ/ພະແນກ">
            <Select options={departments.map((d) => ({ value: d.id, label: d.name }))} />
          </Form.Item>
          <Form.Item name="phone" label="ເບີໂທ">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
