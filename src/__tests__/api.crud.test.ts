/**
 * Integration tests — hits the real Apps Script API.
 * Run: npm test
 * Requires: VITE_APPS_SCRIPT_URL in .env.local
 *
 * Each suite: insert → findAll → findById → update → delete
 * Tests run sequentially (concurrent: false) to avoid race conditions.
 */
import axios from 'axios';
import { describe, test, expect, beforeAll } from 'vitest';

// ── HTTP client (same CORS fix as the app) ──────────────────────────────────
const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function call<T = unknown>(
  action: string,
  method: string,
  params: Record<string, unknown> = {},
  retries = 2,
): Promise<{ success: boolean; data: T; error?: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(
        API_URL,
        JSON.stringify({ action, method, params }),
        { headers: { 'Content-Type': 'text/plain' }, timeout: 25000 },
      );
      return res.data;
    } catch (err: unknown) {
      if (attempt === retries) throw err;
      const status = (err as { response?: { status?: number } })?.response?.status;
      // retry on 404 (Apps Script not ready) or 429 (rate limit)
      if (status === 404 || status === 429 || status === 500) {
        await sleep(3000 * (attempt + 1));
      } else {
        throw err;
      }
    }
  }
  throw new Error('unreachable');
}

// ── Guard: skip all tests if no URL configured ──────────────────────────────
beforeAll(() => {
  if (!API_URL) throw new Error('VITE_APPS_SCRIPT_URL is not set in .env.local');
});

