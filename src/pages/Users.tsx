import { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Modal, 
  Form, 
  Select, 
  Tag, 
  Space,
  message,
  Popconfirm
} from 'antd'
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  UserOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { googleSheetsService } from '@/services/googleSheets'
import type { User } from '@/types/user'

interface UserFormData {
  username: string
  password?: string
  fullName: string
  email: string
  role: 'admin' | 'technician' | 'user'
  department: string
  status: 'active' | 'inactive'
}

const { Search } = Input

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await googleSheetsService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      message.error('ໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ບໍ່ສຳເລັດ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadUsers()
    message.success('ໂຫຼດຂໍ້ມູນສຳເລັດ')
  }

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
    })
    setShowAddModal(true)
  }

  const handleDelete = async (user: User) => {
    try {
      await googleSheetsService.deleteUserById(user.id)
      setUsers(users.filter((u) => u.id !== user.id))
      message.success('ລຶບຜູ້ໃຊ້ສຳເລັດ')
    } catch (error) {
      console.error('Error deleting user:', error)
      message.error('ລຶບຜູ້ໃຊ້ບໍ່ສຳເລັດ')
    }
  }

  const onFinish = async (values: UserFormData) => {
    try {
      if (editingUser) {
        await googleSheetsService.updateUserById(editingUser.id, values)
        setUsers(users.map((u) => 
          u.id === editingUser.id 
            ? { ...u, ...values } 
            : u
        ))
        message.success('ອັບເດດຜູ້ໃຊ້ສຳເລັດ')
      } else {
        if (!values.password) {
          message.error('ກະລຸນາປ້ອນລະຫັດຜ່ານ')
          return
        }
        const newUser = await googleSheetsService.addUser({
          ...values,
          password: values.password,
        })
        setUsers([...users, newUser])
        message.success('ເພີ່ມຜູ້ໃຊ້ສຳເລັດ')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error:', error)
      message.error(editingUser ? 'ອັບເດດຜູ້ໃຊ້ບໍ່ສຳເລັດ' : 'ເພີ່ມຜູ້ໃຊ້ບໍ່ສຳເລັດ')
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingUser(null)
    form.resetFields()
  }

  const columns = [
    {
      title: 'ຜູ້ໃຊ້',
      key: 'user',
      render: (_: any, record: User) => (
        <div>
          <div className="font-medium">{record.fullName}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
          <div className="text-xs text-gray-400">@{record.username}</div>
        </div>
      ),
    },
    {
      title: 'ບົດບາດ',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={
          role === 'admin' ? 'red' :
          role === 'technician' ? 'blue' : 'default'
        }>
          {role === 'admin' ? 'ຜູ້ດູແລລະບົບ' :
           role === 'technician' ? 'ຊ່າງເຕັກນິກ' : 'ຜູ້ໃຊ້'}
        </Tag>
      ),
    },
    {
      title: 'ພະແນກ',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'ສະຖານະ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'ໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
        </Tag>
      ),
    },
    {
      title: 'ເຂົ້າລະບົບຄັ້ງສຸດທ້າຍ',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin: string | null) => lastLogin || '-',
    },
    {
      title: 'ການກະທຳ',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="ລຶບຜູ້ໃຊ້"
            description="ທ່ານຕ້ອງການລຶບຜູ້ໃຊ້ນີ້ບໍ່?"
            onConfirm={() => handleDelete(record)}
            okText="ລຶບ"
            cancelText="ຍົກເລີກ"
            disabled={record.id === currentUser?.id}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.id === currentUser?.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <UserOutlined className="text-2xl text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ຈັດການຜູ້ໃຊ້</h1>
            <p className="text-sm text-gray-500">ຈັດການບັນຊີຜູ້ໃຊ້ງານລະບົບ</p>
          </div>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            ໂຫຼດໃໝ່
          </Button>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setShowAddModal(true)}
          >
            ເພີ່ມຜູ້ໃຊ້
          </Button>
        </Space>
      </div>

      {/* Search */}
      <Card>
        <Search
          placeholder="ຄົ້ນຫາຜູ້ໃຊ້..."
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `ທັງໝົດ ${total} ຄົນ`,
          }}
          locale={{
            emptyText: searchQuery ? 'ບໍ່ພົບຜູ້ໃຊ້ທີ່ຄົ້ນຫາ' : 'ຍັງບໍ່ມີຜູ້ໃຊ້ໃນລະບົບ'
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingUser ? 'ແກ້ໄຂຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່'}
        open={showAddModal}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="ຊື່ຜູ້ໃຊ້"
            name="username"
            rules={[
              { required: true, message: 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້' },
              { min: 3, message: 'ຊື່ຜູ້ໃຊ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ' }
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="ລະຫັດຜ່ານ"
              name="password"
              rules={[
                { required: true, message: 'ກະລຸນາປ້ອນລະຫັດຜ່ານ' },
                { min: 6, message: 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            label="ຊື່ເຕັມ"
            name="fullName"
            rules={[{ required: true, message: 'ກະລຸນາປ້ອນຊື່ເຕັມ' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="ອີເມລ"
            name="email"
            rules={[
              { required: true, message: 'ກະລຸນາປ້ອນອີເມລ' },
              { type: 'email', message: 'ຮູບແບບອີເມລບໍ່ຖືກຕ້ອງ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="ບົດບາດ"
            name="role"
            rules={[{ required: true, message: 'ກະລຸນາເລືອກບົດບາດ' }]}
          >
            <Select>
              <Select.Option value="user">ຜູ້ໃຊ້</Select.Option>
              <Select.Option value="technician">ຊ່າງເຕັກນິກ</Select.Option>
              <Select.Option value="admin">ຜູ້ດູແລລະບົບ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="ພະແນກ"
            name="department"
            rules={[{ required: true, message: 'ກະລຸນາປ້ອນພະແນກ' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="ສະຖານະ"
            name="status"
            rules={[{ required: true, message: 'ກະລຸນາເລືອກສະຖານະ' }]}
          >
            <Select>
              <Select.Option value="active">ໃຊ້ງານ</Select.Option>
              <Select.Option value="inactive">ປິດໃຊ້ງານ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={handleCloseModal}>
                ຍົກເລີກ
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'ອັບເດດ' : 'ເພີ່ມ'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
