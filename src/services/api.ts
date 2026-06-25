import axios from 'axios';
import type { ApiResponse } from '../types';

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
export const usersApi = {
  findAll: () => callApi('users', 'findAll'),
  insert: (data: Record<string, unknown>) => callApi('users', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi('users', 'update', { id, data }),
  delete: (id: string) => callApi('users', 'delete', { id }),
};

export const departmentsApi = {
  findAll: () => callApi('departments', 'findAll'),
  insert: (data: Record<string, unknown>) => callApi('departments', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi('departments', 'update', { id, data }),
  delete: (id: string) => callApi('departments', 'delete', { id }),
};

export const employeesApi = {
  findAll: () => callApi('employees', 'findAll'),
  insert: (data: Record<string, unknown>) => callApi('employees', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi('employees', 'update', { id, data }),
  delete: (id: string) => callApi('employees', 'delete', { id }),
};

// WorkRecords
export const workRecordsApi = {
  findAll: () => callApi('workRecords', 'findAll'),
  find: (params: Record<string, unknown>) => callApi('workRecords', 'find', params),
  insert: (data: Record<string, unknown>) => callApi('workRecords', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi('workRecords', 'update', { id, data }),
  delete: (id: string) => callApi('workRecords', 'delete', { id }),
};

// Equipment
export const equipmentApi = {
  findAll: () => callApi('equipment', 'findAll'),
  find: (params: Record<string, unknown>) => callApi('equipment', 'find', params),
  insert: (data: Record<string, unknown>) => callApi('equipment', 'insert', data),
  update: (id: string, data: Record<string, unknown>) => callApi('equipment', 'update', { id, data }),
  delete: (id: string) => callApi('equipment', 'delete', { id }),
  stats: () => callApi('equipment', 'stats'),
};

// Borrowing
export const borrowingApi = {
  findAll: () => callApi('borrowing', 'findAll'),
  find: (params: Record<string, unknown>) => callApi('borrowing', 'find', params),
  findById: (id: string) => callApi('borrowing', 'findById', { id }),
  insert: (header: Record<string, unknown>, items: Record<string, unknown>[]) =>
    callApi('borrowing', 'insert', { header, items }),
  update: (id: string, data: Record<string, unknown>) => callApi('borrowing', 'update', { id, data }),
  return: (id: string, returnDate?: string) => callApi('borrowing', 'return', { id, returnDate }),
  delete: (id: string) => callApi('borrowing', 'delete', { id }),
  stats: () => callApi('borrowing', 'stats'),
};

// Disbursement
export const disbursementApi = {
  findAll: () => callApi('disbursement', 'findAll'),
  find: (params: Record<string, unknown>) => callApi('disbursement', 'find', params),
  findById: (id: string) => callApi('disbursement', 'findById', { id }),
  insert: (header: Record<string, unknown>, items: Record<string, unknown>[]) =>
    callApi('disbursement', 'insert', { header, items }),
  delete: (id: string) => callApi('disbursement', 'delete', { id }),
};

// Dashboard
export const dashboardApi = {
  stats: () => callApi('dashboard', 'stats'),
  recentWorkRecords: (limit = 10) => callApi('dashboard', 'recentWorkRecords', { limit }),
  overdueBorrowing: () => callApi('dashboard', 'overdueBorrowing'),
};
