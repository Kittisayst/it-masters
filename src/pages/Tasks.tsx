import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { googleSheetsService } from '@/services/googleSheets'
import { formatDate, getTodayISO } from '@/utils/dateFormat'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { workTaskSchema, type WorkTaskFormData } from '@/lib/validations/tasks'

export default function Tasks() {
  const { workTasks, addWorkTask, updateWorkTask, deleteWorkTask } = useStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)

  const form = useForm<WorkTaskFormData>({
    resolver: zodResolver(workTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedTo: '',
      status: 'todo',
      dueDate: '',
    },
  })

  const onSubmit = async (data: WorkTaskFormData) => {
    setIsSaving(true)
    
    try {
      if (editingTask) {
        const taskIndex = workTasks.findIndex(t => t.id === editingTask)
        if (taskIndex !== -1) {
          await googleSheetsService.updateWorkTask(taskIndex, data)
          updateWorkTask(editingTask, data)
          toast.success('ອັບເດດວຽກງານສຳເລັດ')
        }
        setEditingTask(null)
      } else {
        const newTask = {
          id: Date.now().toString(),
          date: getTodayISO(),
          ...data,
          dueDate: data.dueDate || '',
        }
        await googleSheetsService.addWorkTask(newTask)
        addWorkTask(newTask)
        toast.success('ເພີ່ມວຽກງານສຳເລັດ')
      }
      
      form.reset()
      setIsFormOpen(false)
    } catch (error) {
      console.error('❌ Error saving work task:', error)
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (task: any) => {
    setEditingTask(task.id)
    form.reset({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      status: task.status,
      dueDate: task.dueDate,
    })
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ລະບົບເກັບກຳຂໍ້ມູນວຽກງານ</h2>
          <p className="mt-1 text-sm text-gray-500">
            ຈັດການວຽກງານປະຈຳວັນ
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null)
            form.reset({
              title: '',
              description: '',
              assignedTo: '',
              status: 'todo',
              dueDate: '',
            })
            setIsFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          ເພີ່ມວຽກງານ
        </Button>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'ແກ້ໄຂວຽກງານ' : 'ເພີ່ມວຽກງານໃໝ່'}
            </DialogTitle>
            <DialogDescription>
              {editingTask ? 'ແກ້ໄຂຂໍ້ມູນວຽກງານທີ່ເລືອກ' : 'ສ້າງວຽກງານໃໝ່ແລະມອບໝາຍໃຫ້ຜູ້ຮັບຜິດຊອບ'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ຫົວຂໍ້ວຽກງານ</FormLabel>
                    <FormControl>
                      <Input placeholder="ປ້ອນຫົວຂໍ້ວຽກງານ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ລາຍລະອຽດ</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="ອະທິບາຍລາຍລະອຽດວຽກງານ"
                        rows={4}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ມອບໝາຍໃຫ້</FormLabel>
                      <FormControl>
                        <Input placeholder="ປ້ອນຊື່ຜູ້ຮັບຜິດຊອບ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ສະຖານະ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ເລືອກສະຖານະ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">ຕ້ອງເຮັດ</SelectItem>
                          <SelectItem value="in-progress">ກຳລັງເຮັດ</SelectItem>
                          <SelectItem value="done">ສຳເລັດ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ກຳນົດສົ່ງ</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false)
                    setEditingTask(null)
                    form.reset()
                  }}
                >
                  ຍົກເລີກ
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ກຳລັງບັນທຶກ...
                    </>
                  ) : editingTask ? (
                    'ອັບເດດ'
                  ) : (
                    'ບັນທຶກ'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ວັນທີ</TableHead>
              <TableHead>ຫົວຂໍ້</TableHead>
              <TableHead>ລາຍລະອຽດ</TableHead>
              <TableHead>ມອບໝາຍໃຫ້</TableHead>
              <TableHead>ກຳນົດສົ່ງ</TableHead>
              <TableHead>ສະຖານະ</TableHead>
              <TableHead className="text-right">ຈັດການ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  ຍັງບໍ່ມີຂໍ້ມູນວຽກງານ
                </TableCell>
              </TableRow>
            ) : (
              workTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(task.date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {task.title}
                  </TableCell>
                  <TableCell>
                    {task.description}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {task.assignedTo}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(task.dueDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(task)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteDialog(task.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ລຶບວຽກງານ</AlertDialogTitle>
            <AlertDialogDescription>
              ທ່ານຕ້ອງການລຶບວຽກງານນີ້ບໍ່? ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ຍົກເລີກ</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (showDeleteDialog) {
                  try {
                    const taskIndex = workTasks.findIndex(t => t.id === showDeleteDialog)
                    if (taskIndex !== -1) {
                      await googleSheetsService.deleteWorkTask(taskIndex)
                      deleteWorkTask(showDeleteDialog)
                      toast.success('ລຶບວຽກງານສຳເລັດ')
                    }
                  } catch (error) {
                    console.error('❌ Error deleting work task:', error)
                    toast.error('ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ')
                  }
                  setShowDeleteDialog(null)
                }
              }}
            >
              ລຶບ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
