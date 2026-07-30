import { useState } from 'react';
import { Button, Card, Select, Space, Popconfirm } from 'antd';
import { PlusOutlined, CheckOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { roomBorrowingApi } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import RoomBorrowingForm from './RoomBorrowingForm';
import SkeletonTable from '../../components/common/SkeletonTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { exportToExcel } from '../../utils/exportExcel';
import type { RoomBorrowing } from '../../types';

export default function RoomBorrowingPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['roomBorrowing', statusFilter],
    queryFn: async () => {
      const res = statusFilter
        ? await roomBorrowingApi.find({ status: statusFilter })
        : await roomBorrowingApi.findAll();
      return (res.data as RoomBorrowing[]) ?? [];
    },
  });

  const returnMutation = useMutation({
    mutationFn: (id: string) => roomBorrowingApi.return(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roomBorrowing'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('ບັນທຶກການສົ່ງຄືນສຳເລັດ');
    },
    onError: () => toast.error('ບໍ່ສຳເລັດ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomBorrowingApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roomBorrowing'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('ລົບສຳເລັດ');
    },
    onError: () => toast.error('ລົບບໍ່ສຳເລັດ'),
  });

  const columns = [
    { title: 'ຜູ້ຢືມ', dataIndex: 'employee', render: (v: RoomBorrowing['employee']) => v?.fullName ?? '-' },
    { title: 'ຫ້ອງ', dataIndex: 'room', render: (v: RoomBorrowing['room']) => v ? `${v.code} - ${v.name}` : '-' },
    { title: 'ວັນ-ເວລາຢືມ', dataIndex: 'borrowedAt', width: 150, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-' },
    { title: 'ກຳນົດສົ່ງ', dataIndex: 'dueDate', width: 110, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '-' },
    { title: 'ວັນ-ເວລາສົ່ງ', dataIndex: 'returnedAt', width: 150, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-' },
    { title: 'ຈຸດປະສົງ', dataIndex: 'purpose' },
    { title: 'ສະຖານະ', dataIndex: 'status', render: (v: string) => <StatusBadge status={v} /> },
    {
      title: '', width: 130,
      render: (_: unknown, row: RoomBorrowing) => (
        <Space>
          {row.status === 'ກຳລັງຢືມ' || row.status === 'ເກີນກຳນົດ' ? (
            <Popconfirm title="ຢືນຢັນການສົ່ງຄືນ?" onConfirm={() => returnMutation.mutate(row.id)}>
              <Button size="small" type="primary" icon={<CheckOutlined />}>ສົ່ງຄືນ</Button>
            </Popconfirm>
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
      ຜູ້ຢືມ: r.employee?.fullName ?? '',
      ຫ້ອງ: r.room ? `${r.room.code} - ${r.room.name}` : '',
      ວັນເວລາຢືມ: r.borrowedAt,
      ກຳນົດສົ່ງ: r.dueDate ?? '',
      ວັນເວລາສົ່ງ: r.returnedAt ?? '',
      ຈຸດປະສົງ: r.purpose ?? '',
      ສະຖານະ: r.status,
    }));
    exportToExcel(rows, 'ຢືມກະແຈຫ້ອງຄອມ');
  };

  return (
    <div>
      <PageHeader
        title="ຢືມກະແຈຫ້ອງຄອມ"
        secondaryActions={<Button icon={<DownloadOutlined />} onClick={handleExport}>Export Excel</Button>}
        primaryAction={<Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>ບັນທຶກການຢືມ</Button>}
      />

      <Card style={{ marginBottom: 16 }}>
        <Select
          placeholder="ສະຖານະ"
          allowClear
          style={{ width: 180 }}
          options={['ກຳລັງຢືມ', 'ສົ່ງແລ້ວ', 'ເກີນກຳນົດ'].map((s) => ({ value: s, label: s }))}
          onChange={setStatusFilter}
        />
      </Card>

      <Card>
        {isLoading
          ? <SkeletonTable rows={6} cols={6} />
          : <ResponsiveTable columns={columns} dataSource={records} rowKey="id" scroll={{ x: 'max-content' }} mobilePrimaryFields={['employee', 'borrowedAt', 'status']} />
        }
      </Card>

      <RoomBorrowingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          qc.invalidateQueries({ queryKey: ['roomBorrowing'] });
          qc.invalidateQueries({ queryKey: ['rooms'] });
        }}
      />
    </div>
  );
}
