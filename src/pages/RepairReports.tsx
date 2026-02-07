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
  message 
} from 'antd'
import { 
  BarChartOutlined, 
  PrinterOutlined, 
  FileExcelOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useStore } from '@/store/useStore'
import { exportRepairsToExcel } from '@/utils/exportUtils'
import { PrintableRepairReport } from '@/components/PrintableRepairReport'

export default function RepairReports() {
  const { repairTasks } = useStore()
  const printRef = useRef<HTMLDivElement>(null)

  const totalRepairs = repairTasks.length
  const completedRepairs = repairTasks.filter((t) => t.status === 'completed').length
  const inProgressRepairs = repairTasks.filter((t) => t.status === 'in-progress').length
  const pendingRepairs = repairTasks.filter((t) => t.status === 'pending').length

  const highPriority = repairTasks.filter((t) => t.priority === 'high').length
  const mediumPriority = repairTasks.filter((t) => t.priority === 'medium').length
  const lowPriority = repairTasks.filter((t) => t.priority === 'low').length

  const completionRate = totalRepairs > 0 ? ((completedRepairs / totalRepairs) * 100).toFixed(1) : '0'

  const technicianStats = repairTasks.reduce((acc, task) => {
    if (!acc[task.technician]) {
      acc[task.technician] = { total: 0, completed: 0 }
    }
    acc[task.technician].total++
    if (task.status === 'completed') {
      acc[task.technician].completed++
    }
    return acc
  }, {} as Record<string, { total: number; completed: number }>)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `ລາຍງານສ້ອມແປງ_${new Date().toLocaleDateString('lo-LA')}`,
  })

  const handleExportPDF = () => {
    if (repairTasks.length === 0) {
      message.error('ບໍ່ມີຂໍ້ມູນສຳລັບ export')
      return
    }
    handlePrint()
  }

  const handleExportExcel = () => {
    if (repairTasks.length === 0) {
      message.error('ບໍ່ມີຂໍ້ມູນສຳລັບ export')
      return
    }
    try {
      exportRepairsToExcel(repairTasks)
      message.success('Export Excel ສຳເລັດ')
    } catch (error) {
      message.error('Export Excel ບໍ່ສຳເລັດ')
    }
  }

  const techColumns = [
    {
      title: 'ຊ່າງເຕັກນິກ',
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
      title: 'ອັດຕາສຳເລັດ',
      key: 'rate',
      render: (_: any, record: any) => (
        `${((record.completed / record.total) * 100).toFixed(1)}%`
      ),
    },
  ]

  const techData = Object.entries(technicianStats).map(([name, stats]) => ({
    key: name,
    name,
    ...stats,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BarChartOutlined className="text-2xl text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ລາຍງານສ້ອມແປງ</h1>
            <p className="text-sm text-gray-500">ສະຖິຕິແລະລາຍງານວຽກສ້ອມແປງ</p>
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
              value={totalRepairs}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ສຳເລັດ"
              value={completedRepairs}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ກຳລັງດຳເນີນການ"
              value={inProgressRepairs}
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

      {/* Status Progress */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="ສະຖານະການສ້ອມແປງ">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div className="flex justify-between mb-2">
                  <span>ສຳເລັດ</span>
                  <span className="font-medium">{completedRepairs}</span>
                </div>
                <Progress 
                  percent={totalRepairs > 0 ? (completedRepairs / totalRepairs) * 100 : 0}
                  strokeColor="#10b981"
                  showInfo={false}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>ກຳລັງດຳເນີນການ</span>
                  <span className="font-medium">{inProgressRepairs}</span>
                </div>
                <Progress 
                  percent={totalRepairs > 0 ? (inProgressRepairs / totalRepairs) * 100 : 0}
                  strokeColor="#f59e0b"
                  showInfo={false}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>ລໍຖ້າ</span>
                  <span className="font-medium">{pendingRepairs}</span>
                </div>
                <Progress 
                  percent={totalRepairs > 0 ? (pendingRepairs / totalRepairs) * 100 : 0}
                  strokeColor="#6b7280"
                  showInfo={false}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="ຄວາມສຳຄັນ">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div className="flex justify-between mb-2">
                  <span>ສູງ</span>
                  <span className="font-medium">{highPriority}</span>
                </div>
                <Progress 
                  percent={totalRepairs > 0 ? (highPriority / totalRepairs) * 100 : 0}
                  strokeColor="#ef4444"
                  showInfo={false}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>ກາງ</span>
                  <span className="font-medium">{mediumPriority}</span>
                </div>
                <Progress 
                  percent={totalRepairs > 0 ? (mediumPriority / totalRepairs) * 100 : 0}
                  strokeColor="#f59e0b"
                  showInfo={false}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>ຕ່ຳ</span>
                  <span className="font-medium">{lowPriority}</span>
                </div>
                <Progress 
                  percent={totalRepairs > 0 ? (lowPriority / totalRepairs) * 100 : 0}
                  strokeColor="#6b7280"
                  showInfo={false}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Technician Statistics */}
      <Card title="ສະຖິຕິຊ່າງເຕັກນິກ">
        {Object.keys(technicianStats).length === 0 ? (
          <p className="text-gray-500">ຍັງບໍ່ມີຂໍ້ມູນ</p>
        ) : (
          <Table
            columns={techColumns}
            dataSource={techData}
            pagination={false}
          />
        )}
      </Card>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        <PrintableRepairReport ref={printRef} tasks={repairTasks} />
      </div>
    </div>
  )
}
