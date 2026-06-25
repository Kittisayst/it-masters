import { Tag } from 'antd';

const statusColors: Record<string, string> = {
  // WorkRecord
  'ສຳເລັດ': 'success',
  'ຍັງຄ້າງ': 'warning',
  // Equipment
  'ປົກກະຕິ': 'success',
  'ສ້ອມແປງ': 'orange',
  'ປົດລຶບ': 'default',
  'ຖືກຢືມ': 'processing',
  'ຖືກເບີກ': 'purple',
  // Borrowing
  'ກຳລັງຢືມ': 'processing',
  'ຄືນແລ້ວ': 'success',
  'ເກີນກຳນົດ': 'error',
};

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  return <Tag color={statusColors[status] ?? 'default'}>{status}</Tag>;
}
