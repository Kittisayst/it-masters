import { useEffect } from 'react';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { workRecordsApi } from '../../services/api';
import { useDepartments, useUsers } from '../../hooks/useReferenceData';
import { useAuthStore } from '../../store/useAuthStore';
import type { WorkRecord } from '../../types';

interface Props {
  open: boolean;
  record: WorkRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

const WORK_TYPES = ['ສ້ອມແປງ', 'ຕິດຕັ້ງ', 'ສະໜັບສະໜູນ', 'ອື່ນໆ'];

export default function WorkRecordForm({ open, record, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const currentUser = useAuthStore((s) => s.user);
  const { data: departments = [] } = useDepartments();
  const { data: users = [] } = useUsers();

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({ ...record, date: dayjs(record.date) });
      } else {
        form.resetFields();
        form.setFieldValue('date', dayjs());
        form.setFieldValue('staffId', currentUser?.id);
        form.setFieldValue('status', 'ຍັງຄ້າງ');
      }
    }
  }, [open, record, form, currentUser]);

  const mutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      const data = { ...values, date: (values.date as dayjs.Dayjs).format('YYYY-MM-DD') };
      return record
        ? workRecordsApi.update(record.id, data)
        : workRecordsApi.insert(data);
    },
    onSuccess: (res) => {
      if (res.success) { toast.success(record ? 'ແກ້ໄຂສຳເລັດ' : 'ເພີ່ມສຳເລັດ'); onSuccess(); }
      else toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  return (
    <Modal
      title={record ? 'ແກ້ໄຂໜ້າວຽກ' : 'ເພີ່ມໜ້າວຽກ'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={mutation.isPending}
      width={560}
    >
      <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
        <Form.Item name="date" label="ວັນທີ" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="staffId" label="ຜູ້ປະຕິບັດ" rules={[{ required: true }]}>
          <Select options={users.map((u) => ({ value: u.id, label: u.fullName }))} />
        </Form.Item>
        <Form.Item name="departmentId" label="ຫ້ອງການ/ພະແນກ (ຜູ້ຂໍຮັບບໍລິການ)">
          <Select allowClear options={departments.map((d) => ({ value: d.id, label: d.name }))} />
        </Form.Item>
        <Form.Item name="location" label="ສະຖານທີ/ຫ້ອງ">
          <Input placeholder="ຕົວຢ່າງ: ຫ້ອງ 301" />
        </Form.Item>
        <Form.Item name="workType" label="ປະເພດວຽກ" rules={[{ required: true }]}>
          <Select options={WORK_TYPES.map((t) => ({ value: t, label: t }))} />
        </Form.Item>
        <Form.Item name="description" label="ລາຍລະອຽດ">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="status" label="ສະຖານະ" rules={[{ required: true }]}>
          <Select options={[{ value: 'ສຳເລັດ', label: 'ສຳເລັດ' }, { value: 'ຍັງຄ້າງ', label: 'ຍັງຄ້າງ' }]} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
