import { Card, Statistic, Space } from 'antd'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  name: string
  value: number
  icon: LucideIcon
  color: string
  className?: string
}

export default function StatsCard({ 
  name, 
  value, 
  icon: Icon, 
  color, 
  className = "" 
}: StatsCardProps) {
  return (
    <Card className={`card-float card-hover hover:shadow-lg transition-all duration-300 border-0 shadow-lao ${className}`}>
      <Space direction="horizontal" size="middle">
        <div className={`shrink-0 bg-linear-to-br ${color} rounded-xl p-4 shadow-md`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <Statistic
            title={name}
            value={value}
            valueStyle={{ fontSize: '32px', fontWeight: 700, color: 'var(--lao-purple)' }}
            className="font-bold"
          />
        </div>
      </Space>
    </Card>
  )
}
