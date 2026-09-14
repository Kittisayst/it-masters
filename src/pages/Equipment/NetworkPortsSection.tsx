import { useState } from 'react';
import { Button, Input, InputNumber, Select, Space, Table } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { networkPortsApi } from '../../services/api';
import { useNetworkPortsForEquipment } from '../../hooks/useReferenceData';
import type { NetworkPort } from '../../types';

const STATUS_OPTIONS = ['ໃຊ້ງານ', 'ບໍ່ໃຊ້ງານ', 'ວ່າງ'];

export default function NetworkPortsSection({ equipmentId }: { equipmentId: string }) {
  const qc = useQueryClient();
  const [targetCount, setTargetCount] = useState<number | null>(null);

  const { data: ports = [], isLoading } = useNetworkPortsForEquipment(equipmentId);

  const generateMutation = useMutation({
    mutationFn: (count: number) => networkPortsApi.generate({ equipmentId, count }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('ອັບເດດຈຳນວນ port ສຳເລັດ');
        qc.invalidateQueries({ queryKey: ['networkPorts'] });
        qc.invalidateQueries({ queryKey: ['equipment'] });
      } else {
        toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
      }
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => networkPortsApi.update(id, data),
    onSuccess: (res) => {
      if (res.success) qc.invalidateQueries({ queryKey: ['networkPorts'] });
      else toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const columns = [
    { title: 'Port', dataIndex: 'portNumber', width: 60 },
    {
      title: 'ຕໍ່ໄປໃສ', dataIndex: 'connectsTo',
      render: (v: string, row: NetworkPort) => (
        <Input
          defaultValue={v}
          placeholder="ຕົວຢ່າງ: ຫ້ອງ A101"
          onBlur={(e) => {
            if (e.target.value !== (v ?? '')) updateMutation.mutate({ id: row.id, data: { connectsTo: e.target.value } });
          }}
        />
      ),
    },
    {
      title: 'ສະຖານະ', dataIndex: 'status', width: 130,
      render: (v: string, row: NetworkPort) => (
        <Select
          value={v}
          style={{ width: '100%' }}
          options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
          onChange={(newVal) => updateMutation.mutate({ id: row.id, data: { status: newVal } })}
        />
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 8, fontWeight: 500 }}>ຈັດການ Port</div>
      <Space style={{ marginBottom: 12 }}>
        <InputNumber
          min={1}
          placeholder="ຈຳນວນ port ທັງໝົດ"
          value={targetCount ?? ports.length}
          onChange={(v) => setTargetCount(v)}
        />
        <Button onClick={() => generateMutation.mutate(targetCount ?? ports.length)} loading={generateMutation.isPending}>
          ອັບເດດຈຳນວນ
        </Button>
      </Space>
      <Table
        size="small"
        rowKey="id"
        columns={columns as never}
        dataSource={ports}
        loading={isLoading}
        pagination={false}
        scroll={{ y: 300 }}
      />
    </div>
  );
}
