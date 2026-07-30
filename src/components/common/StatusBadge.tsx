import { Tag } from 'antd';

const statusColors: Record<string, string> = {
  // WorkRecord
  'ຍັງຄ້າງ':       'warning',
  'ກຳລັງດຳເນີນ': 'processing',
  'ລໍຖ້າ':         'orange',
  'ສຳເລັດ':        'success',
  'ຍົກເລີກ':       'default',
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
  // Room Borrowing
  'ສົ່ງແລ້ວ': 'success',
};

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  return <Tag color={statusColors[status] ?? 'default'}>{status}</Tag>;
}
