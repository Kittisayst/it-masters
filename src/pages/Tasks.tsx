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
  Popconfirm,
  DatePicker
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useStore } from '@/store/useStore'
import { googleSheetsService } from '@/services/googleSheets'
import { formatDate, getTodayISO } from '@/utils/dateFormat'
import type { WorkTask } from '@/types/task'
import dayjs from 'dayjs'

interface WorkTaskForm {
  title: string
  description: string
  assignedTo: string
  dueDate: any
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  notes?: string
}

const { TextArea } = Input

export default function Tasks() {
  const { workTasks, setWorkTasks, addWorkTask, updateWorkTask, deleteWorkTask, isLoading, setLoading } = useStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [form] = Form.useForm()

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = await googleSheetsService.getWorkTasks()
      setWorkTasks(data)
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
      dueDate: dayjs(),
      status: 'todo',
      priority: 'medium',
    })
    setEditingTask(null)
    setIsFormOpen(true)
  }

  const handleEdit = (task: WorkTask) => {
    form.setFieldsValue({
      ...task,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    })
    setEditingTask(task.id)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await googleSheetsService.deleteWorkTaskById(id)
      deleteWorkTask(id)
      message.success('ລຶບວຽກງານສຳເລັດ')
    } catch (error) {
      message.error('ລຶບວຽກງານບໍ່ສຳເລັດ')
    }
  }

  const onFinish = async (values: WorkTaskForm) => {
    setIsSaving(true)
    try {
      const taskData = {
        ...values,
        date: getTodayISO(),
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : getTodayISO(),
      }

      if (editingTask) {
        const updatedTask = { ...taskData, id: editingTask }
        await googleSheetsService.updateWorkTaskById(editingTask, updatedTask)
        updateWorkTask(editingTask, updatedTask)
        message.success('ອັບເດດວຽກງານສຳເລັດ')
      } else {
        const newTask = await googleSheetsService.addWorkTask(taskData)
        addWorkTask(newTask)
        message.success('ເພີ່ມວຽກງານສຳເລັດ')
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
      title: 'ຫົວຂໍ້ວຽກງານ',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'ລາຍລະອຽດ',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'ຜູ້ຮັບຜິດຊອບ',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 150,
    },
    {
      title: 'ກຳນົດສົ່ງ',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'ສະຖານະ',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={
          status === 'done' ? 'success' :
          status === 'in-progress' ? 'processing' :
          status === 'todo' ? 'default' : 'default'
        }>
          {status === 'done' ? 'ສຳເລັດ' :
           status === 'in-progress' ? 'ກຳລັງເຮັດ' :
           status === 'todo' ? 'ຕ້ອງເຮັດ' : status}
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
      render: (_: any, record: WorkTask) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="ລຶບວຽກງານ"
            description="ທ່ານຕ້ອງການລຶບວຽກງານນີ້ບໍ່?"
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
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircleOutlined className="text-2xl text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ວຽກງານ</h1>
            <p className="text-sm text-gray-500">ຈັດການວຽກງານແລະການມອບໝາຍ</p>
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
            ເພີ່ມວຽກງານ
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={workTasks}
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
        title={editingTask ? 'ແກ້ໄຂວຽກງານ' : 'ເພີ່ມວຽກງານໃໝ່'}
        open={isFormOpen}
        onCancel={() => {
          setIsFormOpen(false)
          form.resetFields()
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="ຫົວຂໍ້ວຽກງານ"
            name="title"
            rules={[{ required: true, message: 'ກະລຸນາປ້ອນຫົວຂໍ້ວຽກງານ' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="ລາຍລະອຽດ"
            name="description"
            rules={[{ required: true, message: 'ກະລຸນາອະທິບາຍລາຍລະອຽດ' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="ຜູ້ຮັບຜິດຊອບ"
              name="assignedTo"
              rules={[{ required: true, message: 'ກະລຸນາເລືອກຜູ້ຮັບຜິດຊອບ' }]}
            >
              <Select>
                <Select.Option value="ພະນັກງານ A">ພະນັກງານ A</Select.Option>
                <Select.Option value="ພະນັກງານ B">ພະນັກງານ B</Select.Option>
                <Select.Option value="ພະນັກງານ C">ພະນັກງານ C</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="ກຳນົດສົ່ງ"
              name="dueDate"
              rules={[{ required: true, message: 'ກະລຸນາເລືອກວັນທີ່' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="ສະຖານະ"
              name="status"
              rules={[{ required: true, message: 'ກະລຸນາເລືອກສະຖານະ' }]}
            >
              <Select>
                <Select.Option value="todo">ຕ້ອງເຮັດ</Select.Option>
                <Select.Option value="in-progress">ກຳລັງເຮັດ</Select.Option>
                <Select.Option value="done">ສຳເລັດ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="ຄວາມສຳຄັນ"
              name="priority"
            >
              <Select>
                <Select.Option value="low">ຕ່ຳ</Select.Option>
                <Select.Option value="medium">ກາງ</Select.Option>
                <Select.Option value="high">ສູງ</Select.Option>
              </Select>
            </Form.Item>
          </div>

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
