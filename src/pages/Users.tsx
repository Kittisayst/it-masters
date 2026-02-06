import { useState, useEffect } from 'react'
import { Users as UsersIcon, Edit2, Trash2, Search, UserPlus, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import type { User } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { userSchema, type UserFormData } from '@/lib/validations/auth'

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      password: '',
      fullName: '',
      email: '',
      role: 'user',
      department: '',
      status: 'active',
    },
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement getUsers in authService
      // const allUsers = await authService.getUsers()
      // setUsers(allUsers)
      setUsers([])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('ໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ບໍ່ສຳເລັດ')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (_data: UserFormData) => {
    try {
      if (editingUser) {
        // TODO: Update user with _data
        toast.success('ອັບເດດຜູ້ໃຊ້ສຳເລັດ')
      } else {
        // TODO: Create user with _data
        toast.success('ເພີ່ມຜູ້ໃຊ້ສຳເລັດ')
      }
      
      resetForm()
      loadUsers()
    } catch (error) {
      toast.error('ເກີດຂໍ້ຜິດພາດ: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.reset({
      username: user.username,
      password: '',
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
    })
    setShowAddModal(true)
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`ທ່ານຕ້ອງການລຶບຜູ້ໃຊ້ "${user.fullName}" ບໍ?`)) return
    
    try {
      // TODO: Delete user
      toast.success('ລຶບຜູ້ໃຊ້ສຳເລັດ')
      loadUsers()
    } catch (error) {
      toast.error('ເກີດຂໍ້ຜິດພາດ: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const resetForm = () => {
    form.reset({
      username: '',
      password: '',
      fullName: '',
      email: '',
      role: 'user',
      department: '',
      status: 'active',
    })
    setEditingUser(null)
    setShowAddModal(false)
  }

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Check if current user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ບໍ່ມີສິດເຂົ້າເຖິງ</h2>
          <p className="text-gray-600">ພຽງແຕ່ຜູ້ດູແລລະບົບເທົ່ານັ້ນທີ່ສາມາດເຂົ້າເຖິງໜ້ານີ້ໄດ້</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <UsersIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ຈັດການຜູ້ໃຊ້</h1>
            <p className="text-sm text-gray-500">ຈັດການບັນຊີຜູ້ໃຊ້ງານລະບົບ</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-5 h-5 mr-2" />
          ເພີ່ມຜູ້ໃຊ້
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="ຄົ້ນຫາຜູ້ໃຊ້..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
              <p className="mt-2 text-gray-600">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'ບໍ່ພົບຜູ້ໃຊ້ທີ່ຄົ້ນຫາ' : 'ຍັງບໍ່ມີຜູ້ໃຊ້ໃນລະບົບ'}
            </div>
          ) : (
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ຜູ້ໃຊ້</TableHead>
                    <TableHead>ບົດບາດ</TableHead>
                    <TableHead>ພະແນກ</TableHead>
                    <TableHead>ສະຖານະ</TableHead>
                    <TableHead>ເຂົ້າລະບົບຄັ້ງສຸດທ້າຍ</TableHead>
                    <TableHead className="text-right">ການກະທຳ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">@{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'admin' ? 'destructive' :
                            user.role === 'technician' ? 'secondary' : 'outline'
                          }
                        >
                          {user.role === 'admin' ? 'ຜູ້ດູແລລະບົບ' :
                           user.role === 'technician' ? 'ຊ່າງເຕັກນິກ' : 'ຜູ້ໃຊ້'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? 'ໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {user.lastLogin || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            title="ແກ້ໄຂ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            title="ລຶບ"
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'ແກ້ໄຂຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ທີ່ເລືອກ' : 'ສ້າບັນຊີຜູ້ໃຊ້ໃໝ່ເພື່ອເຂົ້າໃຊ້ງານລະບົບ'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ຊື່ຜູ້ໃຊ້ *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!!editingUser} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {editingUser ? 'ລະຫັດຜ່ານໃໝ່ (ຫວ່າງໄວ້ຖ້າບໍ່ປ່ຽນ)' : 'ລະຫັດຜ່ານ *'}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ຊື່ເຕັມ *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ບົດບາດ *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ເລືອກບົດບາດ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">ຜູ້ໃຊ້</SelectItem>
                        <SelectItem value="technician">ຊ່າງເຕັກນິກ</SelectItem>
                        <SelectItem value="admin">ຜູ້ດູແລລະບົບ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ພະແນກ *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>ສະຖານະ *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ເລືອກສະຖານະ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">ໃຊ້ງານ</SelectItem>
                        <SelectItem value="inactive">ປິດໃຊ້ງານ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  ຍົກເລີກ
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ກຳລັງບັນທຶກ...
                    </>
                  ) : (
                    editingUser ? 'ອັບເດດ' : 'ເພີ່ມ'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
