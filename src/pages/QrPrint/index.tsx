import { forwardRef, useRef, useState } from 'react';
import { Button, Card, Checkbox, Radio, Space, Table, Tag } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { equipmentApi } from '../../services/api';
import type { Equipment } from '../../types';

const PER_ROW_OPTIONS = [
  { label: '2 / row', value: 2 },
  { label: '3 / row', value: 3 },
  { label: '4 / row', value: 4 },
];

// ── Print template ────────────────────────────────────────────────────────────
const PrintView = forwardRef<HTMLDivElement, { items: Equipment[]; perRow: number }>(
  ({ items, perRow }, ref) => {
    const qrSize = perRow === 2 ? 130 : perRow === 3 ? 90 : 65;
    const fontSize = perRow === 2 ? 10 : 8;

    return (
      <div ref={ref} style={{ padding: '10mm', fontFamily: "'Noto Sans Lao', sans-serif" }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${perRow}, 1fr)`,
            gap: '4mm',
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px dashed #999',
                borderRadius: 4,
                padding: '3mm',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2mm',
                pageBreakInside: 'avoid',
              }}
            >
              <QRCodeSVG value={item.id} size={qrSize} />
              <div style={{ width: '100%', fontSize }}>
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </div>
                <div style={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  S/N: {item.serialNumber || '-'}
                </div>
                <div style={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.type || '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
PrintView.displayName = 'PrintView';

// ── Page ──────────────────────────────────────────────────────────────────────
export default function QrPrintPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [perRow, setPerRow] = useState(3);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const res = await equipmentApi.findAll();
      return (res.data ?? []) as Equipment[];
    },
  });

  const selectedItems = equipment.filter((e) => selectedIds.includes(e.id));

  const toggleAll = (checked: boolean) =>
    setSelectedIds(checked ? equipment.map((e) => e.id) : []);

  const toggle = (id: string, checked: boolean) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedIds.length === equipment.length && equipment.length > 0}
          indeterminate={selectedIds.length > 0 && selectedIds.length < equipment.length}
          onChange={(e) => toggleAll(e.target.checked)}
        />
      ),
      width: 48,
      render: (_: unknown, row: Equipment) => (
        <Checkbox
          checked={selectedIds.includes(row.id)}
          onChange={(e) => toggle(row.id, e.target.checked)}
        />
      ),
    },
    { title: 'ລະຫັດ', dataIndex: 'code', width: 100 },
    { title: 'ຊື່ອຸປະກອນ', dataIndex: 'name' },
    { title: 'ປະເພດ', dataIndex: 'type', width: 130 },
    { title: 'Serial Number', dataIndex: 'serialNumber', width: 160 },
    {
      title: 'ສະຖານະ',
      dataIndex: 'status',
      width: 110,
      render: (v: string) => {
        const color: Record<string, string> = {
          ປົກກະຕິ: 'success', ສ້ອມແປງ: 'warning', ປົດລຶບ: 'error',
          ຖືກຢືມ: 'processing', ຖືກເບີກ: 'default',
        };
        return <Tag color={color[v] ?? 'default'}>{v}</Tag>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Print QR Code"
        primaryAction={
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            disabled={selectedIds.length === 0}
            onClick={() => handlePrint()}
          >
            Print ({selectedIds.length})
          </Button>
        }
      />

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <span>QR ຕໍ່ Row:</span>
          <Radio.Group
            options={PER_ROW_OPTIONS}
            optionType="button"
            value={perRow}
            onChange={(e) => setPerRow(e.target.value)}
          />
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns as never}
          dataSource={equipment}
          rowKey="id"
          loading={isLoading}
          size="small"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <div style={{ display: 'none' }}>
        <PrintView ref={printRef} items={selectedItems} perRow={perRow} />
      </div>
    </div>
  );
}
