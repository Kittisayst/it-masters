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

async function call<T = unknown>(
  action: string,
  method: string,
  params: Record<string, unknown> = {},
): Promise<{ success: boolean; data: T; error?: string }> {
  const res = await axios.post(
    API_URL,
    JSON.stringify({ action, method, params }),
    { headers: { 'Content-Type': 'text/plain' } },
  );
  return res.data;
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
// Borrowing
// ════════════════════════════════════════════════════════════════════════════
describe('Borrowing CRUD', () => {
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
// Disbursement
// ════════════════════════════════════════════════════════════════════════════
describe('Disbursement CRUD', () => {
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
