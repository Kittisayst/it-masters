import { useEffect } from 'react';
import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { equipmentApi } from '../../services/api';
import { useUsers } from '../../hooks/useReferenceData';
import { useAuthStore } from '../../store/useAuthStore';
import type { Equipment } from '../../types';

interface Props {
  open: boolean;
  equipment: Equipment | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPES = ['ຄອມ', 'Printer', 'Projector', 'Network', 'ອື່ນໆ'];
const STATUSES = ['ປົກກະຕິ', 'ສ້ອມແປງ', 'ປົດລຶບ'];

export default function EquipmentForm({ open, equipment, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const currentUser = useAuthStore((s) => s.user);
  const { data: users = [] } = useUsers();

  useEffect(() => {
    if (open) {
      if (equipment) {
        form.setFieldsValue({
          ...equipment,
          receivedDate: equipment.receivedDate ? dayjs(equipment.receivedDate) : undefined,
        });
      } else {
        form.resetFields();
        form.setFieldValue('status', 'ປົກກະຕິ');
        form.setFieldValue('recordedBy', currentUser?.id);
      }
    }
  }, [open, equipment, form, currentUser]);

  const mutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      const data = {
        ...values,
        receivedDate: values.receivedDate ? (values.receivedDate as dayjs.Dayjs).format('YYYY-MM-DD') : '',
      };
      return equipment
        ? equipmentApi.update(equipment.id, data)
        : equipmentApi.insert(data);
    },
    onSuccess: (res) => {
      if (res.success) { toast.success(equipment ? 'ແກ້ໄຂສຳເລັດ' : 'ເພີ່ມສຳເລັດ'); onSuccess(); }
      else toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  return (
    <Modal
      title={equipment ? 'ແກ້ໄຂອຸປະກອນ' : 'ເພີ່ມອຸປະກອນ'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={mutation.isPending}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
        <Form.Item name="code" label="ລະຫັດອຸປະກອນ" rules={[{ required: true }]}>
          <Input placeholder="IT-001" />
        </Form.Item>
        <Form.Item name="name" label="ຊື່ອຸປະກອນ" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="type" label="ປະເພດ" rules={[{ required: true }]}>
          <Select options={TYPES.map((t) => ({ value: t, label: t }))} />
        </Form.Item>
        <Form.Item name="serialNumber" label="Serial Number">
          <Input />
        </Form.Item>
        <Form.Item name="location" label="ສະຖານທີຕັ້ງ">
          <Input />
        </Form.Item>
        <Form.Item name="status" label="ສະຖານະ" rules={[{ required: true }]}>
          <Select options={STATUSES.map((s) => ({ value: s, label: s }))} />
        </Form.Item>
        <Form.Item name="receivedDate" label="ວັນທີໄດ້ຮັບ">
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="fundSource" label="ທຶນຈັດຊື້">
          <Input.TextArea rows={2} placeholder="ຕົວຢ່າງ: ໂຄງການ JICA 2024 / ຊື້ດ້ວຍງົບປະມານ" />
        </Form.Item>
        <Form.Item name="price" label="ລາຄາ (ກີບ)">
          <InputNumber style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        <Form.Item name="recordedBy" label="ຜູ້ບັນທຶກ">
          <Select options={users.map((u) => ({ value: u.id, label: u.fullName }))} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
