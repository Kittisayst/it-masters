import { useAllTasks } from '@/hooks/useGoogleSheetsFallback'
import { Row, Col, Button } from 'antd'
import { Wrench, ClipboardList, CheckCircle, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'
import type { RepairTask, WorkTask } from '@/types/task'
import StatsCard from '@/components/StatsCard'
import RecentItemsCard from '@/components/RecentItemsCard'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'

export default function Dashboard() {
  // ✅ FIXED: Performance monitoring
  usePerformanceMonitor('Dashboard')
  
  // ✅ FIXED: Use SWR hooks for automatic data fetching and deduplication
  const { repairTasks, workTasks, isLoading, mutateAll } = useAllTasks()

  // ✅ FIXED: Memoize stats to prevent unnecessary re-renders
  const stats = useMemo(() => [
    {
      name: 'ວຽກສ້ອມແປງທັງໝົດ',
      value: repairTasks.length,
      icon: Wrench,
      color: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      name: 'ວຽກສ້ອມແປງສຳເລັດ',
      value: repairTasks.filter((t: RepairTask) => t.status === 'completed').length,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      name: 'ວຽກງານທັງໝົດ',
      value: workTasks.length,
      icon: ClipboardList,
      color: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
    },
    {
      name: 'ວຽກງານສຳເລັດ',
      value: workTasks.filter((t: WorkTask) => t.status === 'done').length,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
  ], [repairTasks.length, workTasks.length, repairTasks, workTasks])

  // ✅ FIXED: Memoize recent items to prevent unnecessary re-renders
  const recentRepairs = useMemo(() => repairTasks.slice(-5).reverse() as RepairTask[], [repairTasks])
  const recentTasks = useMemo(() => workTasks.slice(-5).reverse() as WorkTask[], [workTasks])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            ພາບລວມລະບົບຄຸ້ມຄອງວຽກງານໄອທີ
          </p>
        </div>
        <Button 
          type="primary" 
          icon={<RotateCcw />} 
          onClick={mutateAll}
          loading={isLoading}
        >
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.name} className="stagger-item">
            <StatsCard
              name={stat.name}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <RecentItemsCard
            title="ວຽກສ້ອມແປງລ່າສຸດ"
            items={recentRepairs.map(repair => ({
              id: repair.id,
              title: repair.equipment,
              subtitle: repair.issue,
              status: repair.status
            }))}
            emptyIcon={Wrench}
            emptyMessage="ຍັງບໍ່ມີຂໍ້ມູນ"
            headerBg="linear-gradient(90deg, var(--lao-purple) 0%, var(--lao-purple-light) 100%)"
            hoverColor="hover:from-purple-50 hover:to-purple-100"
            getStatusColor={(status) => 
              status === 'completed' ? 'success' :
              status === 'in-progress' ? 'processing' : 'default'
            }
          />
        </Col>

        <Col xs={24} lg={12}>
          <RecentItemsCard
            title="ວຽກງານລ່າສຸດ"
            items={recentTasks.map(task => ({
              id: task.id,
              title: task.title,
              subtitle: `ມອບໝາຍໃຫ້: ${task.assignedTo}`,
              status: task.status
            }))}
            emptyIcon={ClipboardList}
            emptyMessage="ຍັງບໍ່ມີຂໍ້ມູນ"
            headerBg="linear-gradient(90deg, var(--lao-gold) 0%, #D97706 100%)"
            hoverColor="hover:from-yellow-50 hover:to-yellow-100"
            getStatusColor={(status) => 
              status === 'done' ? 'success' :
              status === 'in-progress' ? 'processing' : 'default'
            }
          />
        </Col>
      </Row>
    </div>
  )
}
