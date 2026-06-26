import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Spin, Table, Typography } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import dayjs from 'dayjs';
import { borrowingApi, equipmentApi } from '../../services/api';
import { useEmployees, useUsers } from '../../hooks/useReferenceData';
import type { BorrowingDetail, Equipment } from '../../types';
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

export default function BorrowingPrintPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: detail, isLoading } = useQuery({
    queryKey: ['borrowing', 'print', id],
    queryFn: async () => {
      const res = await borrowingApi.findById(id!);
      return res.data as BorrowingDetail;
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
  const borrower = employees.find(e => e.id === header.borrowerId);
  const approver = users.find(u => u.id === header.approvedBy);
  const equipMap = Object.fromEntries(allEquipment.map(e => [e.id, e]));

  const columns = [
    { title: '#', render: (_: unknown, __: unknown, i: number) => i + 1, width: 36 },
    { title: 'ລະຫັດ', render: (_: unknown, row: { equipmentId: string }) => equipMap[row.equipmentId]?.code ?? '-', width: 90 },
    { title: 'ຊື່ອຸປະກອນ', render: (_: unknown, row: { equipmentId: string }) => equipMap[row.equipmentId]?.name ?? '-' },
    { title: 'ໝາຍເຫດ', dataIndex: 'note' },
  ];

  return (
    <>
    <style>{`
      @page { margin: 0; }
      @media print { body { padding: 10mm 12mm; } }
    `}</style>
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 48px', fontFamily: "'Noto Sans Lao', sans-serif" }}>
      {/* toolbar — hidden when printing */}
      <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>ກັບຄືນ</Button>
        <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>ພິມໃບຢືມ</Button>
      </div>

      {/* college header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 13 }}>ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ</Text>
        <br />
        <Text style={{ fontSize: 13 }}>ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ</Text>
        <br />
        <Text style={{ fontSize: 13 }}>ວິທະຍາໄລ ເຕັກນິກ-ວິຊາຊີບ ຫຼວງພະບາງ</Text>
        <Title level={4} style={{ margin: '8px 0 2px' }}>ໃບຢືມອຸປະກອນ IT</Title>
        <Text type="secondary">ເລກທີ: {header.borrowCode}</Text>
      </div>

      {/* borrowing info */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <tbody>
          <tr>
            <td style={labelStyle}>ຜູ້ຢືມ</td>
            <td style={valueStyle}>{borrower?.fullName ?? '-'}</td>
            <td style={labelStyle}>ຕຳແໜ່ງ</td>
            <td style={valueStyle}>{borrower?.position ?? '-'}</td>
          </tr>
          <tr>
            <td style={labelStyle}>ວັນທີຢືມ</td>
            <td style={valueStyle}>{dayjs(header.borrowDate).format('DD/MM/YYYY')}</td>
            <td style={labelStyle}>ກຳນົດຄືນ</td>
            <td style={valueStyle}>{header.dueDate ? dayjs(header.dueDate).format('DD/MM/YYYY') : '-'}</td>
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
          { label: 'ຜູ້ຢືມ', name: borrower?.fullName },
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

      {/* QR scan ເພື່ອຄືນ */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <QRCodeSVG value={`borrow:${header.id}`} size={100} />
        <div style={{ fontSize: 11, marginTop: 4, color: '#666' }}>
          ສະແກນ QR ນີ້ເພື່ອຄືນອຸປະກອນ &nbsp;·&nbsp; ເລກທີ: {header.borrowCode}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, color: '#888', fontSize: 12 }} className="no-print">
        ວັນທີພິມ: {dayjs().format('DD/MM/YYYY HH:mm')}
      </div>
    </div>
    </>
  );
}
