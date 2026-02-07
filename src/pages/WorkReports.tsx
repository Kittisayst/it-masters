import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Progress, 
  Table,
  Space,
  Tag,
  message 
} from 'antd'
import { 
  BarChartOutlined, 
  PrinterOutlined, 
  FileExcelOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useStore } from '@/store/useStore'
import { exportWorkTasksToExcel } from '@/utils/exportUtils'
import { PrintableWorkReport } from '@/components/PrintableWorkReport'

export default function WorkReports() {
  const { workTasks } = useStore()
  const printRef = useRef<HTMLDivElement>(null)

  const totalTasks = workTasks.length
  const completedTasks = workTasks.filter((t) => t.status === 'done').length
  const inProgressTasks = workTasks.filter((t) => t.status === 'in-progress').length
  const todoTasks = workTasks.filter((t) => t.status === 'todo').length

  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0'

  const overdueTasks = workTasks.filter((task) => {
    if (task.status === 'done') return false
    const dueDate = new Date(task.dueDate)
    return dueDate < new Date()
  })

  const assigneeStats = workTasks.reduce((acc, task) => {
    if (!acc[task.assignedTo]) {
      acc[task.assignedTo] = { total: 0, completed: 0, inProgress: 0, todo: 0 }
    }
    acc[task.assignedTo].total++
    if (task.status === 'done') acc[task.assignedTo].completed++
    if (task.status === 'in-progress') acc[task.assignedTo].inProgress++
    if (task.status === 'todo') acc[task.assignedTo].todo++
    return acc
  }, {} as Record<string, { total: number; completed: number; inProgress: number; todo: number }>)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `ລາຍງານວຽກງານ_${new Date().toLocaleDateString('lo-LA')}`,
  })

  const handleExportPDF = () => {
    if (workTasks.length === 0) {
      message.error('ບໍ່ມີຂໍ້ມູນສຳລັບ export')
      return
    }
    handlePrint()
  }

  const handleExportExcel = () => {
    if (workTasks.length === 0) {
      message.error('ບໍ່ມີຂໍ້ມູນສຳລັບ export')
      return
    }
    try {
      exportWorkTasksToExcel(workTasks)
      message.success('Export Excel ສຳເລັດ')
    } catch (error) {
      message.error('Export Excel ບໍ່ສຳເລັດ')
    }
  }

  const assigneeColumns = [
    {
      title: 'ຜູ້ຮັບຜິດຊອບ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'ທັງໝົດ',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'ສຳເລັດ',
      dataIndex: 'completed',
      key: 'completed',
    },
    {
      title: 'ກຳລັງເຮັດ',
      dataIndex: 'inProgress',
      key: 'inProgress',
    },
    {
      title: 'ຕ້ອງເຮັດ',
      dataIndex: 'todo',
      key: 'todo',
    },
    {
      title: 'ອັດຕາສຳເລັດ',
      key: 'rate',
      render: (_: any, record: any) => (
        `${((record.completed / record.total) * 100).toFixed(1)}%`
      ),
    },
  ]

  const assigneeData = Object.entries(assigneeStats).map(([name, stats]) => ({
    key: name,
    name,
    ...stats,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <BarChartOutlined className="text-2xl text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ລາຍງານວຽກງານ</h1>
            <p className="text-sm text-gray-500">ສະຖິຕິແລະລາຍງານວຽກງານ</p>
          </div>
        </div>
        <Space>
          <Button
            icon={<PrinterOutlined />}
            onClick={handleExportPDF}
          >
            Print PDF
          </Button>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ທັງໝົດ"
              value={totalTasks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ສຳເລັດ"
              value={completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ກຳລັງເຮັດ"
              value={inProgressTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ອັດຕາສຳເລັດ"
              value={completionRate}
              suffix="%"
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Status Progress & Overdue Tasks */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="ສະຖານະວຽກງານ">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div className="flex justify-between mb-2">
                  <span>ສຳເລັດ</span>
                  <span className="font-medium">{completedTasks}</span>
                </div>
                <Progress 
                  percent={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
                  strokeColor="#10b981"
                  showInfo={false}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>ກຳລັງເຮັດ</span>
                  <span className="font-medium">{inProgressTasks}</span>
                </div>
                <Progress 
                  percent={totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}
                  strokeColor="#f59e0b"
                  showInfo={false}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>ຕ້ອງເຮັດ</span>
                  <span className="font-medium">{todoTasks}</span>
                </div>
                <Progress 
                  percent={totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}
                  strokeColor="#6b7280"
                  showInfo={false}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="ວຽກເກີນກຳນົດ">
            {overdueTasks.length === 0 ? (
              <p className="text-gray-500">ບໍ່ມີວຽກເກີນກຳນົດ</p>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {overdueTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        ກຳນົດສົ່ງ: {task.dueDate}
                      </p>
                    </div>
                    <Tag color="red">ເກີນກຳນົດ</Tag>
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>
      </Row>

      {/* Assignee Statistics */}
      <Card title="ສະຖິຕິຜູ້ຮັບຜິດຊອບ">
        {Object.keys(assigneeStats).length === 0 ? (
          <p className="text-gray-500">ຍັງບໍ່ມີຂໍ້ມູນ</p>
        ) : (
          <Table
            columns={assigneeColumns}
            dataSource={assigneeData}
            pagination={false}
          />
        )}
      </Card>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        <PrintableWorkReport ref={printRef} tasks={workTasks} />
      </div>
    </div>
  )
}
