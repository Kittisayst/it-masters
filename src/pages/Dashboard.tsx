import { Card, Col, Row, Statistic, Tag, Typography } from 'antd';
import {
  FileTextOutlined,
  LaptopOutlined,
  InboxOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import SkeletonStatCard from '../components/common/SkeletonStatCard';
import SkeletonTable from '../components/common/SkeletonTable';
import ResponsiveTable from '../components/common/ResponsiveTable';
import type { DashboardStats, WorkRecord } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function Dashboard() {
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
            {statsLoading ? <SkeletonStatCard /> : (
              <div key="stat-work" className="content-enter">
                <Statistic
                  title="ວຽກມື້ນີ້"
                  value={stats?.workToday ?? 0}
                  prefix={<FileTextOutlined />}
                  styles={{ content: { color: '#5c6bc0' } }}
                />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            {statsLoading ? <SkeletonStatCard /> : (
              <div key="stat-equip" className="content-enter" style={{ animationDelay: '60ms' }}>
                <Statistic
                  title="ອຸປະກອນທັງໝົດ"
                  value={stats?.equipment.total ?? 0}
                  prefix={<LaptopOutlined />}
                  suffix={<small style={{ fontSize: 13, color: '#8c8c8c' }}>/ ພ້ອມ {stats?.equipment.available ?? 0}</small>}
                />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            {statsLoading ? <SkeletonStatCard /> : (
              <div key="stat-borrow" className="content-enter" style={{ animationDelay: '120ms' }}>
                <Statistic
                  title="ກຳລັງຢືມ"
                  value={stats?.borrowing.active ?? 0}
                  prefix={<InboxOutlined />}
                  styles={{ content: { color: '#1890ff' } }}
                />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            {statsLoading ? <SkeletonStatCard /> : (
              <div key="stat-overdue" className="content-enter" style={{ animationDelay: '180ms' }}>
                <Statistic
                  title="ເກີນກຳນົດຄືນ"
                  value={stats?.borrowing.overdue ?? 0}
                  prefix={<WarningOutlined />}
                  styles={{ content: { color: stats?.borrowing.overdue ? '#ff4d4f' : undefined } }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>


      <Card title="ໜ້າວຽກລ່າສຸດ" style={{ marginTop: 16 }}>
        {workLoading ? <SkeletonTable rows={5} cols={4} /> : (
          <div className="content-enter">
            <ResponsiveTable
              columns={workColumns}
              dataSource={recentWork}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
