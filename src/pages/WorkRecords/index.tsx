import { useState } from 'react';
import { Button, Card, DatePicker, Select, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { workRecordsApi } from '../../services/api';
import { useDepartments, useUsers } from '../../hooks/useReferenceData';
import StatusBadge from '../../components/common/StatusBadge';
import WorkRecordForm from './WorkRecordForm';
import SkeletonTable from '../../components/common/SkeletonTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { exportToExcel } from '../../utils/exportExcel';
import type { WorkRecord } from '../../types';

export default function WorkRecordsPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkRecord | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({ status: 'ຍັງຄ້າງ' });

  const { data: departments = [] } = useDepartments();
  const { data: users = [] } = useUsers();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['workRecords', filters],
    queryFn: async () => {
      const res = Object.keys(filters).length
        ? await workRecordsApi.find(filters)
        : await workRecordsApi.findAll();
      return (res.data as WorkRecord[]) ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workRecordsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workRecords'] }); toast.success('ລົບສຳເລັດ'); },
    onError: () => toast.error('ລົບບໍ່ສຳເລັດ'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => workRecordsApi.update(id, { status: 'ສຳເລັດ' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workRecords'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('ປ່ຽນສະຖານະສຳເລັດ'); },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.fullName]));

  const columns = [
    { title: 'ວັນທີ', dataIndex: 'date', width: 110, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'ຜູ້ປະຕິບັດ', dataIndex: 'staffId', render: (v: string) => userMap[v] ?? v },
    { title: 'ຫ້ອງການ', dataIndex: 'departmentId', render: (v: string) => deptMap[v] ?? v },
    { title: 'ສະຖານທີ', dataIndex: 'location' },
    { title: 'ປະເພດ', dataIndex: 'workType' },
    { title: 'ລາຍລະອຽດ', dataIndex: 'description', ellipsis: true },
    { title: 'ສະຖານະ', dataIndex: 'status', render: (v: string) => <StatusBadge status={v} /> },
    {
      title: '', width: 110,
      render: (_: unknown, row: WorkRecord) => (
        <Space>
          {row.status === 'ຍັງຄ້າງ' && (
            <Popconfirm title="ຢືນຢັນວ່າວຽກສຳເລັດ?" onConfirm={() => completeMutation.mutate(row.id)} okText="ສຳເລັດ" cancelText="ຍົກເລີກ">
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={completeMutation.isPending && completeMutation.variables === row.id}
              />
            </Popconfirm>
          )}
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(row); setFormOpen(true); }} />
          <Popconfirm title="ຢືນຢັນລົບ?" onConfirm={() => deleteMutation.mutate(row.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleExport = () => {
    const rows = records.map((r) => ({
      ວັນທີ: r.date,
      ຜູ້ປະຕິບັດ: userMap[r.staffId] ?? r.staffId,
      ຫ້ອງການ: deptMap[r.departmentId] ?? r.departmentId,
      ສະຖານທີ: r.location,
      ປະເພດ: r.workType,
      ລາຍລະອຽດ: r.description,
      ສະຖານະ: r.status,
    }));
    exportToExcel(rows, 'ໜ້າວຽກປະຈຳວັນ');
  };

  return (
    <div>
      <PageHeader
        title="ໜ້າວຽກປະຈຳວັນ"
        secondaryActions={<Button icon={<DownloadOutlined />} onClick={handleExport}>Export Excel</Button>}
        primaryAction={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            ເພີ່ມໜ້າວຽກ
          </Button>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <DatePicker
                style={{ width: '100%' }}
                placeholder="ວັນທີເລີ່ມ"
                format="DD/MM/YYYY"
                onChange={(v) => setFilters((f) => { const n = { ...f }; if (v) n.dateFrom = v.format('YYYY-MM-DD'); else delete n.dateFrom; return n; })}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <DatePicker
                style={{ width: '100%' }}
                placeholder="ວັນທີສິ້ນສຸດ"
                format="DD/MM/YYYY"
                onChange={(v) => setFilters((f) => { const n = { ...f }; if (v) n.dateTo = v.format('YYYY-MM-DD'); else delete n.dateTo; return n; })}
              />
            </div>
          </div>
          <Select
            placeholder="ຫ້ອງການ/ພະແນກ"
            allowClear
            style={{ width: '100%' }}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            onChange={(v) => setFilters((f) => { const n = { ...f }; if (v) n.departmentId = v; else delete n.departmentId; return n; })}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Select
                placeholder="ຜູ້ປະຕິບັດ"
                allowClear
                style={{ width: '100%' }}
                options={users.map((u) => ({ value: u.id, label: u.fullName }))}
                onChange={(v) => setFilters((f) => { const n = { ...f }; if (v) n.staffId = v; else delete n.staffId; return n; })}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Select
                placeholder="ສະຖານະ"
                allowClear
                defaultValue="ຍັງຄ້າງ"
                style={{ width: '100%' }}
                options={[{ value: 'ສຳເລັດ', label: 'ສຳເລັດ' }, { value: 'ຍັງຄ້າງ', label: 'ຍັງຄ້າງ' }]}
                onChange={(v) => setFilters((f) => { const n = { ...f }; if (v) n.status = v; else delete n.status; return n; })}
              />
            </div>
          </div>
        </div>
      </Card>

      
      

      <Card>
        {isLoading ? <SkeletonTable rows={6} cols={6} /> : <ResponsiveTable columns={columns} dataSource={records} rowKey="id" scroll={{ x: 'max-content' }} mobilePrimaryFields={['date', 'workType', 'description', 'status']} />}
      </Card>

      <WorkRecordForm
        open={formOpen}
        record={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); qc.invalidateQueries({ queryKey: ['workRecords'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); }}
      />
    </div>
  );
}
