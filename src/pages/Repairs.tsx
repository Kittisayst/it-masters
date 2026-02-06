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
import { repairTaskSchema, type RepairTaskFormData } from '@/lib/validations/tasks'

export default function Repairs() {
  const { repairTasks, addRepairTask, updateRepairTask, deleteRepairTask } = useStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)

  const form = useForm<RepairTaskFormData>({
    resolver: zodResolver(repairTaskSchema),
    defaultValues: {
      equipment: '',
      issue: '',
      solution: '',
      technician: '',
      status: 'pending',
      priority: 'medium',
    },
  })

  const onSubmit = async (data: RepairTaskFormData) => {
    setIsSaving(true)
    
    try {
      if (editingTask) {
        const taskIndex = repairTasks.findIndex(t => t.id === editingTask)
        if (taskIndex !== -1) {
          await googleSheetsService.updateRepairTask(taskIndex, data)
          updateRepairTask(editingTask, data)
          toast.success('ອັບເດດວຽກສ້ອມແປງສຳເລັດ')
        }
        setEditingTask(null)
      } else {
        const newTask = {
          id: Date.now().toString(),
          date: getTodayISO(),
          ...data,
        }
        await googleSheetsService.addRepairTask(newTask)
        addRepairTask(newTask)
        toast.success('ເພີ່ມວຽກສ້ອມແປງສຳເລັດ')
      }
      
      form.reset()
      setIsFormOpen(false)
    } catch (error) {
      console.error('❌ Error saving repair task:', error)
      toast.error('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (task: any) => {
    setEditingTask(task.id)
    form.reset({
      equipment: task.equipment,
      issue: task.issue,
      solution: task.solution,
      technician: task.technician,
      status: task.status,
      priority: task.priority,
    })
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ສ້ອມແປງໄອທີ</h2>
          <p className="mt-1 text-sm text-gray-500">
            ຈັດການການສ້ອມແປງອຸປະກອນ IT
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null)
            form.reset({
              equipment: '',
              issue: '',
              solution: '',
              technician: '',
              status: 'pending',
              priority: 'medium',
            })
            setIsFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          ເພີ່ມວຽກສ້ອມແປງ
        </Button>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'ແກ້ໄຂວຽກສ້ອມແປງ' : 'ເພີ່ມວຽກສ້ອມແປງໃໝ່'}
            </DialogTitle>
            <DialogDescription>
              {editingTask ? 'ແກ້ໄຂຂໍ້ມູນການສ້ອມແປງທີ່ເລືອກ' : 'ບັນທຶກການສ້ອມແປງໃໝ່ເຂົ້າລະບົບ'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ອຸປະກອນ</FormLabel>
                      <FormControl>
                        <Input placeholder="ປ້ອນຊື່ອຸປະກອນ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="technician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ຊ່າງເຕັກນິກ</FormLabel>
                      <FormControl>
                        <Input placeholder="ປ້ອນຊື່ຊ່າງ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="issue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ບັນຫາ</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="ອະທິບາຍບັນຫາທີ່ເກີດຂຶ້ນ"
                        rows={3}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="solution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ວິທີແກ້ໄຂ</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="ອະທິບາຍວິທີແກ້ໄຂບັນຫາ"
                        rows={3}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          <SelectItem value="pending">ລໍຖ້າ</SelectItem>
                          <SelectItem value="in-progress">ກຳລັງດຳເນີນການ</SelectItem>
                          <SelectItem value="completed">ສຳເລັດ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ຄວາມສຳຄັນ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ເລືອກຄວາມສຳຄັນ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">ຕໍ່າ</SelectItem>
                          <SelectItem value="medium">ປານກາງ</SelectItem>
                          <SelectItem value="high">ສູງ</SelectItem>
                        </SelectContent>
                      </Select>
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
              <TableHead>ອຸປະກອນ</TableHead>
              <TableHead>ບັນຫາ</TableHead>
              <TableHead>ຊ່າງເຕັກນິກ</TableHead>
              <TableHead>ສະຖານະ</TableHead>
              <TableHead>ຄວາມສຳຄັນ</TableHead>
              <TableHead className="text-right">ຈັດການ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repairTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  ຍັງບໍ່ມີຂໍ້ມູນວຽກສ້ອມແປງ
                </TableCell>
              </TableRow>
            ) : (
              repairTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(task.date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {task.equipment}
                  </TableCell>
                  <TableCell>
                    {task.issue}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {task.technician}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        task.status === 'completed'
                          ? 'default'
                          : task.status === 'in-progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        task.priority === 'high'
                          ? 'destructive'
                          : task.priority === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {task.priority}
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
            <AlertDialogTitle>ລຶບວຽກສ້ອມແປງ</AlertDialogTitle>
            <AlertDialogDescription>
              ທ່ານຕ້ອງການລຶບວຽກສ້ອມແປງນີ້ບໍ່? ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ຍົກເລີກ</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (showDeleteDialog) {
                  try {
                    const taskIndex = repairTasks.findIndex(t => t.id === showDeleteDialog)
                    if (taskIndex !== -1) {
                      await googleSheetsService.deleteRepairTask(taskIndex)
                      deleteRepairTask(showDeleteDialog)
                      toast.success('ລຶບວຽກສ້ອມແປງສຳເລັດ')
                    }
                  } catch (error) {
                    console.error('❌ Error deleting repair task:', error)
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
