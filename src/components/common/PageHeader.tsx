import { Typography } from 'antd';
import type React from 'react';

const { Title } = Typography;

interface Props {
  title: string;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}

export default function PageHeader({ title, primaryAction, secondaryActions }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8 }}>
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
        {secondaryActions && <span className="ph-secondary">{secondaryActions}</span>}
        {primaryAction}
      </div>
    </div>
  );
}
