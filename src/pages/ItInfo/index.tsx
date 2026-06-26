import { useState } from 'react';
import { Button, Card, Select, Space, Popconfirm, Tag, Tooltip } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, EyeInvisibleOutlined, CopyOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import PageHeader from '../../components/common/PageHeader';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import SkeletonTable from '../../components/common/SkeletonTable';
import { itInfoApi } from '../../services/api';
import type { ItInfo } from '../../types';
import ItInfoForm from './ItInfoForm';

export const IT_CATEGORIES = [
  { value: 'wifi',    label: 'WiFi',         color: 'blue' },
  { value: 'camera',  label: 'IP Camera',    color: 'purple' },
  { value: 'printer', label: 'IP Printer',   color: 'cyan' },
  { value: 'account', label: 'ລະຫັດລະບົບ',   color: 'orange' },
  { value: 'server',  label: 'Server / NAS', color: 'green' },
  { value: 'other',   label: 'ອື່ນໆ',         color: 'default' },
] as const;

function catColor(cat: string) {
  return IT_CATEGORIES.find(c => c.value === cat)?.color ?? 'default';
}
function catLabel(cat: string) {
  return IT_CATEGORIES.find(c => c.value === cat)?.label ?? cat;
}

function CopyBtn({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <Tooltip title="ສຳເນົາ">
      <Button
        type="text" size="small" icon={<CopyOutlined />}
        onClick={() => { navigator.clipboard.writeText(text); toast.success('ສຳເນົາແລ້ວ'); }}
      />
    </Tooltip>
  );
}

export default function ItInfoPage() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ItInfo | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['itInfo', filters],
    queryFn: async () => {
      const res = Object.keys(filters).length
        ? await itInfoApi.find(filters)
        : await itInfoApi.findAll();
      return (res.data as ItInfo[]) ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itInfoApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['itInfo'] }); toast.success('ລົບສຳເລັດ'); },
    onError: () => toast.error('ລົບບໍ່ສຳເລັດ'),
  });

  const toggleReveal = (id: string) =>
    setRevealedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const columns = [
    {
      title: 'ຊື່',
      dataIndex: 'name',
      render: (v: string, row: ItInfo) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          {row.location && <div style={{ fontSize: 12, color: '#888' }}>{row.location}</div>}
        </div>
      ),
    },
    {
      title: 'ປະເພດ',
      dataIndex: 'category',
      width: 115,
      render: (v: string) => <Tag color={catColor(v)}>{catLabel(v)}</Tag>,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      width: 140,
      render: (v: string) => v
        ? <Space size={2}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</span><CopyBtn text={v} /></Space>
        : <span style={{ color: '#ccc' }}>-</span>,
    },
    {
      title: 'Username / SSID',
      dataIndex: 'username',
      width: 160,
      render: (v: string) => v
        ? <Space size={2}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</span><CopyBtn text={v} /></Space>
        : <span style={{ color: '#ccc' }}>-</span>,
    },
    {
      title: 'ລະຫັດຜ່ານ',
      width: 170,
      render: (_: unknown, row: ItInfo) => {
        if (!row.password) return <span style={{ color: '#ccc' }}>-</span>;
        const revealed = revealedIds.has(row.id);
        return (
          <Space size={2}>
            <span style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: revealed ? 0 : '0.12em' }}>
              {revealed ? row.password : '••••••••'}
            </span>
            <Tooltip title={revealed ? 'ເຊື່ອງ' : 'ສະແດງ'}>
              <Button type="text" size="small"
                icon={revealed ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => toggleReveal(row.id)}
              />
            </Tooltip>
            <CopyBtn text={row.password} />
          </Space>
        );
      },
    },
    {
      title: 'URL',
      dataIndex: 'url',
      width: 160,
      ellipsis: true,
      render: (v: string) => v
        ? <a href={v} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>{v}</a>
        : <span style={{ color: '#ccc' }}>-</span>,
    },
    {
      title: 'ຍີ່ຫໍ້ / ລຸ່ນ',
      width: 120,
      render: (_: unknown, row: ItInfo) => {
        const text = [row.brand, row.model].filter(Boolean).join(' / ');
        return text || <span style={{ color: '#ccc' }}>-</span>;
      },
    },
    {
      title: '',
      width: 72,
      render: (_: unknown, row: ItInfo) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}
            onClick={() => { setEditing(row); setFormOpen(true); }}
          />
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
        title="ຂໍ້ມູນ IT ສຳຄັນ"
        primaryAction={
          <Button type="primary" icon={<PlusOutlined />}
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            ເພີ່ມຂໍ້ມູນ
          </Button>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <div className="filter-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Select
            placeholder="ປະເພດທັງໝົດ"
            allowClear
            style={{ width: 160 }}
            options={IT_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
            onChange={v => setFilters(f => { const n = { ...f }; if (v) n.category = v; else delete n.category; return n; })}
          />
          <Select
            placeholder="ສະຖານະທັງໝົດ"
            allowClear
            style={{ width: 150 }}
            options={[
              { value: 'ໃຊ້ງານ', label: 'ໃຊ້ງານ' },
              { value: 'ບໍ່ໃຊ້ງານ', label: 'ບໍ່ໃຊ້ງານ' },
            ]}
            onChange={v => setFilters(f => { const n = { ...f }; if (v) n.status = v; else delete n.status; return n; })}
          />
        </div>
      </Card>

      <Card>
        {isLoading
          ? <SkeletonTable rows={5} cols={7} />
          : <ResponsiveTable
              columns={columns}
              dataSource={items}
              rowKey="id"
              scroll={{ x: 980 }}
              mobilePrimaryFields={['name', 'category', 'username']}
            />
        }
      </Card>

      <ItInfoForm
        open={formOpen}
        record={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); qc.invalidateQueries({ queryKey: ['itInfo'] }); }}
      />
    </div>
  );
}
