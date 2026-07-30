import { useEffect } from 'react';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { roomBorrowingApi } from '../../services/api';
import { useEmployees, useAvailableRooms } from '../../hooks/useReferenceData';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoomBorrowingForm({ open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const currentUser = useAuthStore((s) => s.user);
  const { data: employees = [] } = useEmployees();
  const { data: availableRooms = [] } = useAvailableRooms();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ borrowedAt: dayjs() });
    }
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      const data = {
        employeeId: values.employeeId,
        roomId: values.roomId,
        borrowedAt: (values.borrowedAt as dayjs.Dayjs).toISOString(),
        dueDate: values.dueDate ? (values.dueDate as dayjs.Dayjs).format('YYYY-MM-DD') : '',
        purpose: values.purpose ?? '',
        recordedBy: currentUser?.id ?? '',
      };
      return roomBorrowingApi.insert(data);
    },
    onSuccess: (res) => {
      if (res.success) { toast.success('ບັນທຶກການຢືມສຳເລັດ'); onSuccess(); }
      else toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  return (
    <Modal
      title="ບັນທຶກການຢືມກະແຈຫ້ອງຄອມ"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={mutation.isPending}
    >
      <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
        <Form.Item name="employeeId" label="ຜູ້ຢືມ" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={employees.map((e) => ({ value: e.id, label: `${e.fullName} (${e.position})` }))}
          />
        </Form.Item>
        <Form.Item name="roomId" label="ຫ້ອງຄອມ" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="ເລືອກຫ້ອງທີ່ວ່າງ"
            options={availableRooms.map((r) => ({ value: r.id, label: `${r.code} - ${r.name}` }))}
          />
        </Form.Item>
        <Form.Item name="borrowedAt" label="ວັນ-ເວລາຢືມ" rules={[{ required: true }]}>
          <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
        </Form.Item>
        <Form.Item name="dueDate" label="ກຳນົດສົ່ງຄືນ">
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="purpose" label="ຈຸດປະສົງ">
          <Input.TextArea rows={2} placeholder="ຕົວຢ່າງ: ສອນວິຊາ..., ປະຊຸມ..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
