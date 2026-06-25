import { useState } from 'react';
import { Button, Card, Select, Space, Table, Typography, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { equipmentApi } from '../../services/api';
import { useUsers } from '../../hooks/useReferenceData';
import StatusBadge from '../../components/common/StatusBadge';
import EquipmentForm from './EquipmentForm';
import { exportToExcel } from '../../utils/exportExcel';
import type { Equipment } from '../../types';

const { Title } = Typography;

const TYPES = ['ຄອມ', 'Printer', 'Projector', 'Network', 'ອື່ນໆ'];
const STATUSES = ['ປົກກະຕິ', 'ສ້ອມແປງ', 'ປົດລຶບ', 'ຖືກຢືມ', 'ຖືກເບີກ'];

export default function EquipmentPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: users = [] } = useUsers();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['equipment', filters],
    queryFn: async () => {
      const res = Object.keys(filters).length
        ? await equipmentApi.find(filters)
        : await equipmentApi.findAll();
      return (res.data as Equipment[]) ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => equipmentApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipment'] }); toast.success('ລົບສຳເລັດ'); },
    onError: () => toast.error('ລົບບໍ່ສຳເລັດ'),
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.fullName]));

  const columns = [
    { title: 'ລະຫັດ', dataIndex: 'code', width: 90 },
    { title: 'ຊື່ອຸປະກອນ', dataIndex: 'name' },
    { title: 'ປະເພດ', dataIndex: 'type', width: 100 },
    { title: 'Serial', dataIndex: 'serialNumber', width: 130 },
    { title: 'ສະຖານທີ', dataIndex: 'location' },
    { title: 'ສະຖານະ', dataIndex: 'status', render: (v: string) => <StatusBadge status={v} /> },
    { title: 'ລາຄາ (ກີບ)', dataIndex: 'price', width: 120, render: (v: number) => v?.toLocaleString() },
    { title: 'ວັນທີໄດ້ຮັບ', dataIndex: 'receivedDate', width: 110, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
    { title: 'ຜູ້ບັນທຶກ', dataIndex: 'recordedBy', width: 120, render: (v: string) => userMap[v] ?? v },
    {
      title: '', width: 80,
      render: (_: unknown, row: Equipment) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(row); setFormOpen(true); }} />
          <Popconfirm title="ຢືນຢັນລົບ?" onConfirm={() => deleteMutation.mutate(row.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleExport = () => {
    const rows = items.map((e) => ({
      ລະຫັດ: e.code,
      ຊື່ອຸປະກອນ: e.name,
      ປະເພດ: e.type,
      'Serial Number': e.serialNumber,
      ສະຖານທີ: e.location,
      ສະຖານະ: e.status,
      'ທຶນຈັດຊື້': e.fundSource,
      'ລາຄາ (ກີບ)': e.price,
      ວັນທີໄດ້ຮັບ: e.receivedDate,
      ຜູ້ບັນທຶກ: userMap[e.recordedBy] ?? e.recordedBy,
    }));
    exportToExcel(rows, 'ອຸປະກອນ IT');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>ອຸປະກອນ IT</Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export Excel</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            ເພີ່ມອຸປະກອນ
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="ປະເພດ"
            allowClear
            style={{ width: 160 }}
            options={TYPES.map((t) => ({ value: t, label: t }))}
            onChange={(v) => setFilters((f) => v ? { ...f, type: v } : (({ type: _, ...rest }) => rest)(f))}
          />
          <Select
            placeholder="ສະຖານະ"
            allowClear
            style={{ width: 160 }}
            options={STATUSES.map((s) => ({ value: s, label: s }))}
            onChange={(v) => setFilters((f) => v ? { ...f, status: v } : (({ status: _, ...rest }) => rest)(f))}
          />
        </Space>
      </Card>

      <Card>
        <Table columns={columns} dataSource={items} rowKey="id" loading={isLoading} scroll={{ x: 900 }} />
      </Card>

      <EquipmentForm
        open={formOpen}
        equipment={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); qc.invalidateQueries({ queryKey: ['equipment'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); }}
      />
    </div>
  );
}
