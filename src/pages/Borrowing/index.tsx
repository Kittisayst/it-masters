import { useState } from 'react';
import { Button, Card, Modal, Select, Space, Popconfirm } from 'antd';
import { PlusOutlined, PrinterOutlined, CheckOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { borrowingApi, equipmentApi } from '../../services/api';
import { useEmployees, useUsers } from '../../hooks/useReferenceData';
import StatusBadge from '../../components/common/StatusBadge';
import BorrowingForm from './BorrowingForm';
import BorrowingSlip from './BorrowingSlip';
import SkeletonTable from '../../components/common/SkeletonTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { exportToExcel } from '../../utils/exportExcel';
import type { BorrowingDetail, BorrowingHeader, Equipment } from '../../types';

export default function BorrowingPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [slipDetail, setSlipDetail] = useState<BorrowingDetail | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: employees = [] } = useEmployees();
  const { data: users = [] } = useUsers();
  const { data: allEquipment = [] } = useQuery({
    queryKey: ['equipment', 'all'],
    queryFn: async () => (await equipmentApi.findAll()).data as Equipment[] ?? [],
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['borrowing', statusFilter],
    queryFn: async () => {
      const res = statusFilter
        ? await borrowingApi.find({ status: statusFilter })
        : await borrowingApi.findAll();
      return (res.data as BorrowingHeader[]) ?? [];
    },
  });

  const returnMutation = useMutation({
    mutationFn: (id: string) => borrowingApi.return(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['borrowing'] }); qc.invalidateQueries({ queryKey: ['equipment'] }); toast.success('ບັນທຶກການຄືນສຳເລັດ'); },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => borrowingApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['borrowing'] }); qc.invalidateQueries({ queryKey: ['equipment'] }); toast.success('ລົບສຳເລັດ'); },
    onError: () => toast.error('ລົບບໍ່ສຳເລັດ'),
  });

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullName]));

  const openSlip = async (id: string) => {
    const res = await borrowingApi.findById(id);
    if (res.success) setSlipDetail(res.data as BorrowingDetail);
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
          <Button size="small" icon={<PrinterOutlined />} onClick={() => openSlip(row.id)} />
          {row.status === 'ກຳລັງຢືມ' || row.status === 'ເກີນກຳນົດ' ? (
            <Popconfirm title="ຢືນຢັນການຄືນ?" onConfirm={() => returnMutation.mutate(row.id)}>
              <Button size="small" type="primary" icon={<CheckOutlined />}>ຄືນ</Button>
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
        {isLoading ? <SkeletonTable rows={6} cols={5} /> : <ResponsiveTable columns={columns} dataSource={records} rowKey="id" scroll={{ x: 'max-content' }} mobilePrimaryFields={['borrowCode', 'borrowDate', 'status']} />}
      </Card>

      <BorrowingForm open={formOpen} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); qc.invalidateQueries({ queryKey: ['borrowing'] }); qc.invalidateQueries({ queryKey: ['equipment'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); }} />

      <Modal
        open={!!slipDetail}
        onCancel={() => setSlipDetail(null)}
        footer={null}
        width={700}
        title="ໃບຢືມອຸປະກອນ"
      >
        {slipDetail && (
          <BorrowingSlip
            detail={slipDetail}
            employees={employees}
            users={users}
            equipment={allEquipment}
          />
        )}
      </Modal>
    </div>
  );
}
