import { Card, Col, Row, Statistic, Typography, Button, Empty, theme } from 'antd';
import {
  FileTextOutlined,
  LaptopOutlined,
  InboxOutlined,
  WarningOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { dashboardApi } from '../services/api';
import SkeletonStatCard from '../components/common/SkeletonStatCard';
import SkeletonTable from '../components/common/SkeletonTable';
import ResponsiveTable from '../components/common/ResponsiveTable';
import StatusBadge from '../components/common/StatusBadge';
import { useUsers } from '../hooks/useReferenceData';
import type { DashboardStats, WorkRecord } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await dashboardApi.stats();
      return res.data as DashboardStats;
    },
  });

  const { data: recentWork, isLoading: workLoading } = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: async () => {
      const res = await dashboardApi.recentWorkRecords(8);
      return (res.data as WorkRecord[]) ?? [];
    },
  });

  const { data: users = [] } = useUsers();
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.fullName]));

  const statCards = [
    {
      key: 'work',
      title: 'ວຽກມື້ນີ້',
      value: stats?.workToday ?? 0,
      prefix: <FileTextOutlined />,
      color: token.colorPrimary,
      onClick: () => navigate('/work-records'),
    },
    {
      key: 'equip',
      title: 'ອຸປະກອນທັງໝົດ',
      value: stats?.equipment.total ?? 0,
      prefix: <LaptopOutlined />,
      color: token.colorInfo,
      suffix: <small style={{ fontSize: 13, color: token.colorTextSecondary }}>/ ພ້ອມ {stats?.equipment.available ?? 0}</small>,
      onClick: () => navigate('/equipment'),
    },
    {
      key: 'borrow',
      title: 'ກຳລັງຢືມ',
      value: stats?.borrowing.active ?? 0,
      prefix: <InboxOutlined />,
      color: token.colorWarning,
      onClick: () => navigate('/borrowing'),
    },
    {
      key: 'overdue',
      title: 'ເກີນກຳນົດຄືນ',
      value: stats?.borrowing.overdue ?? 0,
      prefix: <WarningOutlined />,
      color: stats?.borrowing.overdue ? token.colorError : token.colorTextTertiary,
      onClick: () => navigate('/borrowing'),
    },
  ];

  const workColumns = [
    { title: 'ວັນທີ', dataIndex: 'date', width: 110, render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    { title: 'ຜູ້ປະຕິບັດ', dataIndex: 'staffIds', render: (v: string) => (v || '').split(',').map((id) => userMap[id] ?? id).join(', ') },
    { title: 'ປະເພດ', dataIndex: 'workType', width: 120 },
    { title: 'ລາຍລະອຽດ', dataIndex: 'description', ellipsis: true },
    { title: 'ສະຖານະ', dataIndex: 'status', width: 140, render: (v: string) => <StatusBadge status={v} /> },
  ];

  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 20 }}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        {statCards.map((s, i) => (
          <Col key={s.key} xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={s.onClick}
              style={{ cursor: 'pointer' }}
            >
              {statsLoading ? <SkeletonStatCard /> : (
                <div className="content-enter" style={{ animationDelay: `${i * 60}ms` }}>
                  <Statistic
                    title={s.title}
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    styles={{ content: { color: s.color } }}
                  />
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title="ໜ້າວຽກລ່າສຸດ"
        style={{ marginTop: 16 }}
        extra={
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/work-records')}
          >
            ເບິ່ງທັງໝົດ
          </Button>
        }
      >
        {workLoading ? <SkeletonTable rows={5} cols={4} /> : (
          <div className="content-enter">
            <ResponsiveTable
              columns={workColumns}
              dataSource={recentWork}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: <Empty description="ຍັງບໍ່ມີໜ້າວຽກ" /> }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
