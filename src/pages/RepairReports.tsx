import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { BarChart3, TrendingUp, Wrench, Printer, FileSpreadsheet } from 'lucide-react'
import { exportRepairsToExcel } from '@/utils/exportUtils'
import { PrintableRepairReport } from '@/components/PrintableRepairReport'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
      toast.error('ບໍ່ມີຂໍ້ມູນສຳລັບ export')
      return
    }
    handlePrint()
  }

  const handleExportExcel = () => {
    if (repairTasks.length === 0) {
      toast.error('ບໍ່ມີຂໍ້ມູນສຳລັບ export')
      return
    }
    exportRepairsToExcel(repairTasks as any)
    toast.success('Export Excel ສຳເລັດ')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ລາຍງານການສ້ອມແປງໄອທີ</h2>
          <p className="mt-1 text-sm text-gray-500">
            ສະຫຼຸບຂໍ້ມູນການສ້ອມແປງອຸປະກອນໄອທີ
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="destructive">
            <Printer className="w-4 h-4 mr-2" />
            Print/PDF
          </Button>
          <Button onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Hidden printable component */}
      <div className="hidden">
        <PrintableRepairReport ref={printRef} tasks={repairTasks as any} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="shrink-0 bg-blue-500 rounded-md p-3">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    ທັງໝົດ
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalRepairs}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="shrink-0 bg-green-500 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    ສຳເລັດ
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {completedRepairs}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="shrink-0 bg-yellow-500 rounded-md p-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    ກຳລັງດຳເນີນການ
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {inProgressRepairs}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="shrink-0 bg-purple-500 rounded-md p-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    ອັດຕາສຳເລັດ
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {completionRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ສະຖານະການສ້ອມແປງ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">ສຳເລັດ</span>
                <span className="font-medium">{completedRepairs}</span>
              </div>
              <Progress 
                value={totalRepairs > 0 ? (completedRepairs / totalRepairs) * 100 : 0}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">ກຳລັງດຳເນີນການ</span>
                <span className="font-medium">{inProgressRepairs}</span>
              </div>
              <Progress 
                value={totalRepairs > 0 ? (inProgressRepairs / totalRepairs) * 100 : 0}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">ລໍຖ້າ</span>
                <span className="font-medium">{pendingRepairs}</span>
              </div>
              <Progress 
                value={totalRepairs > 0 ? (pendingRepairs / totalRepairs) * 100 : 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ຄວາມສຳຄັນ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">ສູງ</span>
                <span className="font-medium">{highPriority}</span>
              </div>
              <Progress 
                value={totalRepairs > 0 ? (highPriority / totalRepairs) * 100 : 0}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">ປານກາງ</span>
                <span className="font-medium">{mediumPriority}</span>
              </div>
              <Progress 
                value={totalRepairs > 0 ? (mediumPriority / totalRepairs) * 100 : 0}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">ຕໍ່າ</span>
                <span className="font-medium">{lowPriority}</span>
              </div>
              <Progress 
                value={totalRepairs > 0 ? (lowPriority / totalRepairs) * 100 : 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ສະຖິຕິຊ່າງເຕັກນິກ</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(technicianStats).length === 0 ? (
            <p className="text-gray-500 text-sm">ຍັງບໍ່ມີຂໍ້ມູນ</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ຊ່າງເຕັກນິກ</TableHead>
                  <TableHead>ວຽກທັງໝົດ</TableHead>
                  <TableHead>ວຽກສຳເລັດ</TableHead>
                  <TableHead>ອັດຕາສຳເລັດ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(technicianStats).map(([name, stats]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{stats.total}</TableCell>
                    <TableCell>{stats.completed}</TableCell>
                    <TableCell>{((stats.completed / stats.total) * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
