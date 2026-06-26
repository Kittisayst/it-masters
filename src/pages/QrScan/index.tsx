import { useState } from 'react';
import { Button, Card, Descriptions, Popconfirm, Space, Spin, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ScanOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import PageHeader from '../../components/common/PageHeader';
import { equipmentApi } from '../../services/api';
import type { Equipment } from '../../types';

const { Title, Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
  ປົກກະຕິ: 'success',
  ສ້ອມແປງ: 'warning',
  ປົດລຶບ: 'error',
  ຖືກຢືມ: 'processing',
  ຖືກເບີກ: 'default',
};

// ── Scanner component ─────────────────────────────────────────────────────────
function QrCamera({ onScan }: { onScan: (id: string) => void }) {
  return (
    <div style={{ maxWidth: 360, margin: '0 auto' }}>
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid #5c6bc0' }}>
        <Scanner
          onScan={(results) => {
            if (results[0]?.rawValue) onScan(results[0].rawValue.trim());
          }}
          onError={() => {}}
          styles={{ container: { height: 300 } }}
        />
      </div>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 13 }}>
        ສ່ອງກ້ອງໄປທີ່ QR code ຂອງອຸປະກອນ
      </Text>
    </div>
  );
}

// ── Action panel ──────────────────────────────────────────────────────────────
function ActionPanel({
  equipment,
  onReset,
}: {
  equipment: Equipment;
  onReset: () => void;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: (status: string) => equipmentApi.update(equipment.id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('ອັບເດດສຳເລັດ');
      onReset();
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const actions: React.ReactNode[] = [];
  const { status } = equipment;

  if (status === 'ປົກກະຕິ') {
    actions.push(
      <Button key="borrow" type="primary" onClick={() => navigate('/borrowing')}>
        ຢືມອຸປະກອນ
      </Button>,
      <Button key="disbursement" onClick={() => navigate('/disbursement')}>
        ເບີກຈ່າຍ
      </Button>,
      <Popconfirm
        key="repair"
        title="ສົ່ງສ້ອມແປງ?"
        onConfirm={() => updateStatus.mutate('ສ້ອມແປງ')}
      >
        <Button icon={<ToolOutlined />} danger loading={updateStatus.isPending}>
          ສ້ອມແປງ
        </Button>
      </Popconfirm>
    );
  }

  if (status === 'ຖືກຢືມ') {
    actions.push(
      <Button key="return" type="primary" onClick={() => navigate('/borrowing')}>
        ຄືນອຸປະກອນ
      </Button>
    );
  }

  if (status === 'ສ້ອມແປງ') {
    actions.push(
      <Popconfirm
        key="done"
        title="ສ້ອມສຳເລັດແລ້ວ?"
        onConfirm={() => updateStatus.mutate('ປົກກະຕິ')}
      >
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={updateStatus.isPending}
        >
          ສ້ອມສຳເລັດ
        </Button>
      </Popconfirm>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0 }}>{equipment.name}</Title>
          <Tag color={STATUS_COLOR[status] ?? 'default'}>{status}</Tag>
        </div>
        <Descriptions column={1} size="small" styles={{ label: { color: '#8c8c8c', width: 120 } }}>
          <Descriptions.Item label="ລະຫັດ">{equipment.code}</Descriptions.Item>
          <Descriptions.Item label="ປະເພດ">{equipment.type}</Descriptions.Item>
          <Descriptions.Item label="Serial Number">{equipment.serialNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="ສະຖານທີ">{equipment.location || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {actions.length > 0 && (
        <Card size="small" title="Actions" style={{ marginBottom: 16 }}>
          <Space wrap>{actions}</Space>
        </Card>
      )}

      <Button icon={<ScanOutlined />} block onClick={onReset}>
        ສະແກໃໝ່
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
type ScanState =
  | { phase: 'scanning' }
  | { phase: 'loading' }
  | { phase: 'found'; equipment: Equipment }
  | { phase: 'notfound'; id: string };

export default function QrScanPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ScanState>({ phase: 'scanning' });

  const handleScan = async (raw: string) => {
    if (raw.startsWith('borrow:')) {
      navigate(`/borrowing/return/${raw.slice('borrow:'.length)}`);
      return;
    }
    setState({ phase: 'loading' });
    try {
      const res = await equipmentApi.find({ id: raw });
      const list = (res.data ?? []) as Equipment[];
      if (list.length > 0) {
        setState({ phase: 'found', equipment: list[0] });
      } else {
        setState({ phase: 'notfound', id: raw });
      }
    } catch {
      setState({ phase: 'notfound', id: raw });
    }
  };

  const reset = () => setState({ phase: 'scanning' });

  return (
    <div>
      <PageHeader title="Scan QR Code" />

      <div style={{ padding: '8px 0' }}>
        {state.phase === 'scanning' && <QrCamera onScan={handleScan} />}

        {state.phase === 'loading' && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#8c8c8c' }}>ກຳລັງຄົ້ນຫາ...</div>
          </div>
        )}

        {state.phase === 'found' && (
          <ActionPanel equipment={state.equipment} onReset={reset} />
        )}

        {state.phase === 'notfound' && (
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <Card>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>❓</div>
                <Text type="secondary">ບໍ່ພົບອຸປະກອນ</Text>
                <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>ID: {state.id}</div>
              </div>
            </Card>
            <Button icon={<ScanOutlined />} block style={{ marginTop: 12 }} onClick={reset}>
              ສະແກໃໝ່
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
