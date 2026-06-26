import axios from 'axios';
import type { ApiResponse, Category, Department, Employee, Equipment, ItInfo, User, WorkRecord, BorrowingHeader, BorrowingDetail, DisbursementHeader, DisbursementDetail, DashboardStats } from '../types';

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string;

// Apps Script doesn't respond to CORS preflight (OPTIONS).
// Sending as text/plain makes it a "simple request" — no preflight triggered.
export async function callApi<T = unknown>(
  action: string,
  method: string,
  params: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
  const res = await axios.post<ApiResponse<T>>(
    APPS_SCRIPT_URL,
    JSON.stringify({ action, method, params }),
    { headers: { 'Content-Type': 'text/plain' } }
  );
  return res.data;
}

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    callApi('auth', 'login', { username, password }),
  changePassword: (username: string, oldPassword: string, newPassword: string) =>
    callApi('auth', 'changePassword', { username, oldPassword, newPassword }),
};

// Settings
export const categoriesApi = {
  findAll: () => callApi<Category[]>('categories', 'findAll'),
  insert: (data: Record<string, unknown>) => callApi<Category>('categories', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi<Category>('categories', 'update', { id, data }),
  delete: (id: string) => callApi('categories', 'delete', { id }),
};

export const usersApi = {
  findAll: () => callApi<User[]>('users', 'findAll'),
  insert: (data: Record<string, unknown>) => callApi<User>('users', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi<User>('users', 'update', { id, data }),
  delete: (id: string) => callApi('users', 'delete', { id }),
};

export const departmentsApi = {
  findAll: () => callApi<Department[]>('departments', 'findAll'),
  insert: (data: Record<string, unknown>) => callApi<Department>('departments', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi<Department>('departments', 'update', { id, data }),
  delete: (id: string) => callApi('departments', 'delete', { id }),
};

export const employeesApi = {
  findAll: () => callApi<Employee[]>('employees', 'findAll'),
  insert: (data: Record<string, unknown>) => callApi<Employee>('employees', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi<Employee>('employees', 'update', { id, data }),
  delete: (id: string) => callApi('employees', 'delete', { id }),
};

// WorkRecords
export const workRecordsApi = {
  findAll: () => callApi<WorkRecord[]>('workRecords', 'findAll'),
  find: (params: Record<string, unknown>) => callApi<WorkRecord[]>('workRecords', 'find', params),
  insert: (data: Record<string, unknown>) => callApi<WorkRecord>('workRecords', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi<WorkRecord>('workRecords', 'update', { id, data }),
  delete: (id: string) => callApi('workRecords', 'delete', { id }),
};

// Equipment
export const equipmentApi = {
  findAll: () => callApi<Equipment[]>('equipment', 'findAll'),
  find: (params: Record<string, unknown>) => callApi<Equipment[]>('equipment', 'find', params),
  insert: (data: Record<string, unknown>) => callApi<Equipment>('equipment', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi<Equipment>('equipment', 'update', { id, data }),
  delete: (id: string) => callApi('equipment', 'delete', { id }),
  stats: () => callApi('equipment', 'stats'),
};

// Borrowing
export const borrowingApi = {
  findAll: () => callApi<BorrowingHeader[]>('borrowing', 'findAll'),
  find: (params: Record<string, unknown>) => callApi<BorrowingHeader[]>('borrowing', 'find', params),
  findById: (id: string) => callApi<BorrowingDetail>('borrowing', 'findById', { id }), // returns { header, items }
  insert: (header: Record<string, unknown>, items: Record<string, unknown>[]) =>
    callApi('borrowing', 'insert', { header, items }),
  update: (id: string, data: Record<string, unknown>) => callApi('borrowing', 'update', { id, data }),
  return: (id: string, returnDate?: string) => callApi('borrowing', 'return', { id, returnDate }),
  delete: (id: string) => callApi('borrowing', 'delete', { id }),
  stats: () => callApi('borrowing', 'stats'),
};

// Disbursement
export const disbursementApi = {
  findAll: () => callApi<DisbursementHeader[]>('disbursement', 'findAll'),
  find: (params: Record<string, unknown>) => callApi<DisbursementHeader[]>('disbursement', 'find', params),
  findById: (id: string) => callApi<DisbursementDetail>('disbursement', 'findById', { id }),
  insert: (header: Record<string, unknown>, items: Record<string, unknown>[]) =>
    callApi('disbursement', 'insert', { header, items }),
  delete: (id: string) => callApi('disbursement', 'delete', { id }),
};

// IT Info Registry
export const itInfoApi = {
  findAll: () => callApi<ItInfo[]>('itInfo', 'findAll'),
  find: (params: Record<string, unknown>) => callApi<ItInfo[]>('itInfo', 'find', params),
  insert: (data: Record<string, unknown>) => callApi<ItInfo>('itInfo', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi<ItInfo>('itInfo', 'update', { id, data }),
  delete: (id: string) => callApi('itInfo', 'delete', { id }),
};

// Dashboard
export const dashboardApi = {
  stats: () => callApi<DashboardStats>('dashboard', 'stats'),
  recentWorkRecords: (limit = 10) => callApi<WorkRecord[]>('dashboard', 'recentWorkRecords', { limit }),
  overdueBorrowing: () => callApi<BorrowingHeader[]>('dashboard', 'overdueBorrowing'),
};