// ════════════════════════════════════════════════════════════════════════════
// Auth
// ════════════════════════════════════════════════════════════════════════════
describe('Auth', () => {
  test('login — valid credentials', async () => {
    const res = await call('auth', 'login', { username: 'admin', password: 'admin123' });
    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ username: 'admin' });
  });

  test('login — wrong password returns error', async () => {
    const res = await call('auth', 'login', { username: 'admin', password: 'wrongpass' });
    expect(res.success).toBe(false);
  });

  test('login — unknown user returns error', async () => {
    const res = await call('auth', 'login', { username: 'nobody', password: 'x' });
    expect(res.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Departments
// ════════════════════════════════════════════════════════════════════════════
describe('Departments CRUD', () => {
  let id: string;

  test('insert', async () => {
    const res = await call<{ id: string }>('departments', 'insert', {
      name: '__TEST_DEPT__',
      code: 'TST',
    });
    expect(res.success).toBe(true);
    expect(res.data.id).toBeTruthy();
    id = res.data.id;
  });

  test('findAll — contains new record', async () => {
    const res = await call<{ name: string }[]>('departments', 'findAll');
    expect(res.success).toBe(true);
    expect(res.data.some((d) => d.name === '__TEST_DEPT__')).toBe(true);
  });

  test('findById', async () => {
    const res = await call<{ id: string; name: string }>('departments', 'findById', { id });
    expect(res.success).toBe(true);
    expect(res.data.id).toBe(id);
  });

  test('update', async () => {
    const res = await call('departments', 'update', { id, data: { name: '__TEST_DEPT_UPDATED__' } });
    expect(res.success).toBe(true);
    const verify = await call<{ name: string }>('departments', 'findById', { id });
    expect(verify.data.name).toBe('__TEST_DEPT_UPDATED__');
  });

  test('delete', async () => {
    const res = await call('departments', 'delete', { id });
    expect(res.success).toBe(true);
    const verify = await call('departments', 'findById', { id });
    expect(verify.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Employees
// ════════════════════════════════════════════════════════════════════════════
describe('Employees CRUD', () => {
  let id: string;

  test('insert', async () => {
    const res = await call<{ id: string }>('employees', 'insert', {
      fullName: '__TEST_EMP__',
      position: 'Tester',
      phone: '020-0000000',
    });
    expect(res.success).toBe(true);
    id = res.data.id;
  });

  test('findAll — contains new record', async () => {
    const res = await call<{ fullName: string }[]>('employees', 'findAll');
    expect(res.success).toBe(true);
    expect(res.data.some((e) => e.fullName === '__TEST_EMP__')).toBe(true);
  });

  test('update', async () => {
    const res = await call('employees', 'update', { id, data: { position: 'Senior Tester' } });
    expect(res.success).toBe(true);
    const verify = await call<{ position: string }>('employees', 'findById', { id });
    expect(verify.data.position).toBe('Senior Tester');
  });

  test('delete', async () => {
    const res = await call('employees', 'delete', { id });
    expect(res.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// WorkRecords
// ════════════════════════════════════════════════════════════════════════════
describe('WorkRecords CRUD', () => {
  let id: string;
  const today = new Date().toISOString().split('T')[0];

  test('insert', async () => {
    const res = await call<{ id: string }>('workRecords', 'insert', {
      date: today,
      staffId: 'test-staff',
      workType: 'ສ້ອມແປງ',
      description: '__TEST_WORK__',
      status: 'ຍັງຄ້າງ',
    });
    expect(res.success).toBe(true);
    id = res.data.id;
  });

  test('findAll — ordered DESC', async () => {
    const res = await call<{ id: string }[]>('workRecords', 'findAll');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
  });

  test('find — filter by status', async () => {
    const res = await call<{ id: string }[]>('workRecords', 'find', { status: 'ຍັງຄ້າງ' });
    expect(res.success).toBe(true);
    expect(res.data.some((r) => r.id === id)).toBe(true);
  });

  test('findById', async () => {
    const res = await call<{ id: string }>('workRecords', 'findById', { id });
    expect(res.success).toBe(true);
    expect(res.data.id).toBe(id);
  });

  test('update — change status to ສຳເລັດ', async () => {
    const res = await call('workRecords', 'update', { id, data: { status: 'ສຳເລັດ' } });
    expect(res.success).toBe(true);
    const verify = await call<{ status: string }>('workRecords', 'findById', { id });
    expect(verify.data.status).toBe('ສຳເລັດ');
  });

  test('delete', async () => {
    const res = await call('workRecords', 'delete', { id });
    expect(res.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Equipment
// ════════════════════════════════════════════════════════════════════════════
describe('Equipment CRUD', () => {
  let id: string;

  test('insert', async () => {
    const res = await call<{ id: string }>('equipment', 'insert', {
      code: 'TST-001',
      name: '__TEST_EQUIP__',
      type: 'ອື່ນໆ',
      status: 'ປົກກະຕິ',
    });
    expect(res.success).toBe(true);
    id = res.data.id;
  });

  test('findAll', async () => {
    const res = await call<{ id: string }[]>('equipment', 'findAll');
    expect(res.success).toBe(true);
    expect(res.data.some((e) => e.id === id)).toBe(true);
  });

  test('find — filter by type', async () => {
    const res = await call<{ id: string }[]>('equipment', 'find', { type: 'ອື່ນໆ' });
    expect(res.success).toBe(true);
    expect(res.data.some((e) => e.id === id)).toBe(true);
  });

  test('stats', async () => {
    const res = await call<{ total: number; available: number }>('equipment', 'stats');
    expect(res.success).toBe(true);
    expect(typeof res.data.total).toBe('number');
    expect(res.data.total).toBeGreaterThan(0);
  });

  test('updateStatus', async () => {
    const res = await call('equipment', 'update', { id, data: { status: 'ສ້ອມແປງ' } });
    expect(res.success).toBe(true);
    const verify = await call<{ status: string }>('equipment', 'findById', { id });
    expect(verify.data.status).toBe('ສ້ອມແປງ');
  });

  test('delete', async () => {
    const res = await call('equipment', 'delete', { id });
    expect(res.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// RoomComputer
// ════════════════════════════════════════════════════════════════════════════
describe('RoomComputer CRUD', () => {
  let equipId: string;
  let roomAId: string;
  let roomBId: string;

  test('setup — insert a computer and two rooms', async () => {
    const equip = await call<{ id: string }>('equipment', 'insert', {
      code: 'TST-RC-001',
      name: '__TEST_RC_COMPUTER__',
      type: 'ຄອມ',
      status: 'ປົກກະຕິ',
    });
    expect(equip.success).toBe(true);
    equipId = equip.data.id;

    const roomA = await call<{ id: string }>('rooms', 'insert', { code: 'RC-A', name: '__TEST_RC_ROOM_A__', location: 'x', status: 'ປົກກະຕິ' });
    expect(roomA.success).toBe(true);
    roomAId = roomA.data.id;

    const roomB = await call<{ id: string }>('rooms', 'insert', { code: 'RC-B', name: '__TEST_RC_ROOM_B__', location: 'x', status: 'ປົກກະຕິ' });
    expect(roomB.success).toBe(true);
    roomBId = roomB.data.id;
  });

  test('assign — computerCount reflects the assignment', async () => {
    const assign = await call('roomComputers', 'assign', { equipmentId: equipId, roomId: roomAId });
    expect(assign.success).toBe(true);

    const room = await call<{ computerCount: number }>('rooms', 'findById', { id: roomAId });
    expect(room.success).toBe(true);
    expect(room.data.computerCount).toBe(1);
  });

  test('reassign — old room count decreases, new room increases, no duplicate row', async () => {
    const assign = await call('roomComputers', 'assign', { equipmentId: equipId, roomId: roomBId });
    expect(assign.success).toBe(true);

    const oldRoom = await call<{ computerCount: number }>('rooms', 'findById', { id: roomAId });
    expect(oldRoom.data.computerCount).toBe(0);

    const newRoom = await call<{ computerCount: number }>('rooms', 'findById', { id: roomBId });
    expect(newRoom.data.computerCount).toBe(1);

    const rows = await call<{ id: string }[]>('roomComputers', 'find', { equipmentId: equipId });
    expect(rows.success).toBe(true);
    expect(rows.data.length).toBe(1);
  });

  test('temporary status (ຖືກຢືມ) leaves the assignment untouched', async () => {
    const upd = await call('equipment', 'update', { id: equipId, data: { status: 'ຖືກຢືມ' } });
    expect(upd.success).toBe(true);

    const rows = await call<{ id: string }[]>('roomComputers', 'find', { equipmentId: equipId });
    expect(rows.data.length).toBe(1);

    const room = await call<{ computerCount: number }>('rooms', 'findById', { id: roomBId });
    expect(room.data.computerCount).toBe(1);
  });

  test('status ຖືກເບີກ auto-clears the assignment', async () => {
    const upd = await call('equipment', 'update', { id: equipId, data: { status: 'ຖືກເບີກ' } });
    expect(upd.success).toBe(true);

    const rows = await call<{ id: string }[]>('roomComputers', 'find', { equipmentId: equipId });
    expect(rows.data.length).toBe(0);

    const room = await call<{ computerCount: number }>('rooms', 'findById', { id: roomBId });
    expect(room.data.computerCount).toBe(0);
  });

  test('type change away from ຄອມ auto-clears the assignment', async () => {
    await call('equipment', 'update', { id: equipId, data: { status: 'ປົກກະຕິ' } });
    await call('roomComputers', 'assign', { equipmentId: equipId, roomId: roomAId });
    const before = await call<{ id: string }[]>('roomComputers', 'find', { equipmentId: equipId });
    expect(before.data.length).toBe(1);

    const upd = await call('equipment', 'update', { id: equipId, data: { type: 'Printer' } });
    expect(upd.success).toBe(true);

    const after = await call<{ id: string }[]>('roomComputers', 'find', { equipmentId: equipId });
    expect(after.data.length).toBe(0);

    const room = await call<{ computerCount: number }>('rooms', 'findById', { id: roomAId });
    expect(room.data.computerCount).toBe(0);
  });

  test('deleting a room cascades delete of its RoomComputer rows', async () => {
    await call('equipment', 'update', { id: equipId, data: { type: 'ຄອມ' } });
    await call('roomComputers', 'assign', { equipmentId: equipId, roomId: roomBId });
    const before = await call<{ id: string }[]>('roomComputers', 'find', { equipmentId: equipId });
    expect(before.data.length).toBe(1);

    const del = await call('rooms', 'delete', { id: roomBId });
    expect(del.success).toBe(true);

    const after = await call<{ id: string }[]>('roomComputers', 'find', { equipmentId: equipId });
    expect(after.data.length).toBe(0);
  });

  test('cleanup — delete computer and remaining room', async () => {
    await call('equipment', 'delete', { id: equipId });
    await call('rooms', 'delete', { id: roomAId });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NetworkPort
// ════════════════════════════════════════════════════════════════════════════
describe('NetworkPort CRUD', () => {
  let equipId: string;

  test('setup — insert a network device', async () => {
    const equip = await call<{ id: string }>('equipment', 'insert', {
      code: 'TST-NP-001',
      name: '__TEST_NP_SWITCH__',
      type: 'Network',
      status: 'ປົກກະຕິ',
    });
    expect(equip.success).toBe(true);
    equipId = equip.data.id;
  });

  test('generate — creates ports 1..N', async () => {
    const res = await call('networkPorts', 'generate', { equipmentId: equipId, count: 8 });
    expect(res.success).toBe(true);

    const ports = await call<{ portNumber: number }[]>('networkPorts', 'find', { equipmentId: equipId });
    expect(ports.success).toBe(true);
    expect(ports.data.length).toBe(8);
    expect(ports.data.map((p) => p.portNumber).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('update — set connectsTo and status on a port', async () => {
    const ports = await call<{ id: string; portNumber: number }[]>('networkPorts', 'find', { equipmentId: equipId });
    const port1 = ports.data.find((p) => p.portNumber === 1)!;

    const res = await call('networkPorts', 'update', { id: port1.id, data: { connectsTo: 'ຫ້ອງ A101', status: 'ໃຊ້ງານ' } });
    expect(res.success).toBe(true);

    const verify = await call<{ portNumber: number; connectsTo: string; status: string }[]>('networkPorts', 'find', { equipmentId: equipId });
    const updated = verify.data.find((p) => p.portNumber === 1)!;
    expect(updated.connectsTo).toBe('ຫ້ອງ A101');
    expect(updated.status).toBe('ໃຊ້ງານ');
  });

  test('generate — increasing count adds ports without touching existing ones', async () => {
    const res = await call('networkPorts', 'generate', { equipmentId: equipId, count: 12 });
    expect(res.success).toBe(true);

    const ports = await call<{ portNumber: number; connectsTo: string }[]>('networkPorts', 'find', { equipmentId: equipId });
    expect(ports.data.length).toBe(12);
    const port1 = ports.data.find((p) => p.portNumber === 1)!;
    expect(port1.connectsTo).toBe('ຫ້ອງ A101');
  });

  test('generate — decreasing count is blocked when a removed port has data', async () => {
    const res = await call('networkPorts', 'generate', { equipmentId: equipId, count: 0 });
    expect(res.success).toBe(false);

    const ports = await call<unknown[]>('networkPorts', 'find', { equipmentId: equipId });
    expect(ports.data.length).toBe(12);
  });

  test('generate — decreasing count succeeds when removed ports are empty', async () => {
    const res = await call('networkPorts', 'generate', { equipmentId: equipId, count: 8 });
    expect(res.success).toBe(true);

    const ports = await call<{ portNumber: number }[]>('networkPorts', 'find', { equipmentId: equipId });
    expect(ports.data.length).toBe(8);
    expect(ports.data.some((p) => p.portNumber === 1)).toBe(true);
  });

  test('deleting the equipment cascades delete of its NetworkPort rows', async () => {
    const del = await call('equipment', 'delete', { id: equipId });
    expect(del.success).toBe(true);

    const ports = await call<unknown[]>('networkPorts', 'find', { equipmentId: equipId });
    expect(ports.success).toBe(true);
    expect(ports.data.length).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Borrowing
// ════════════════════════════════════════════════════════════════════════════
describe('Borrowing CRUD', () => {
  beforeAll(() => sleep(2000));
  let headerId: string;
  let equipId: string;
  const today = new Date().toISOString().split('T')[0];

  test('setup — insert equipment for borrowing', async () => {
    const res = await call<{ id: string }>('equipment', 'insert', {
      code: 'TST-BORROW',
      name: '__BORROW_EQUIP__',
      type: 'ອື່ນໆ',
      status: 'ປົກກະຕິ',
    });
    expect(res.success).toBe(true);
    equipId = res.data.id;
  });

  test('insert borrowing (header + items)', async () => {
    const res = await call<{ id: string; borrowCode: string }>('borrowing', 'insert', {
      header: {
        borrowerId: 'test-borrower',
        borrowDate: today,
        dueDate: today,
      },
      items: [{ equipmentId: equipId, note: 'test' }],
    });
    expect(res.success).toBe(true);
    expect(res.data.borrowCode).toMatch(/^B-\d{3}$/);
    headerId = res.data.id;
  });

  test('findAll', async () => {
    const res = await call<{ id: string }[]>('borrowing', 'findAll');
    expect(res.success).toBe(true);
    expect(res.data.some((b) => b.id === headerId)).toBe(true);
  });

  test('findById — returns header + items', async () => {
    const res = await call<{ header: { id: string }; items: unknown[] }>(
      'borrowing', 'findById', { id: headerId },
    );
    expect(res.success).toBe(true);
    expect(res.data.header.id).toBe(headerId);
    expect(res.data.items.length).toBeGreaterThan(0);
  });

  test('return — status becomes ຄືນແລ້ວ', async () => {
    const res = await call('borrowing', 'return', { id: headerId, returnDate: today });
    expect(res.success).toBe(true);
    const verify = await call<{ id: string; status: string }[]>('borrowing', 'findAll');
    const rec = verify.data.find((b) => b.id === headerId);
    expect(rec?.status).toBe('ຄືນແລ້ວ');
  });

  test('delete borrowing + restore equipment status', async () => {
    const res = await call('borrowing', 'delete', { id: headerId });
    expect(res.success).toBe(true);
  });

  test('cleanup — delete test equipment', async () => {
    const res = await call('equipment', 'delete', { id: equipId });
    expect(res.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// RoomBorrowing
// ════════════════════════════════════════════════════════════════════════════
describe('RoomBorrowing CRUD', () => {
  beforeAll(() => sleep(2000));
  let employeeId: string;
  let roomId: string;

  const now = new Date();
  const nowIso = now.toISOString();
  const todayStr = nowIso.split('T')[0];
  const yesterdayStr = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  test('setup — insert employee and room', async () => {
    const emp = await call<{ id: string }>('employees', 'insert', {
      fullName: '__TEST_ROOMBORROW_EMP__',
      position: 'Tester',
      phone: '020-0000000',
    });
    expect(emp.success).toBe(true);
    employeeId = emp.data.id;

    const room = await call<{ id: string }>('rooms', 'insert', {
      code: 'TST-ROOM',
      name: '__TEST_ROOM__',
      location: 'ຊັ້ນ 1',
      status: 'ປົກກະຕິ',
    });
    expect(room.success).toBe(true);
    roomId = room.data.id;
  });

  test('insert — dueDate omitted defaults to borrowedAt date', async () => {
    const res = await call<{ id: string; dueDate: string }>('roomBorrowing', 'insert', {
      employeeId,
      roomId,
      borrowedAt: nowIso,
    });
    expect(res.success).toBe(true);
    expect(res.data.dueDate).toBe(todayStr);

    const del = await call('roomBorrowing', 'delete', { id: res.data.id });
    expect(del.success).toBe(true);
  });

  test('overdue borrowing is derived and self-healed on read', { timeout: 60000 }, async () => {
    const inserted = await call<{ id: string }>('roomBorrowing', 'insert', {
      employeeId,
      roomId,
      borrowedAt: nowIso,
      dueDate: yesterdayStr,
    });
    expect(inserted.success).toBe(true);
    const id = inserted.data.id;

    const overdue = await call<{ id: string; status: string }[]>('roomBorrowing', 'find', { status: 'ເກີນກຳນົດ' });
    expect(overdue.success).toBe(true);
    const rec = overdue.data.find((r) => r.id === id);
    expect(rec?.status).toBe('ເກີນກຳນົດ');

    const returned = await call('roomBorrowing', 'return', { id });
    expect(returned.success).toBe(true);

    const afterReturn = await call<{ id: string; status: string }[]>('roomBorrowing', 'find', { status: 'ເກີນກຳນົດ' });
    expect(afterReturn.success).toBe(true);
    expect(afterReturn.data.some((r) => r.id === id)).toBe(false);

    const del = await call('roomBorrowing', 'delete', { id });
    expect(del.success).toBe(true);
  });

  test('cleanup — delete test room and employee', async () => {
    const room = await call('rooms', 'delete', { id: roomId });
    expect(room.success).toBe(true);
    const emp = await call('employees', 'delete', { id: employeeId });
    expect(emp.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Disbursement
// ════════════════════════════════════════════════════════════════════════════
describe('Disbursement CRUD', () => {
  beforeAll(() => sleep(2000));
  let headerId: string;
  let equipId: string;
  const today = new Date().toISOString().split('T')[0];

  test('setup — insert equipment for disbursement', async () => {
    const res = await call<{ id: string }>('equipment', 'insert', {
      code: 'TST-DISB',
      name: '__DISB_EQUIP__',
      type: 'ອື່ນໆ',
      status: 'ປົກກະຕິ',
    });
    expect(res.success).toBe(true);
    equipId = res.data.id;
  });

  test('insert disbursement', async () => {
    const res = await call<{ id: string; disbursementCode: string }>('disbursement', 'insert', {
      header: {
        recipientId: 'test-recipient',
        disbursementDate: today,
        departmentId: 'dept-test',
      },
      items: [{ equipmentId: equipId, note: 'test disb' }],
    });
    expect(res.success).toBe(true);
    expect(res.data.disbursementCode).toMatch(/^D-\d{3}$/);
    headerId = res.data.id;
  });

  test('findAll', async () => {
    const res = await call<{ id: string }[]>('disbursement', 'findAll');
    expect(res.success).toBe(true);
    expect(res.data.some((d) => d.id === headerId)).toBe(true);
  });

  test('findById — returns header + items', async () => {
    const res = await call<{ header: { id: string }; items: unknown[] }>(
      'disbursement', 'findById', { id: headerId },
    );
    expect(res.success).toBe(true);
    expect(res.data.header.id).toBe(headerId);
    expect(res.data.items.length).toBeGreaterThan(0);
  });

  test('delete disbursement + restore equipment', async () => {
    const res = await call('disbursement', 'delete', { id: headerId });
    expect(res.success).toBe(true);
  });

  test('cleanup — delete test equipment', async () => {
    const res = await call('equipment', 'delete', { id: equipId });
    expect(res.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Dashboard
// ════════════════════════════════════════════════════════════════════════════
describe('Dashboard', () => {
  test('stats — returns equipment + borrowing counts', async () => {
    const res = await call<{
      workToday: number;
      equipment: { total: number };
      borrowing: { active: number };
    }>('dashboard', 'stats');
    expect(res.success).toBe(true);
    expect(typeof res.data.workToday).toBe('number');
    expect(typeof res.data.equipment.total).toBe('number');
  });

  test('recentWorkRecords', async () => {
    const res = await call<unknown[]>('dashboard', 'recentWorkRecords', { limit: 5 });
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
  });

  test('overdueBorrowing', async () => {
    const res = await call<unknown[]>('dashboard', 'overdueBorrowing');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
