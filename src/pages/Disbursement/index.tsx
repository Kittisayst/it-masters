import { useState } from 'react';
import { Button, Card, Modal, Space, Table, Typography, Popconfirm } from 'antd';
import { PlusOutlined, PrinterOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { disbursementApi, equipmentApi } from '../../services/api';
import { useEmployees, useUsers } from '../../hooks/useReferenceData';
import DisbursementForm from './DisbursementForm';
import DisbursementSlip from './DisbursementSlip';
import { exportToExcel } from '../../utils/exportExcel';
import type { DisbursementDetail, DisbursementHeader, Equipment } from '../../types';

const { Title } = Typography;

export default function DisbursementPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [slipDetail, setSlipDetail] = useState<DisbursementDetail | null>(null);

  const { data: employees = [] } = useEmployees();
  const { data: users = [] } = useUsers();
  const { data: allEquipment = [] } = useQuery({
    queryKey: ['equipment', 'all-disb'],
    queryFn: async () => (await equipmentApi.findAll()).data as Equipment[] ?? [],
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['disbursement'],
    queryFn: async () => (await disbursementApi.findAll()).data ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => disbursementApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['disbursement'] }); qc.invalidateQueries({ queryKey: ['equipment'] }); toast.success('ລົບສຳເລັດ'); },
    onError: () => toast.error('ລົບບໍ່ສຳເລັດ'),
  });

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullName]));

  const openSlip = async (id: string) => {
    const res = await disbursementApi.findById(id);
    if (res.success) setSlipDetail(res.data as DisbursementDetail);
  };

  const columns = [
    { title: 'ລະຫັດ', dataIndex: 'disbursementCode', width: 90 },
    { title: 'ຜູ້ຮັບ', dataIndex: 'recipientId', render: (v: string) => empMap[v] ?? v },
    { title: 'ວັນທີເບີກ', dataIndex: 'disbursementDate', width: 120, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'ໝາຍເຫດ', dataIndex: 'note', ellipsis: true },
    {
      title: '', width: 100,
      render: (_: unknown, row: DisbursementHeader) => (
        <Space>
          <Button size="small" icon={<PrinterOutlined />} onClick={() => openSlip(row.id)} />
          <Popconfirm title="ຢືນຢັນລົບ?" onConfirm={() => deleteMutation.mutate(row.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleExport = () => {
    const rows = records.map((r) => ({
      ລະຫັດ: r.disbursementCode,
      ຜູ້ຮັບ: empMap[r.recipientId] ?? r.recipientId,
      ວັນທີເບີກ: r.disbursementDate,
      ໝາຍເຫດ: r.note,
    }));
    exportToExcel(rows, 'ການເບີກຈ່າຍອຸປະກອນ');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>ເບີກຈ່າຍອຸປະກອນ</Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export Excel</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>ບັນທຶກການເບີກ</Button>
        </Space>
      </div>

      <Card>
        <Table columns={columns} dataSource={records} rowKey="id" loading={isLoading} />
      </Card>

      <DisbursementForm open={formOpen} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); qc.invalidateQueries({ queryKey: ['disbursement'] }); qc.invalidateQueries({ queryKey: ['equipment'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); }} />

      <Modal open={!!slipDetail} onCancel={() => setSlipDetail(null)} footer={null} width={700} title="ໃບເບີກຈ່າຍ">
        {slipDetail && <DisbursementSlip detail={slipDetail} employees={employees} users={users} equipment={allEquipment} />}
      </Modal>
    </div>
  );
}
