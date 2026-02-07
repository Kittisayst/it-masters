import { useState } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tag, 
  Space,
  message,
  Popconfirm
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ToolOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useStore } from '@/store/useStore'
import { googleSheetsService } from '@/services/googleSheets'
import { formatDate, getTodayISO } from '@/utils/dateFormat'
import type { RepairTask } from '@/types/task'

interface RepairTaskForm {
  equipment: string
  issue: string
  reporter: string
  technician: string
  reportDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  solution?: string
  notes?: string
}

const { TextArea } = Input

export default function Repairs() {
  const { repairTasks, setRepairTasks, addRepairTask, updateRepairTask, deleteRepairTask, isLoading, setLoading } = useStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [form] = Form.useForm()

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = await googleSheetsService.getRepairTasks()
      setRepairTasks(data)
      message.success('ໂຫຼດຂໍ້ມູນສຳເລັດ')
    } catch (error) {
      message.error('ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    form.resetFields()
    form.setFieldsValue({
      reportDate: getTodayISO(),
      status: 'pending',
      priority: 'medium',
    })
    setEditingTask(null)
    setIsFormOpen(true)
  }

  const handleEdit = (task: RepairTask) => {
    form.setFieldsValue(task)
    setEditingTask(task.id)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await googleSheetsService.deleteRepairTaskById(id)
      deleteRepairTask(id)
      message.success('ລຶບວຽກສ້ອມແປງສຳເລັດ')
    } catch (error) {
      message.error('ລຶບວຽກສ້ອມແປງບໍ່ສຳເລັດ')
    }
  }

  const onFinish = async (values: RepairTaskForm) => {
    setIsSaving(true)
    try {
      if (editingTask) {
        const updatedTask = { ...values, id: editingTask }
        await googleSheetsService.updateRepairTaskById(editingTask, updatedTask)
        updateRepairTask(editingTask, updatedTask)
        message.success('ອັບເດດວຽກສ້ອມແປງສຳເລັດ')
      } else {
        const taskData = {
          ...values,
          date: values.reportDate || getTodayISO(),
          solution: values.solution || '',
          notes: values.notes || '',
        }
        const newTask = await googleSheetsService.addRepairTask(taskData)
        addRepairTask(newTask)
        message.success('ເພີ່ມວຽກສ້ອມແປງສຳເລັດ')
      }
      setIsFormOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Error:', error)
      message.error(editingTask ? 'ອັບເດດບໍ່ສຳເລັດ' : 'ເພີ່ມບໍ່ສຳເລັດ')
    } finally {
      setIsSaving(false)
    }
  }

  const columns = [
    {
      title: 'ວັນທີ່ແຈ້ງ',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'ອຸປະກອນ',
      dataIndex: 'equipment',
      key: 'equipment',
      width: 150,
    },
    {
      title: 'ບັນຫາ',
      dataIndex: 'issue',
      key: 'issue',
      ellipsis: true,
    },
    {
      title: 'ຜູ້ແຈ້ງ',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 120,
    },
    {
      title: 'ຊ່າງ',
      dataIndex: 'technician',
      key: 'technician',
      width: 120,
    },
    {
      title: 'ສະຖານະ',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={
          status === 'completed' ? 'success' :
          status === 'in-progress' ? 'processing' :
          status === 'pending' ? 'warning' : 'default'
        }>
          {status === 'completed' ? 'ສຳເລັດ' :
           status === 'in-progress' ? 'ກຳລັງດຳເນີນການ' :
           status === 'pending' ? 'ລໍຖ້າ' : 'ຍົກເລີກ'}
        </Tag>
      ),
    },
    {
      title: 'ຄວາມສຳຄັນ',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={
          priority === 'high' ? 'red' :
          priority === 'medium' ? 'orange' : 'default'
        }>
          {priority === 'high' ? 'ສູງ' :
           priority === 'medium' ? 'ກາງ' : 'ຕ່ຳ'}
        </Tag>
      ),
    },
    {
      title: 'ການກະທຳ',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: RepairTask) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="ລຶບວຽກສ້ອມແປງ"
            description="ທ່ານຕ້ອງການລຶບວຽກສ້ອມແປງນີ້ບໍ່?"
            onConfirm={() => handleDelete(record.id)}
            okText="ລຶບ"
            cancelText="ຍົກເລີກ"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
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
          <div className="p-3 bg-blue-100 rounded-lg">
            <ToolOutlined className="text-2xl text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ວຽກສ້ອມແປງ</h1>
            <p className="text-sm text-gray-500">ຈັດການວຽກສ້ອມແປງອຸປະກອນໄອທີ</p>
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
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            ເພີ່ມວຽກສ້ອມແປງ
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={repairTasks}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `ທັງໝົດ ${total} ລາຍການ`,
          }}
        />
      </Card>

      {/* Form Modal */}
      <Modal
        title={editingTask ? 'ແກ້ໄຂວຽກສ້ອມແປງ' : 'ເພີ່ມວຽກສ້ອມແປງໃໝ່'}
        open={isFormOpen}
        onCancel={() => {
          setIsFormOpen(false)
          form.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="ອຸປະກອນ"
              name="equipment"
              rules={[{ required: true, message: 'ກະລຸນາປ້ອນອຸປະກອນ' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="ວັນທີ່ແຈ້ງ"
              name="reportDate"
              rules={[{ required: true, message: 'ກະລຸນາເລືອກວັນທີ່' }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              label="ຜູ້ແຈ້ງ"
              name="reporter"
              rules={[{ required: true, message: 'ກະລຸນາປ້ອນຜູ້ແຈ້ງ' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="ຊ່າງເຕັກນິກ"
              name="technician"
              rules={[{ required: true, message: 'ກະລຸນາເລືອກຊ່າງ' }]}
            >
              <Select>
                <Select.Option value="ຊ່າງ A">ຊ່າງ A</Select.Option>
                <Select.Option value="ຊ່າງ B">ຊ່າງ B</Select.Option>
                <Select.Option value="ຊ່າງ C">ຊ່າງ C</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="ສະຖານະ"
              name="status"
              rules={[{ required: true, message: 'ກະລຸນາເລືອກສະຖານະ' }]}
            >
              <Select>
                <Select.Option value="pending">ລໍຖ້າ</Select.Option>
                <Select.Option value="in-progress">ກຳລັງດຳເນີນການ</Select.Option>
                <Select.Option value="completed">ສຳເລັດ</Select.Option>
                <Select.Option value="cancelled">ຍົກເລີກ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="ຄວາມສຳຄັນ"
              name="priority"
              rules={[{ required: true, message: 'ກະລຸນາເລືອກຄວາມສຳຄັນ' }]}
            >
              <Select>
                <Select.Option value="low">ຕ່ຳ</Select.Option>
                <Select.Option value="medium">ກາງ</Select.Option>
                <Select.Option value="high">ສູງ</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="ບັນຫາ"
            name="issue"
            rules={[{ required: true, message: 'ກະລຸນາອະທິບາຍບັນຫາ' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="ວິທີແກ້ໄຂ"
            name="solution"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="ໝາຍເຫດ"
            name="notes"
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsFormOpen(false)
                form.resetFields()
              }}>
                ຍົກເລີກ
              </Button>
              <Button type="primary" htmlType="submit" loading={isSaving}>
                {editingTask ? 'ອັບເດດ' : 'ເພີ່ມ'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
