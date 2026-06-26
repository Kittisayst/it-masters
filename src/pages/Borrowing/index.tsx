import { useState } from 'react';
import { Button, Card, Select, Space, Popconfirm } from 'antd';
import { PlusOutlined, PrinterOutlined, CheckOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import dayjs from 'dayjs';
import { borrowingApi } from '../../services/api';
import { useEmployees } from '../../hooks/useReferenceData';
import StatusBadge from '../../components/common/StatusBadge';
import BorrowingForm from './BorrowingForm';
import SkeletonTable from '../../components/common/SkeletonTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { exportToExcel } from '../../utils/exportExcel';
import type { BorrowingHeader } from '../../types';

export default function BorrowingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: employees = [] } = useEmployees();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['borrowing', statusFilter],
    queryFn: async () => {
      const res = statusFilter
        ? await borrowingApi.find({ status: statusFilter })
        : await borrowingApi.findAll();
      return (res.data as BorrowingHeader[]) ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => borrowingApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['borrowing'] }); qc.invalidateQueries({ queryKey: ['equipment'] }); toast.success('ລົບສຳເລັດ'); },
    onError: () => toast.error('ລົບບໍ່ສຳເລັດ'),
  });

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullName]));

  const openPrint = (id: string) => {
    window.open(`${import.meta.env.BASE_URL}borrowing/${id}/print`, '_blank');
  };

  const columns = [
    { title: 'ລະຫັດ', dataIndex: 'borrowCode', width: 90 },
    { title: 'ຜູ້ຢືມ', dataIndex: 'borrowerId', render: (v: string) => empMap[v] ?? v },
    { title: 'ວັນທີຢືມ', dataIndex: 'borrowDate', width: 110, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'ກຳນົດຄືນ', dataIndex: 'dueDate', width: 110, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '-' },
    { title: 'ຄືນຈິງ', dataIndex: 'returnDate', width: 110, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '-' },
    { title: 'ສະຖານະ', dataIndex: 'status', render: (v: string) => <StatusBadge status={v} /> },
    {
      title: '', width: 130,
      render: (_: unknown, row: BorrowingHeader) => (
        <Space>
          <Button size="small" icon={<PrinterOutlined />} onClick={() => openPrint(row.id)} />
          {row.status === 'ກຳລັງຢືມ' || row.status === 'ເກີນກຳນົດ' ? (
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => navigate(`/borrowing/return/${row.id}`)}>ຄືນ</Button>
          ) : null}
          <Popconfirm title="ຢືນຢັນລົບ?" onConfirm={() => deleteMutation.mutate(row.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleExport = () => {
    const rows = records.map((r) => ({
      ລະຫັດ: r.borrowCode,
      ຜູ້ຢືມ: empMap[r.borrowerId] ?? r.borrowerId,
      ວັນທີຢືມ: r.borrowDate,
      ກຳນົດຄືນ: r.dueDate,
      ຄືນຈິງ: r.returnDate ?? '',
      ສະຖານະ: r.status,
    }));
    exportToExcel(rows, 'ການຢືມອຸປະກອນ');
  };

  return (
    <div>
      <PageHeader
        title="ຢືມອຸປະກອນ"
        secondaryActions={<Button icon={<DownloadOutlined />} onClick={handleExport}>Export Excel</Button>}
        primaryAction={<Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>ບັນທຶກການຢືມ</Button>}
      />

      <Card style={{ marginBottom: 16 }}>
        <Select
          placeholder="ສະຖານະ"
          allowClear
          style={{ width: 180 }}
          options={['ກຳລັງຢືມ', 'ຄືນແລ້ວ', 'ເກີນກຳນົດ'].map((s) => ({ value: s, label: s }))}
          onChange={setStatusFilter}
        />
      </Card>

      <Card>
        {isLoading
          ? <SkeletonTable rows={6} cols={5} />
          : <ResponsiveTable columns={columns} dataSource={records} rowKey="id" scroll={{ x: 'max-content' }} mobilePrimaryFields={['borrowCode', 'borrowDate', 'status']} />
        }
      </Card>

      <BorrowingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          qc.invalidateQueries({ queryKey: ['borrowing'] });
          qc.invalidateQueries({ queryKey: ['equipment'] });
          qc.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </div>
  );
}
