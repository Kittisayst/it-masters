import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Spin, Table, Typography } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { disbursementApi, equipmentApi } from '../../services/api';
import { useEmployees, useUsers } from '../../hooks/useReferenceData';
import type { DisbursementDetail, DisbursementItem, Equipment } from '../../types';
import type React from 'react';

const { Title, Text } = Typography;

const labelStyle: React.CSSProperties = {
  background: '#fafafa',
  border: '1px solid #d9d9d9',
  padding: '6px 10px',
  fontWeight: 500,
  fontSize: 13,
  width: '25%',
};

const valueStyle: React.CSSProperties = {
  border: '1px solid #d9d9d9',
  padding: '6px 10px',
  fontSize: 13,
  width: '25%',
};

export default function DisbursementPrintPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: detail, isLoading } = useQuery({
    queryKey: ['disbursement', 'print', id],
    queryFn: async () => {
      const res = await disbursementApi.findById(id!);
      return res.data as DisbursementDetail;
    },
    enabled: !!id,
  });

  const { data: employees = [] } = useEmployees();
  const { data: users = [] } = useUsers();
  const { data: allEquipment = [] } = useQuery({
    queryKey: ['equipment', 'all'],
    queryFn: async () => (await equipmentApi.findAll()).data as Equipment[] ?? [],
  });

  const isReady = !!detail && employees.length > 0;

  useEffect(() => {
    if (!isReady) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [isReady]);

  if (isLoading || !detail) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const { header, items } = detail;
  const recipient = employees.find(e => e.id === header.recipientId);
  const approver = users.find(u => u.id === header.approvedBy);
  const equipMap = Object.fromEntries(allEquipment.map(e => [e.id, e]));

  const columns = [
    { title: '#', render: (_: unknown, __: unknown, i: number) => i + 1, width: 36 },
    { title: 'ລະຫັດ', render: (_: unknown, row: DisbursementItem) => equipMap[row.equipmentId]?.code ?? '-', width: 90 },
    { title: 'ຊື່ອຸປະກອນ', render: (_: unknown, row: DisbursementItem) => equipMap[row.equipmentId]?.name ?? '-' },
    { title: 'ປະເພດ', render: (_: unknown, row: DisbursementItem) => equipMap[row.equipmentId]?.type ?? '-', width: 110 },
    { title: 'ໝາຍເຫດ', dataIndex: 'note' },
  ];

  return (
    <>
      <style>{`
        @page { margin: 0; }
        @media print { body { padding: 10mm 12mm; } }
      `}</style>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 48px', fontFamily: "'Noto Sans Lao', sans-serif" }}>

        {/* toolbar */}
        <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>ກັບຄືນ</Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>ພິມໃບເບີກ</Button>
        </div>

        {/* college header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 13 }}>ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ</Text>
          <br />
          <Text style={{ fontSize: 13 }}>ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ</Text>
          <br />
          <Text style={{ fontSize: 13 }}>ວິທະຍາໄລ ເຕັກນິກ-ວິຊາຊີບ ຫຼວງພະບາງ</Text>
          <Title level={4} style={{ margin: '8px 0 2px' }}>ໃບເບີກຈ່າຍອຸປະກອນ IT</Title>
          <Text type="secondary">ເລກທີ: {header.disbursementCode}</Text>
        </div>

        {/* disbursement info */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <tbody>
            <tr>
              <td style={labelStyle}>ຜູ້ຮັບ</td>
              <td style={valueStyle}>{recipient?.fullName ?? '-'}</td>
              <td style={labelStyle}>ຕຳແໜ່ງ</td>
              <td style={valueStyle}>{recipient?.position ?? '-'}</td>
            </tr>
            <tr>
              <td style={labelStyle}>ວັນທີເບີກ</td>
              <td style={valueStyle} colSpan={3}>{dayjs(header.disbursementDate).format('DD/MM/YYYY')}</td>
            </tr>
            <tr>
              <td style={labelStyle}>ຜູ້ອະນຸມັດ</td>
              <td style={valueStyle} colSpan={3}>{approver?.fullName ?? '-'}</td>
            </tr>
            {header.note && (
              <tr>
                <td style={labelStyle}>ໝາຍເຫດ</td>
                <td style={valueStyle} colSpan={3}>{header.note}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* items */}
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
        />

        {/* signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 64 }}>
          {[
            { label: 'ຜູ້ຮັບ', name: recipient?.fullName },
            { label: 'ຜູ້ອະນຸມັດ', name: approver?.fullName },
          ].map(({ label, name }) => (
            <div key={label} style={{ textAlign: 'center', minWidth: 160 }}>
              <div style={{ height: 56 }} />
              <div style={{ borderTop: '1px solid #000', marginBottom: 4 }} />
              <Text strong>{label}</Text>
              {name && <><br /><Text type="secondary" style={{ fontSize: 12 }}>{name}</Text></>}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, color: '#888', fontSize: 12 }} className="no-print">
          ວັນທີພິມ: {dayjs().format('DD/MM/YYYY HH:mm')}
        </div>
      </div>
    </>
  );
}
