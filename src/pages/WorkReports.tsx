import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { ClipboardList, CheckCircle, Clock, Printer, FileSpreadsheet } from 'lucide-react'
import { exportWorkTasksToExcel } from '@/utils/exportUtils'
import { PrintableWorkReport } from '@/components/PrintableWorkReport'
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

export default function WorkReports() {
  const { workTasks } = useStore()
  const printRef = useRef<HTMLDivElement>(null)

  const totalTasks = workTasks.length
  const completedTasks = workTasks.filter((t) => t.status === 'done').length
  const inProgressTasks = workTasks.filter((t) => t.status === 'in-progress').length
  const todoTasks = workTasks.filter((t) => t.status === 'todo').length

  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0'

  const assigneeStats = workTasks.reduce((acc, task) => {
    if (!acc[task.assignedTo]) {
      acc[task.assignedTo] = { total: 0, completed: 0, inProgress: 0, todo: 0 }
    }
    acc[task.assignedTo].total++
    if (task.status === 'done') {
      acc[task.assignedTo].completed++
    } else if (task.status === 'in-progress') {
      acc[task.assignedTo].inProgress++
    } else {
      acc[task.assignedTo].todo++
    }
    return acc
  }, {} as Record<string, { total: number; completed: number; inProgress: number; todo: number }>)

  const today = new Date().toISOString().split('T')[0]
  const overdueTasks = workTasks.filter((t) => t.dueDate < today && t.status !== 'done')

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `ລາຍງານວຽກງານ_${new Date().toLocaleDateString('lo-LA')}`,
  })

  const handleExportPDF = () => {
    if (workTasks.length === 0) {
      toast.error('ບໍ່ມີຂໍ້ມູນສຳລັບ export')
      return
    }
    handlePrint()
  }

  const handleExportExcel = () => {
    if (workTasks.length === 0) {
      toast.error('ບໍ່ມີຂໍ້ມູນສຳລັບ export')
      return
    }
    exportWorkTasksToExcel(workTasks as any)
    toast.success('Export Excel ສຳເລັດ')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ລາຍງານການເຮັດວຽກ</h2>
          <p className="mt-1 text-sm text-gray-500">
            ສະຫຼຸບຂໍ້ມູນວຽກງານປະຈຳວັນ
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
        <PrintableWorkReport ref={printRef} tasks={workTasks as any} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="shrink-0 bg-blue-500 rounded-md p-3">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    ທັງໝົດ
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalTasks}
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
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    ສຳເລັດ
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {completedTasks}
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
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    ກຳລັງເຮັດ
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {inProgressTasks}
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
                <ClipboardList className="h-6 w-6 text-white" />
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
            <CardTitle>ສະຖານະວຽກງານ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">ສຳເລັດ</span>
                <span className="font-medium">{completedTasks}</span>
              </div>
              <Progress 
                value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">ກຳລັງເຮັດ</span>
                <span className="font-medium">{inProgressTasks}</span>
              </div>
              <Progress 
                value={totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">ຕ້ອງເຮັດ</span>
                <span className="font-medium">{todoTasks}</span>
              </div>
              <Progress 
                value={totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ວຽກເກີນກຳນົດ</CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">ບໍ່ມີວຽກເກີນກຳນົດ</p>
            ) : (
              <div className="space-y-3">
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
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      ເກີນກຳນົດ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ສະຖິຕິຜູ້ຮັບຜິດຊອບ</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(assigneeStats).length === 0 ? (
            <p className="text-gray-500 text-sm">ຍັງບໍ່ມີຂໍ້ມູນ</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ຜູ້ຮັບຜິດຊອບ</TableHead>
                  <TableHead>ທັງໝົດ</TableHead>
                  <TableHead>ສຳເລັດ</TableHead>
                  <TableHead>ກຳລັງເຮັດ</TableHead>
                  <TableHead>ຕ້ອງເຮັດ</TableHead>
                  <TableHead>ອັດຕາສຳເລັດ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(assigneeStats).map(([name, stats]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{stats.total}</TableCell>
                    <TableCell>{stats.completed}</TableCell>
                    <TableCell>{stats.inProgress}</TableCell>
                    <TableCell>{stats.todo}</TableCell>
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
