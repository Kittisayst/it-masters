import { useRef, useState } from 'react';
import { Button, Card, Col, DatePicker, Grid, Row, Statistic, Table, Tabs, Tag } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import dayjs, { type Dayjs } from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { workRecordsApi, equipmentApi, borrowingApi } from '../../services/api';
import { exportToExcel } from '../../utils/exportExcel';
import type { WorkRecord, Equipment, BorrowingHeader } from '../../types';

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const SCHOOL_NAME = 'ວິທະຍາໄລ ເຕັກນິກ-ວິຊາຊີບ ຫຼວງພະບາງ';

const PRESETS: { label: string; value: [Dayjs, Dayjs] }[] = [
  { label: 'ເດືອນນີ້', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
  { label: '3 ເດືອນຫຼ້ານີ້', value: [dayjs().subtract(2, 'month').startOf('month'), dayjs().endOf('month')] },
  { label: 'ປີນີ້', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
];

type DateRange = [Dayjs, Dayjs] | null;

function inRange(dateStr: string, range: DateRange) {
  if (!range) return true;
  const d = dayjs(dateStr);
  return (d.isAfter(range[0].subtract(1, 'day')) && d.isBefore(range[1].add(1, 'day')));
}

// ─── Print template ───────────────────────────────────────────────────────────
interface PrintViewProps {
  title: string;
  dateRange: DateRange;
  summaryItems: { label: string; value: number | string }[];
  columns: { title: string; dataIndex?: string; render?: (v: unknown, r: unknown) => React.ReactNode }[];
  data: object[];
}

function PrintView({ title, dateRange, summaryItems, columns, data }: PrintViewProps) {
  const rangeLabel = dateRange
    ? `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`
    : 'ທັງໝົດ';
  return (
    <div style={{ padding: '24px 32px', fontFamily: "'Noto Sans Lao', sans-serif" }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{SCHOOL_NAME}</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>ລາຍງານ: {title}</div>
        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>ຊ່ວງເວລາ: {rangeLabel}</div>
        <div style={{ fontSize: 12, color: '#555' }}>ວັນທີ print: {dayjs().format('DD/MM/YYYY HH:mm')}</div>
      </div>

      <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
        {summaryItems.map((s) => (
          <div key={s.label} style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: '8px 16px', minWidth: 100, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#888' }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'center', width: 40 }}>#</th>
            {columns.map((c) => (
              <th key={String(c.title)} style={{ border: '1px solid #ccc', padding: '6px 8px', textAlign: 'left' }}>{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 1 ? '#fafafa' : undefined }}>
              <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>{i + 1}</td>
              {columns.map((c) => {
                const raw = c.dataIndex ? (row as Record<string, unknown>)[c.dataIndex] : undefined;
                const val = c.render ? c.render(raw, row) : (raw != null ? String(raw) : '-');
                return (
                  <td key={String(c.title)} style={{ border: '1px solid #ccc', padding: '5px 8px' }}>
                    {typeof val === 'string' || typeof val === 'number' ? val : raw != null ? String(raw) : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: '#e6f4ff', fontWeight: 700 }}>
            <td colSpan={columns.length + 1} style={{ border: '1px solid #ccc', padding: '6px 8px' }}>
              ລວມທັງໝົດ: {data.length} ລາຍການ
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const [activeTab, setActiveTab] = useState('work');
  const printRef = useRef<HTMLDivElement>(null);
  const screens = useBreakpoint();
  const isMobile = screens.md === false;

  const handlePrint = useReactToPrint({ contentRef: printRef });

  // ── Data ──────────────────────────────────────────────────────────────
  const { data: allWork = [] } = useQuery({
    queryKey: ['reports', 'work'],
    queryFn: async () => {
      const res = await workRecordsApi.findAll();
      return (res.data ?? []) as WorkRecord[];
    },
  });
  const { data: allEquip = [] } = useQuery({
    queryKey: ['reports', 'equip'],
    queryFn: async () => {
      const res = await equipmentApi.findAll();
      return (res.data ?? []) as Equipment[];
    },
  });
  const { data: allBorrow = [] } = useQuery({
    queryKey: ['reports', 'borrow'],
    queryFn: async () => {
      const res = await borrowingApi.findAll();
      return (res.data ?? []) as BorrowingHeader[];
    },
  });

  // ── Filtered data ─────────────────────────────────────────────────────
  const work = allWork.filter((r) => inRange(r.date, dateRange));
  const borrow = allBorrow.filter((r) => inRange(r.borrowDate, dateRange));
  // Equipment has no date range filter — show all

  // ── Work summaries ────────────────────────────────────────────────────
  const workSummary = [
    { label: 'ທັງໝົດ',        value: work.length },
    { label: 'ສຳເລັດ',        value: work.filter((r) => r.status === 'ສຳເລັດ').length },
    { label: 'ກຳລັງດຳເນີນ', value: work.filter((r) => r.status === 'ກຳລັງດຳເນີນ').length },
    { label: 'ລໍຖ້າ',         value: work.filter((r) => r.status === 'ລໍຖ້າ').length },
    { label: 'ຍັງຄ້າງ',       value: work.filter((r) => r.status === 'ຍັງຄ້າງ').length },
    { label: 'ຍົກເລີກ',       value: work.filter((r) => r.status === 'ຍົກເລີກ').length },
  ];
  const workCols = [
    { title: 'ວັນທີ', dataIndex: 'date', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'ປະເພດ', dataIndex: 'workType' },
    { title: 'ລາຍລະອຽດ', dataIndex: 'description' },
    { title: 'ສະຖານະ', dataIndex: 'status', render: (v: string) => <StatusBadge status={v} /> },
  ];

  // ── Equipment summaries ───────────────────────────────────────────────
  const equipSummary = [
    { label: 'ທັງໝົດ', value: allEquip.length },
    { label: 'ປົກກະຕິ', value: allEquip.filter((r) => r.status === 'ປົກກະຕິ').length },
    { label: 'ສ້ອມແປງ', value: allEquip.filter((r) => r.status === 'ສ້ອມແປງ').length },
    { label: 'ຖືກຢືມ', value: allEquip.filter((r) => r.status === 'ຖືກຢືມ').length },
    { label: 'ປົດລຶບ', value: allEquip.filter((r) => r.status === 'ປົດລຶບ').length },
  ];
  const equipCols = [
    { title: 'ລະຫັດ', dataIndex: 'code' },
    { title: 'ຊື່', dataIndex: 'name' },
    { title: 'ປະເພດ', dataIndex: 'type' },
    { title: 'ສະຖານທີ', dataIndex: 'location' },
    { title: 'ສະຖານະ', dataIndex: 'status', render: (v: string) => {
      const color: Record<string, string> = { ປົກກະຕິ: 'success', ສ້ອມແປງ: 'warning', ປົດລຶບ: 'error', ຖືກຢືມ: 'processing', ຖືກເບີກ: 'default' };
      return <Tag color={color[v] ?? 'default'}>{v}</Tag>;
    }},
  ];

  // ── Borrowing summaries ───────────────────────────────────────────────
  const borrowSummary = [
    { label: 'ທັງໝົດ', value: borrow.length },
    { label: 'ຄືນແລ້ວ', value: borrow.filter((r) => r.status === 'ຄືນແລ້ວ').length },
    { label: 'ກຳລັງຢືມ', value: borrow.filter((r) => r.status === 'ກຳລັງຢືມ').length },
    { label: 'ເກີນກຳນົດ', value: borrow.filter((r) => r.status === 'ເກີນກຳນົດ').length },
  ];
  const borrowCols = [
    { title: 'ລະຫັດ', dataIndex: 'borrowCode' },
    { title: 'ວັນທີຢືມ', dataIndex: 'borrowDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'ກຳນົດຄືນ', dataIndex: 'dueDate', render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'ສະຖານະ', dataIndex: 'status', render: (v: string) => {
      const color: Record<string, string> = { ຄືນແລ້ວ: 'success', ກຳລັງຢືມ: 'processing', ເກີນກຳນົດ: 'error' };
      return <Tag color={color[v] ?? 'default'}>{v}</Tag>;
    }},
  ];

  // ── Current tab config ────────────────────────────────────────────────
  const tabConfig = {
    work:   { title: 'ໜ້າວຽກປະຈຳວັນ', summary: workSummary,  cols: workCols,   data: work,     exportName: 'report-work' },
    equip:  { title: 'ອຸປະກອນ IT',      summary: equipSummary, cols: equipCols,  data: allEquip, exportName: 'report-equipment' },
    borrow: { title: 'ຢືມ / ຄືນ',        summary: borrowSummary, cols: borrowCols, data: borrow,  exportName: 'report-borrowing' },
  };
  const cfg = tabConfig[activeTab as keyof typeof tabConfig];

  const handleExcel = () => {
    exportToExcel(cfg.data as unknown as Record<string, unknown>[], cfg.exportName);
  };

  const summaryRow = (items: { label: string; value: number }[]) => (
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
      {items.map((s) => (
        <Col key={s.label} xs={12} sm={6} md={4}>
          <Card size="small" styles={{ body: { padding: '10px 16px' } }}>
            <Statistic title={s.label} value={s.value} styles={{ content: { fontSize: 22 } }} />
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div>
      <PageHeader
        title="ລາຍງານ"
        secondaryActions={
          <>
            <Button icon={<DownloadOutlined />} onClick={handleExcel}>Excel</Button>
            <Button icon={<PrinterOutlined />} onClick={() => handlePrint()}>Print / PDF</Button>
          </>
        }
      />

      {/* Filter */}
      <Card size="small" style={{ marginBottom: 16 }}>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  size="small"
                  type={dateRange && dateRange[0].isSame(p.value[0], 'day') && dateRange[1].isSame(p.value[1], 'day') ? 'primary' : 'default'}
                  onClick={() => setDateRange(p.value)}
                >
                  {p.label}
                </Button>
              ))}
              {dateRange && (
                <Button size="small" onClick={() => setDateRange(null)}>ລ້າງ</Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <DatePicker
                style={{ flex: 1 }}
                placeholder="ວັນທີເລີ່ມ"
                format="DD/MM/YYYY"
                value={dateRange?.[0] ?? null}
                onChange={(v) => setDateRange(v ? [v, dateRange?.[1] ?? v] : null)}
              />
              <DatePicker
                style={{ flex: 1 }}
                placeholder="ວັນທີສິ້ນສຸດ"
                format="DD/MM/YYYY"
                value={dateRange?.[1] ?? null}
                onChange={(v) => setDateRange(v ? [dateRange?.[0] ?? v, v] : null)}
              />
            </div>
          </div>
        ) : (
          <RangePicker
            presets={PRESETS}
            value={dateRange}
            onChange={(v) => setDateRange(v as DateRange)}
            format="DD/MM/YYYY"
            placeholder={['ວັນທີເລີ່ມ', 'ວັນທີສິ້ນສຸດ']}
            allowClear
          />
        )}
      </Card>

      {/* Screen view */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'work',
              label: 'ໜ້າວຽກ',
              children: (
                <>
                  {summaryRow(workSummary)}
                  <Table columns={workCols as never} dataSource={work} rowKey="id" size="small" pagination={{ pageSize: 20 }} scroll={{ x: 'max-content' }} />
                </>
              ),
            },
            {
              key: 'equip',
              label: 'ອຸປະກອນ',
              children: (
                <>
                  {summaryRow(equipSummary)}
                  <Table columns={equipCols as never} dataSource={allEquip} rowKey="id" size="small" pagination={{ pageSize: 20 }} scroll={{ x: 'max-content' }} />
                </>
              ),
            },
            {
              key: 'borrow',
              label: 'ຢືມ/ຄືນ',
              children: (
                <>
                  {summaryRow(borrowSummary)}
                  <Table columns={borrowCols as never} dataSource={borrow} rowKey="id" size="small" pagination={{ pageSize: 20 }} scroll={{ x: 'max-content' }} />
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* Hidden print view */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <PrintView
            title={cfg.title}
            dateRange={activeTab === 'equip' ? null : dateRange}
            summaryItems={cfg.summary}
            columns={cfg.cols as never}
            data={cfg.data}
          />
        </div>
      </div>
    </div>
  );
}
