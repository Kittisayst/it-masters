import { useState } from 'react';
import { Button, Card, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { equipmentApi } from '../../services/api';
import { useEquipmentList, useNetworkPorts, summarizeNetworkPorts } from '../../hooks/useReferenceData';
import StatusBadge from '../../components/common/StatusBadge';
import EquipmentForm from '../Equipment/EquipmentForm';
import SkeletonTable from '../../components/common/SkeletonTable';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import type { Equipment } from '../../types';

export default function NetworkPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);

  const { data: equipment = [], isLoading } = useEquipmentList();
  const { data: networkPorts = [] } = useNetworkPorts();

  const devices = equipment.filter((e) => e.type === 'Network');

  const portSummaryByEquipmentId = summarizeNetworkPorts(networkPorts);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => equipmentApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment'] });
      qc.invalidateQueries({ queryKey: ['networkPorts'] });
      toast.success('ລົບສຳເລັດ');
    },
    onError: () => toast.error('ລົບບໍ່ສຳເລັດ'),
  });

  const columns = [
    { title: 'ລະຫັດ', dataIndex: 'code', width: 100 },
    { title: 'ຊື່ອຸປະກອນ', dataIndex: 'name' },
    {
      title: 'Port', dataIndex: 'id', width: 90,
      render: (id: string) => {
        const s = portSummaryByEquipmentId[id];
        return s ? `${s.used}/${s.total}` : '0/0';
      },
    },
    { title: 'ສະຖານທີ', dataIndex: 'location' },
    { title: 'ສະຖານະ', dataIndex: 'status', render: (v: string) => <StatusBadge status={v} /> },
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

  return (
    <div>
      <PageHeader
        title="ເຄືອຂ່າຍ"
        primaryAction={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            ເພີ່ມອຸປະກອນ
          </Button>
        }
      />

      <Card>
        {isLoading
          ? <SkeletonTable rows={4} cols={5} />
          : <ResponsiveTable columns={columns} dataSource={devices} rowKey="id" scroll={{ x: 'max-content' }} mobilePrimaryFields={['code', 'name', 'status']} />
        }
      </Card>

      <EquipmentForm
        open={formOpen}
        equipment={editing}
        defaultType="Network"
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          qc.invalidateQueries({ queryKey: ['equipment'] });
          qc.invalidateQueries({ queryKey: ['networkPorts'] });
        }}
      />
    </div>
  );
}
