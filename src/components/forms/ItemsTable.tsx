import { Button, Select, Input, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Equipment } from '../../types';

export interface ItemRow {
  equipmentId: string;
  note: string;
}

interface Props {
  value?: ItemRow[];
  onChange?: (rows: ItemRow[]) => void;
  availableEquipment: Equipment[];
  selectedIds?: string[];
}

export default function ItemsTable({ value = [], onChange, availableEquipment, selectedIds = [] }: Props) {
  const add = () => onChange?.([...value, { equipmentId: '', note: '' }]);
  const remove = (idx: number) => onChange?.(value.filter((_, i) => i !== idx));
  const update = (idx: number, field: keyof ItemRow, val: string) => {
    const next = value.map((r, i) => i === idx ? { ...r, [field]: val } : r);
    onChange?.(next);
  };

  const usedIds = new Set([...selectedIds, ...value.map((r) => r.equipmentId).filter(Boolean)]);

  const columns = [
    {
      title: 'ອຸປະກອນ',
      dataIndex: 'equipmentId',
      render: (_: unknown, row: ItemRow, idx: number) => (
        <Select
          style={{ width: '100%' }}
          value={row.equipmentId || undefined}
          placeholder="ເລືອກອຸປະກອນ"
          showSearch
          optionFilterProp="label"
          options={availableEquipment
            .filter((e) => e.id === row.equipmentId || !usedIds.has(e.id))
            .map((e) => ({ value: e.id, label: `${e.code} — ${e.name}` }))}
          onChange={(v) => update(idx, 'equipmentId', v)}
        />
      ),
    },
    {
      title: 'ໝາຍເຫດ',
      dataIndex: 'note',
      render: (_: unknown, row: ItemRow, idx: number) => (
        <Input value={row.note} onChange={(e) => update(idx, 'note', e.target.value)} />
      ),
    },
    {
      title: '',
      width: 48,
      render: (_: unknown, __: ItemRow, idx: number) => (
        <Button danger size="small" icon={<DeleteOutlined />} onClick={() => remove(idx)} />
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={value}
        rowKey={(_, i) => String(i)}
        pagination={false}
        size="small"
        footer={() => (
          <Button type="dashed" icon={<PlusOutlined />} onClick={add} block>
            ເພີ່ມລາຍການ
          </Button>
        )}
      />
    </div>
  );
}
