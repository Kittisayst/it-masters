import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Descriptions, Popconfirm, Spin, Table, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { borrowingApi, equipmentApi } from '../../services/api';
import { useEmployees } from '../../hooks/useReferenceData';
import type { BorrowingDetail, BorrowingItem, Equipment } from '../../types';

const { Title, Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
  ປົກກະຕິ: 'success',
  ສ້ອມແປງ: 'warning',
  ປົດລຶບ: 'error',
  ຖືກຢືມ: 'processing',
  ຖືກເບີກ: 'default',
};

const SLIP_STATUS_COLOR: Record<string, string> = {
  'ກຳລັງຢືມ': 'processing',
  'ຄືນແລ້ວ': 'success',
  'ເກີນກຳນົດ': 'error',
};

export default function BorrowingReturnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [returningId, setReturningId] = useState<string | null>(null);

  const { data: detail, isLoading } = useQuery({
    queryKey: ['borrowing', 'return', id],
    queryFn: async () => {
      const res = await borrowingApi.findById(id!);
      return res.data as BorrowingDetail;
    },
    enabled: !!id,
  });

  const { data: allEquipment = [] } = useQuery({
    queryKey: ['equipment', 'all'],
    queryFn: async () => (await equipmentApi.findAll()).data as Equipment[] ?? [],
  });

  const { data: employees = [] } = useEmployees();

  const returnAllMutation = useMutation({
    mutationFn: () => borrowingApi.return(id!),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ['borrowing'] });
        qc.invalidateQueries({ queryKey: ['equipment'] });
        toast.success('ຄືນອຸປະກອນທັງໝົດສຳເລັດ');
        navigate(-1);
      } else {
        toast.error(res.error ?? 'ເກີດຂໍ້ຜິດພາດ');
      }
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const returnItemMutation = useMutation({
    mutationFn: (equipmentId: string) =>
      equipmentApi.update(equipmentId, { status: 'ປົກກະຕິ' }),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ['equipment', 'all'] });
        qc.invalidateQueries({ queryKey: ['equipment'] });
        toast.success('ຄືນລາຍການສຳເລັດ');
      } else {
        toast.error(res.error ?? 'ເກີດຂໍ້ຜິດພາດ');
      }
      setReturningId(null);
    },
    onError: () => { toast.error('ເກີດຂໍ້ຜິດພາດ'); setReturningId(null); },
  });

  if (isLoading || !detail) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const { header, items } = detail;
  const borrower = employees.find(e => e.id === header.borrowerId);
  const equipMap = Object.fromEntries(allEquipment.map(e => [e.id, e]));
  const isDone = header.status === 'ຄືນແລ້ວ';

  const columns = [
    { title: '#', render: (_: unknown, __: unknown, i: number) => i + 1, width: 40 },
    {
      title: 'ລະຫັດ',
      render: (_: unknown, row: BorrowingItem) => equipMap[row.equipmentId]?.code ?? '-',
      width: 90,
    },
    {
      title: 'ຊື່ອຸປະກອນ',
      render: (_: unknown, row: BorrowingItem) => equipMap[row.equipmentId]?.name ?? '-',
    },
    {
      title: 'ສະຖານະ',
      width: 110,
      render: (_: unknown, row: BorrowingItem) => {
        const status = equipMap[row.equipmentId]?.status;
        return status ? <Tag color={STATUS_COLOR[status] ?? 'default'}>{status}</Tag> : '-';
      },
    },
    {
      title: 'ຄືນ',
      width: 80,
      render: (_: unknown, row: BorrowingItem) => {
        const equip = equipMap[row.equipmentId];
        const alreadyReturned = equip?.status === 'ປົກກະຕິ';
        return (
          <Button
            size="small"
            type="primary"
            icon={<CheckOutlined />}
            disabled={alreadyReturned || isDone}
            loading={returningId === row.equipmentId}
            onClick={() => {
              setReturningId(row.equipmentId);
              returnItemMutation.mutate(row.equipmentId);
            }}
          >
            ຄືນ
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 48px', fontFamily: "'Noto Sans Lao', sans-serif" }}>
      {/* toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>ກັບຄືນ</Button>
      </div>

      {/* header */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>ຄືນອຸປະກອນ</Title>
        <Text type="secondary">ເລກທີ: {header.borrowCode}</Text>
      </div>

      {/* borrowing info card */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small" styles={{ label: { color: '#8c8c8c', width: 110 } }}>
          <Descriptions.Item label="ຜູ້ຢືມ">{borrower?.fullName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="ສະຖານະ">
            <Tag color={SLIP_STATUS_COLOR[header.status] ?? 'default'}>{header.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="ວັນທີຢືມ">{dayjs(header.borrowDate).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="ກຳນົດຄືນ">
            {header.dueDate ? dayjs(header.dueDate).format('DD/MM/YYYY') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* items table */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* return all action */}
      {isDone ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#52c41a', fontWeight: 500 }}>
          ✓ ຄືນອຸປະກອນທັງໝົດແລ້ວ
        </div>
      ) : (
        <Popconfirm
          title="ຢືນຢັນຄືນທັງໝົດ?"
          description="ລະບົບຈະບັນທຶກການຄືນ ແລະ ປ່ຽນສະຖານະໃບຢືມ"
          onConfirm={() => returnAllMutation.mutate()}
          okText="ຢືນຢັນ"
          cancelText="ຍົກເລີກ"
        >
          <Button
            type="primary"
            size="large"
            block
            loading={returnAllMutation.isPending}
          >
            ສົ່ງຄືນທັງໝົດ
          </Button>
        </Popconfirm>
      )}
    </div>
  );
}
