import { useState } from 'react';
import { Button, Card, Collapse, Descriptions, Popconfirm, Space, Spin, Tag, Typography } from 'antd';
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
import { useNetworkPortsForEquipment } from '../../hooks/useReferenceData';
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

// ── Network port list (view-only, tap a port to see its connection) ────────────
const PORT_STATUS_COLOR: Record<string, string> = {
  ໃຊ້ງານ: 'processing',
  ບໍ່ໃຊ້ງານ: 'default',
  ວ່າງ: 'success',
};

function NetworkPortPanel({ equipment, onReset }: { equipment: Equipment; onReset: () => void }) {
  const { data: ports = [], isLoading } = useNetworkPortsForEquipment(equipment.id);
  const usedCount = ports.filter((p) => p.status === 'ໃຊ້ງານ').length;

  const items = ports.map((p) => ({
    key: p.id,
    label: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Port {p.portNumber}</span>
        <Tag color={PORT_STATUS_COLOR[p.status] ?? 'default'} style={{ marginRight: 0 }}>{p.status}</Tag>
      </div>
    ),
    children: <Text>{p.connectsTo || 'ບໍ່ມີຂໍ້ມູນຕໍ່ໄປໃສ'}</Text>,
  }));

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0 }}>{equipment.name}</Title>
          <Tag color="blue">{equipment.type}</Tag>
        </div>
        <Descriptions column={1} size="small" styles={{ label: { color: '#8c8c8c', width: 120 } }}>
          <Descriptions.Item label="ລະຫັດ">{equipment.code}</Descriptions.Item>
          <Descriptions.Item label="ສະຖານທີ">{equipment.location || '-'}</Descriptions.Item>
          <Descriptions.Item label="ຈຳນວນ Port">{usedCount} / {ports.length} ໃຊ້ງານ</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small" title="ລາຍການ Port" style={{ marginBottom: 16 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
        ) : ports.length === 0 ? (
          <Text type="secondary">ຍັງບໍ່ໄດ້ສ້າງ port</Text>
        ) : (
          <Collapse items={items} size="small" />
        )}
      </Card>

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
      const res = await equipmentApi.findById(raw);
      if (res.success && res.data) {
        setState({ phase: 'found', equipment: res.data as Equipment });
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
          state.equipment.type === 'Network'
            ? <NetworkPortPanel equipment={state.equipment} onReset={reset} />
            : <ActionPanel equipment={state.equipment} onReset={reset} />
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
