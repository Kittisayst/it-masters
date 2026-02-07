import { Card, Tag, Typography, Space } from 'antd'
import type { LucideIcon } from 'lucide-react'

const { Text } = Typography

interface RecentItemsCardProps {
  title: string
  items: Array<{
    id: string
    title: string
    subtitle: string
    status: string
  }>
  emptyIcon: LucideIcon
  emptyMessage: string
  headerBg: string
  hoverColor: string
  getStatusColor: (status: string) => string
}

export default function RecentItemsCard({
  title,
  items,
  emptyIcon: EmptyIcon,
  emptyMessage,
  headerBg,
  hoverColor,
  getStatusColor
}: RecentItemsCardProps) {
  return (
    <Card 
      title={title} 
      className="shadow-lao hover:shadow-lg transition-all duration-300"
      headStyle={{ background: headerBg, color: 'white', border: 'none' }}
    >
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <EmptyIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <Text>{emptyMessage}</Text>
        </div>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 bg-linear-to-r from-gray-50 to-gray-100 rounded-lg ${hoverColor} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex-1">
                <Text strong className="text-gray-800">{item.title}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {item.subtitle}
                </Text>
              </div>
              <Tag
                color={getStatusColor(item.status)}
                className="font-medium"
              >
                {item.status}
              </Tag>
            </div>
          ))}
        </Space>
      )}
    </Card>
  )
}
