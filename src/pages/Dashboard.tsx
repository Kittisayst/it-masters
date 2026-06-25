import { Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd';
import {
  FileTextOutlined,
  LaptopOutlined,
  InboxOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import type { DashboardStats, WorkRecord } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await dashboardApi.stats();
      return res.data as DashboardStats;
    },
  });

  const { data: recentWork } = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: async () => {
      const res = await dashboardApi.recentWorkRecords(8);
      return (res.data as WorkRecord[]) ?? [];
    },
  });

  const workColumns = [
    { title: 'ວັນທີ', dataIndex: 'date', width: 110, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'ປະເພດ', dataIndex: 'workType', width: 120 },
    { title: 'ລາຍລະອຽດ', dataIndex: 'description', ellipsis: true },
    {
      title: 'ສະຖານະ', dataIndex: 'status', width: 100,
      render: (v: string) => <Tag color={v === 'ສຳເລັດ' ? 'success' : 'warning'}>{v}</Tag>
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ວຽກມື້ນີ້"
              value={stats?.workToday ?? 0}
              prefix={<FileTextOutlined />}
              styles={{ content: { color: '#5c6bc0' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ອຸປະກອນທັງໝົດ"
              value={stats?.equipment.total ?? 0}
              prefix={<LaptopOutlined />}
              suffix={<small style={{ fontSize: 13, color: '#8c8c8c' }}>/ ພ້ອມ {stats?.equipment.available ?? 0}</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ກຳລັງຢືມ"
              value={stats?.borrowing.active ?? 0}
              prefix={<InboxOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ເກີນກຳນົດຄືນ"
              value={stats?.borrowing.overdue ?? 0}
              prefix={<WarningOutlined />}
              styles={{ content: { color: stats?.borrowing.overdue ? '#ff4d4f' : undefined } }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="ໜ້າວຽກລ່າສຸດ" style={{ marginTop: 16 }}>
        <Table
          columns={workColumns}
          dataSource={recentWork}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </Card>
    </div>
  );
}
