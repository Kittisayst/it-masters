export interface User {
  id: string;
  username: string;
  fullName: string;
  position: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  fullName: string;
  position: string;
  departmentId: string;
  phone: string;
}

export interface WorkType {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkRecord {
  id: string;
  date: string;
  staffIds: string;
  departmentId: string;
  location: string;
  workType: string;
  description: string;
  status: 'ຍັງຄ້າງ' | 'ກຳລັງດຳເນີນ' | 'ລໍຖ້າ' | 'ສຳເລັດ' | 'ຍົກເລີກ';
  createdAt?: string;
  updatedAt?: string;
}

export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  categoryId?: string;
  serialNumber: string;
  location: string;
  status: 'ປົກກະຕິ' | 'ສ້ອມແປງ' | 'ປົດລຶບ' | 'ຖືກຢືມ' | 'ຖືກເບີກ';
  receivedDate: string;
  fundSource: string;
  price: number;
  recordedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BorrowingHeader {
  id: string;
  borrowCode: string;
  borrowerId: string;
  departmentId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  approvedBy: string;
  note: string;
  status: 'ກຳລັງຢືມ' | 'ຄືນແລ້ວ' | 'ເກີນກຳນົດ';
  createdAt?: string;
  updatedAt?: string;
  equipmentList?: Equipment[];
}

export interface BorrowingItem {
  id: string;
  borrowingId: string;
  equipmentId: string;
  note: string;
}

export interface BorrowingDetail {
  header: BorrowingHeader;
  items: BorrowingItem[];
}

export interface DisbursementHeader {
  id: string;
  disbursementCode: string;
  recipientId: string;
  departmentId: string;
  disbursementDate: string;
  approvedBy: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface DisbursementItem {
  id: string;
  disbursementId: string;
  equipmentId: string;
  note: string;
}

export interface DisbursementDetail {
  header: DisbursementHeader;
  items: DisbursementItem[];
}

export interface Room {
  id: string;
  code: string;
  name: string;
  location: string;
  computerCount?: number;
  responsiblePerson?: string;
  status: 'ປົກກະຕິ' | 'ຖືກຢືມ';
}

export interface RoomBorrowing {
  id: string;
  employeeId: string;
  roomId: string;
  borrowedAt: string;
  dueDate?: string;
  returnedAt?: string;
  recordedBy: string;
  purpose?: string;
  status: 'ກຳລັງຢືມ' | 'ສົ່ງແລ້ວ' | 'ເກີນກຳນົດ';
  room?: Room | null;
  employee?: Employee | null;
}

export interface DashboardStats {
  workToday: number;
  equipment: {
    total: number;
    available: number;
    borrowed: number;
    repair: number;
    disbursed: number;
  };
  borrowing: {
    active: number;
    overdue: number;
  };
}

export interface ItInfo {
  id: string;
  category: 'wifi' | 'camera' | 'printer' | 'account' | 'server' | 'other';
  name: string;
  location?: string;
  ipAddress?: string;
  macAddress?: string;
  username?: string;
  password?: string;
  brand?: string;
  model?: string;
  url?: string;
  notes?: string;
  status: 'ໃຊ້ງານ' | 'ບໍ່ໃຊ້ງານ';
  recordedBy: string;
  updatedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  type?: string;
}
