import { Button, Card, Space, Popconfirm } from 'antd';
import { PlusOutlined, PrinterOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { disbursementApi } from '../../services/api';
import { useEmployees } from '../../hooks/useReferenceData';
import { useState } from 'react';
import DisbursementForm from './DisbursementForm';
import SkeletonTable from '../../components/common/SkeletonTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { exportToExcel } from '../../utils/exportExcel';
import type { DisbursementHeader } from '../../types';

export default function DisbursementPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);

  const { data: employees = [] } = useEmployees();

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

  const openPrint = (id: string) => {
    window.open(`${import.meta.env.BASE_URL}disbursement/${id}/print`, '_blank');
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
          <Button size="small" icon={<PrinterOutlined />} onClick={() => openPrint(row.id)} />
          <Popconfirm title="ຢືນຢັນລົບ?" onConfirm={() => deleteMutation.mutate(row.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleExport = () => {
    const rows = (records as DisbursementHeader[]).map((r) => ({
      ລະຫັດ: r.disbursementCode,
      ຜູ້ຮັບ: empMap[r.recipientId] ?? r.recipientId,
      ວັນທີເບີກ: r.disbursementDate,
      ໝາຍເຫດ: r.note,
    }));
    exportToExcel(rows, 'ການເບີກຈ່າຍອຸປະກອນ');
  };

  return (
    <div>
      <PageHeader
        title="ເບີກຈ່າຍອຸປະກອນ"
        secondaryActions={<Button icon={<DownloadOutlined />} onClick={handleExport}>Export Excel</Button>}
        primaryAction={<Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>ບັນທຶກການເບີກ</Button>}
      />

      <Card>
        {isLoading
          ? <SkeletonTable rows={6} cols={4} />
          : <ResponsiveTable columns={columns} dataSource={records as DisbursementHeader[]} rowKey="id" scroll={{ x: 'max-content' }} />
        }
      </Card>

      <DisbursementForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          qc.invalidateQueries({ queryKey: ['disbursement'] });
          qc.invalidateQueries({ queryKey: ['equipment'] });
          qc.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </div>
  );
}
