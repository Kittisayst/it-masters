import { useQuery } from '@tanstack/react-query';
import { categoriesApi, departmentsApi, employeesApi, usersApi, equipmentApi, workTypesApi, roomsApi, roomComputersApi } from '../services/api';
import type { Category, Department, Employee, User, Equipment, WorkType, Room, RoomComputer } from '../types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => unwrap(await categoriesApi.findAll(), [] as Category[]),
  });
}

function unwrap<T>(res: { success: boolean; data?: T; error?: string }, fallback: T): T {
  if (!res.success) throw new Error(res.error ?? 'API error');
  return res.data ?? fallback;
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => unwrap(await departmentsApi.findAll(), [] as Department[]),
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => unwrap(await employeesApi.findAll(), [] as Employee[]),
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => unwrap(await usersApi.findAll(), [] as User[]),
  });
}

export function useAvailableEquipment() {
  return useQuery({
    queryKey: ['equipment', 'available'],
    queryFn: async () => unwrap(await equipmentApi.find({ status: 'ປົກກະຕິ' }), [] as Equipment[]),
  });
}

export function useEquipmentList() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => unwrap(await equipmentApi.findAll(), [] as Equipment[]),
  });
}

export function useRoomComputers() {
  return useQuery({
    queryKey: ['roomComputers'],
    queryFn: async () => unwrap(await roomComputersApi.findAll(), [] as RoomComputer[]),
  });
}

export function useWorkTypes() {
  return useQuery({
    queryKey: ['workTypes'],
    queryFn: async () => unwrap(await workTypesApi.findAll(), [] as WorkType[]),
  });
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => unwrap(await roomsApi.findAll(), [] as Room[]),
  });
}

export function useAvailableRooms() {
  return useQuery({
    queryKey: ['rooms', 'available'],
    queryFn: async () => unwrap(await roomsApi.find({ status: 'ປົກກະຕິ' }), [] as Room[]),
  });
}
