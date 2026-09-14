import { useEffect } from 'react';
import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { equipmentApi, roomComputersApi } from '../../services/api';
import { useUsers, useCategories, useRooms } from '../../hooks/useReferenceData';
import { useAuthStore } from '../../store/useAuthStore';
import NetworkPortsSection from './NetworkPortsSection';
import type { Equipment, RoomComputer } from '../../types';

interface Props {
  open: boolean;
  equipment: Equipment | null;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: string;
}

const TYPES = ['ຄອມ', 'Printer', 'Projector', 'Network', 'ອື່ນໆ'];
const STATUSES = ['ປົກກະຕິ', 'ສ້ອມແປງ', 'ປົດລຶບ'];

export default function EquipmentForm({ open, equipment, onClose, onSuccess, defaultType }: Props) {
  const [form] = Form.useForm();
  const currentUser = useAuthStore((s) => s.user);
  const { data: users = [] } = useUsers();
  const { data: categories = [] } = useCategories();
  const { data: rooms = [] } = useRooms();
  const type = Form.useWatch('type', form);

  const { data: assignment } = useQuery({
    queryKey: ['roomComputers', 'equipment', equipment?.id],
    queryFn: async () => {
      const res = await roomComputersApi.find({ equipmentId: equipment!.id });
      return ((res.data as RoomComputer[]) ?? [])[0] ?? null;
    },
    enabled: open && !!equipment,
  });

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
        if (defaultType) form.setFieldValue('type', defaultType);
      }
    }
  }, [open, equipment, form, currentUser, defaultType]);

  useEffect(() => {
    if (open && equipment) {
      form.setFieldValue('roomId', assignment?.roomId);
    }
  }, [open, equipment, assignment, form]);

  const mutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { roomId, ...equipmentValues } = values;
      const data = {
        ...equipmentValues,
        receivedDate: values.receivedDate ? (values.receivedDate as dayjs.Dayjs).format('YYYY-MM-DD') : '',
      };
      const res = equipment
        ? await equipmentApi.update(equipment.id, data)
        : await equipmentApi.insert(data);
      if (!res.success) return res;

      const equipmentId = equipment ? equipment.id : (res.data as Equipment).id;
      if (roomId) {
        await roomComputersApi.assign({ equipmentId, roomId, recordedBy: currentUser?.id ?? '' });
      } else if (equipment) {
        await roomComputersApi.unassign(equipmentId);
      }
      return res;
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
          <Select
            options={TYPES.map((t) => ({ value: t, label: t }))}
            onChange={(v: string) => {
              if (v !== 'ຄອມ') form.setFieldValue('roomId', undefined);
            }}
          />
        </Form.Item>
        {type === 'ຄອມ' && (
          <Form.Item name="roomId" label="ຫ້ອງຄອມ">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="ເລືອກຫ້ອງ (ຖ້າມີ)"
              options={rooms.map((r) => ({ value: r.id, label: `${r.code} - ${r.name}` }))}
            />
          </Form.Item>
        )}
        {type === 'Network' && (
          equipment
            ? <NetworkPortsSection equipmentId={equipment.id} />
            : <div style={{ marginBottom: 24, color: '#8c8c8c' }}>ບັນທຶກອຸປະກອນກ່ອນ ຈຶ່ງຈະຈັດການ port ໄດ້</div>
        )}
        <Form.Item name="categoryId" label="ໝວດໝູ່">
          <Select
            allowClear
            placeholder="ເລືອກໝວດໝູ່"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
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
