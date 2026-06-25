import { Button, Descriptions, Table, Typography } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { DisbursementDetail, Employee, User, Equipment } from '../../types';

const { Title, Text } = Typography;

interface Props {
  detail: DisbursementDetail;
  employees: Employee[];
  users: User[];
  equipment: Equipment[];
}

export default function DisbursementSlip({ detail, employees, users, equipment }: Props) {
  const { header, items } = detail;
  const recipient = employees.find((e) => e.id === header.recipientId);
  const approver = users.find((u) => u.id === header.approvedBy);
  const equipMap = Object.fromEntries(equipment.map((e) => [e.id, e]));

  const columns = [
    { title: '#', render: (_: unknown, __: unknown, i: number) => i + 1, width: 40 },
    { title: 'ລະຫັດ', render: (_: unknown, row: { equipmentId: string }) => equipMap[row.equipmentId]?.code },
    { title: 'ຊື່ອຸປະກອນ', render: (_: unknown, row: { equipmentId: string }) => equipMap[row.equipmentId]?.name },
    { title: 'ໝາຍເຫດ', dataIndex: 'note' },
  ];

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 16 }} className="no-print">
        <Button icon={<PrinterOutlined />} onClick={() => window.print()}>ພິມໃບເບີກ</Button>
      </div>

      <div id="disbursement-slip">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>ໃບເບີກຈ່າຍອຸປະກອນ IT</Title>
          <Text type="secondary">ລະຫັດ: {header.disbursementCode}</Text>
        </div>

        <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="ຜູ້ຮັບ">{recipient?.fullName}</Descriptions.Item>
          <Descriptions.Item label="ຕຳແໜ່ງ">{recipient?.position}</Descriptions.Item>
          <Descriptions.Item label="ວັນທີເບີກ" span={2}>{dayjs(header.disbursementDate).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="ຜູ້ອະນຸມັດ" span={2}>{approver?.fullName}</Descriptions.Item>
          {header.note && <Descriptions.Item label="ໝາຍເຫດ" span={2}>{header.note}</Descriptions.Item>}
        </Descriptions>

        <Table columns={columns} dataSource={items} rowKey="id" pagination={false} size="small" />

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 48 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', width: 160, marginBottom: 4 }} />
            <Text>ຜູ້ຮັບ</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', width: 160, marginBottom: 4 }} />
            <Text>ຜູ້ອະນຸມັດ</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
