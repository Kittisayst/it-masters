import { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { itInfoApi } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import type { ItInfo } from '../../types';
import { IT_CATEGORIES } from './index';

interface Props {
  open: boolean;
  record: ItInfo | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SHOW_IP  = ['camera', 'printer', 'server', 'other'];
const SHOW_MAC = ['camera', 'printer', 'server', 'other'];
const SHOW_LOC = ['wifi', 'camera', 'printer', 'server', 'other'];
const SHOW_BRAND = ['wifi', 'camera', 'printer', 'server', 'other'];
const SHOW_URL = ['printer', 'account', 'server', 'other'];

export default function ItInfoForm({ open, record, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const currentUser = useAuthStore(s => s.user);

  useEffect(() => {
    if (!open) return;
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'ໃຊ້ງານ', recordedBy: currentUser?.id });
    }
  }, [open, record, form, currentUser]);

  const mutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      record
        ? itInfoApi.update(record.id, values)
        : itInfoApi.insert(values),
    onSuccess: res => {
      if (res.success) {
        toast.success(record ? 'ແກ້ໄຂສຳເລັດ' : 'ເພີ່ມສຳເລັດ');
        onSuccess();
      } else {
        toast.error(res.error ?? 'ບໍ່ສຳເລັດ');
      }
    },
    onError: () => toast.error('ເກີດຂໍ້ຜິດພາດ'),
  });

  return (
    <Modal
      title={record ? 'ແກ້ໄຂຂໍ້ມູນ IT' : 'ເພີ່ມຂໍ້ມູນ IT'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={mutation.isPending}
      width={560}
      destroyOnHide
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={values => mutation.mutate(values as Record<string, unknown>)}
        style={{ marginTop: 16 }}
      >
        {/* Always-visible fields */}
        <Row gutter={12}>
          <Col span={14}>
            <Form.Item name="category" label="ປະເພດ" rules={[{ required: true, message: 'ເລືອກປະເພດ' }]}>
              <Select
                placeholder="ເລືອກປະເພດ"
                options={IT_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                onChange={() => {
                  // clear IP/MAC/URL when switching type to avoid stale data
                  form.setFieldsValue({ ipAddress: '', macAddress: '', url: '' });
                }}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="status" label="ສະຖານະ">
              <Select options={[
                { value: 'ໃຊ້ງານ', label: 'ໃຊ້ງານ' },
                { value: 'ບໍ່ໃຊ້ງານ', label: 'ບໍ່ໃຊ້ງານ' },
              ]} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="name" label="ຊື່ / ລາຍການ" rules={[{ required: true, message: 'ໃສ່ຊື່' }]}>
          <Input placeholder="ເຊັ່ນ: WiFi ຫ້ອງ Admin, Camera ທາງເຂົ້າ, Gmail Admin" />
        </Form.Item>

        {/* Dynamic fields based on category */}
        <Form.Item shouldUpdate={(prev, curr) => prev.category !== curr.category} noStyle>
          {({ getFieldValue }) => {
            const cat = getFieldValue('category') as ItInfo['category'] | undefined;

            return (
              <>
                {/* Location */}
                {cat && SHOW_LOC.includes(cat) && (
                  <Form.Item name="location" label="ສະຖານທີ">
                    <Input placeholder="ເຊັ່ນ: ຫ້ອງ Admin, ອາຄານ A ຊັ້ນ 2" />
                  </Form.Item>
                )}

                {/* IP + MAC */}
                {cat && SHOW_IP.includes(cat) && (
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item name="ipAddress" label="IP Address">
                        <Input placeholder="192.168.1.100" />
                      </Form.Item>
                    </Col>
                    {SHOW_MAC.includes(cat) && (
                      <Col span={12}>
                        <Form.Item name="macAddress" label="MAC Address">
                          <Input placeholder="AA:BB:CC:DD:EE:FF" />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                )}

                {/* Username + Password */}
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      name="username"
                      label={cat === 'wifi' ? 'SSID (ຊື່ WiFi)' : 'Username'}
                    >
                      <Input placeholder={cat === 'wifi' ? 'ຊື່ Network' : 'username'} autoComplete="off" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="password" label="ລະຫັດຜ່ານ">
                      <Input.Password placeholder="password" autoComplete="new-password" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Brand + Model */}
                {cat && SHOW_BRAND.includes(cat) && (
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item name="brand" label="ຍີ່ຫໍ້">
                        <Input placeholder="TP-Link, Hikvision, HP..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="model" label="ລຸ່ນ">
                        <Input placeholder="TL-WR841N, DS-2CD..." />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {/* URL */}
                {cat && SHOW_URL.includes(cat) && (
                  <Form.Item name="url" label="URL / ທີ່ຢູ່ເຂົ້າໃຊ້">
                    <Input placeholder="http://192.168.1.1  ຫຼື  https://example.com" />
                  </Form.Item>
                )}
              </>
            );
          }}
        </Form.Item>

        <Form.Item name="notes" label="ຫມາຍເຫດ">
          <Input.TextArea rows={2} placeholder="ຂໍ້ມູນເພີ່ມຕື່ມ..." />
        </Form.Item>

        {/* Hidden field */}
        <Form.Item name="recordedBy" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
