import { useEffect } from 'react';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { borrowingApi } from '../../services/api';
import { useDepartments, useEmployees, useUsers, useAvailableEquipment } from '../../hooks/useReferenceData';
import { useAuthStore } from '../../store/useAuthStore';
import ItemsTable, { type ItemRow } from '../../components/forms/ItemsTable';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BorrowingForm({ open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const currentUser = useAuthStore((s) => s.user);
  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployees();
  const { data: users = [] } = useUsers();
  const { data: availableEquipment = [] } = useAvailableEquipment();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ borrowDate: dayjs(), items: [], approvedBy: currentUser?.id });
    }
  }, [open, form, currentUser]);

  const mutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      const header = {
        borrowerId: values.borrowerId,
        departmentId: values.departmentId,
        borrowDate: (values.borrowDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        dueDate: values.dueDate ? (values.dueDate as dayjs.Dayjs).format('YYYY-MM-DD') : '',
        approvedBy: values.approvedBy,
        note: values.note ?? '',
      };
      return borrowingApi.insert(header, ((values.items as ItemRow[]) ?? []) as unknown as Record<string, unknown>[]);
    },
    onSuccess: (res) => {
      if (res.success) { toast.success('ບັນທຶກການຢືມສຳເລັດ'); onSuccess(); }
      else toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp) form.setFieldValue('departmentId', emp.departmentId);
  };

  return (
    <Modal
      title="ບັນທຶກການຢືມອຸປະກອນ"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={mutation.isPending}
      width={720}
    >
      <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
        <Form.Item name="borrowerId" label="ຜູ້ຢືມ" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={employees.map((e) => ({ value: e.id, label: `${e.fullName} (${e.position})` }))}
            onChange={handleEmployeeChange}
          />
        </Form.Item>
        <Form.Item name="departmentId" label="ຫ້ອງການ/ພະແນກ">
          <Select options={departments.map((d) => ({ value: d.id, label: d.name }))} />
        </Form.Item>
        <Form.Item name="borrowDate" label="ວັນທີຢືມ" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="dueDate" label="ວັນທີກຳນົດຄືນ">
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="approvedBy" label="ຜູ້ອະນຸມັດ">
          <Select options={users.map((u) => ({ value: u.id, label: u.fullName }))} />
        </Form.Item>
        <Form.Item name="note" label="ໝາຍເຫດ">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="items" label="ລາຍການອຸປະກອນ" rules={[{ required: true, message: 'ກະລຸນາເພີ່ມອຸປະກອນຢ່າງໜ້ອຍ 1 ລາຍການ' }]}>
          <ItemsTable availableEquipment={availableEquipment} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
