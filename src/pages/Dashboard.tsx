import { useStore } from '@/store/useStore'
import { Wrench, ClipboardList, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Dashboard() {
  const { repairTasks, workTasks } = useStore()

  const stats = [
    {
      name: 'ວຽກສ້ອມແປງທັງໝົດ',
      value: repairTasks.length,
      icon: Wrench,
      color: 'bg-blue-500',
    },
    {
      name: 'ວຽກສ້ອມແປງສຳເລັດ',
      value: repairTasks.filter((t) => t.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'ວຽກງານທັງໝົດ',
      value: workTasks.length,
      icon: ClipboardList,
      color: 'bg-purple-500',
    },
    {
      name: 'ວຽກງານສຳເລັດ',
      value: workTasks.filter((t) => t.status === 'done').length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ]

  const recentRepairs = repairTasks.slice(-5).reverse()
  const recentTasks = workTasks.slice(-5).reverse()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          ພາບລວມລະບົບຄຸ້ມຄອງວຽກງານໄອທີ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className={`shrink-0 ${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      {stat.name}
                    </p>
                    <p className="text-3xl font-semibold">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ວຽກສ້ອມແປງລ່າສຸດ</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRepairs.length === 0 ? (
              <p className="text-muted-foreground text-sm">ຍັງບໍ່ມີຂໍ້ມູນ</p>
            ) : (
              <div className="space-y-3">
                {recentRepairs.map((repair) => (
                  <div
                    key={repair.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {repair.equipment}
                      </p>
                      <p className="text-xs text-muted-foreground">{repair.issue}</p>
                    </div>
                    <Badge
                      variant={
                        repair.status === 'completed'
                          ? 'default'
                          : repair.status === 'in-progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {repair.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ວຽກງານລ່າສຸດ</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">ຍັງບໍ່ມີຂໍ້ມູນ</p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ມອບໝາຍໃຫ້: {task.assignedTo}
                      </p>
                    </div>
                    <Badge
                      variant={
                        task.status === 'done'
                          ? 'default'
                          : task.status === 'in-progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
