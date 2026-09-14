import { useQuery } from '@tanstack/react-query';
import { categoriesApi, departmentsApi, employeesApi, usersApi, equipmentApi, workTypesApi, roomsApi, roomComputersApi, networkPortsApi } from '../services/api';
import type { Category, Department, Employee, User, Equipment, WorkType, Room, RoomComputer, NetworkPort } from '../types';

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

export function useNetworkPorts() {
  return useQuery({
    queryKey: ['networkPorts'],
    queryFn: async () => unwrap(await networkPortsApi.find({}), [] as NetworkPort[]),
  });
}

export function useNetworkPortsForEquipment(equipmentId: string | undefined) {
  return useQuery({
    queryKey: ['networkPorts', 'equipment', equipmentId],
    queryFn: async () => unwrap(await networkPortsApi.find({ equipmentId }), [] as NetworkPort[]),
    enabled: !!equipmentId,
  });
}

export function summarizeNetworkPorts(ports: NetworkPort[]): Record<string, { used: number; total: number }> {
  const summary: Record<string, { used: number; total: number }> = {};
  ports.forEach((p) => {
    const s = (summary[p.equipmentId] ??= { used: 0, total: 0 });
    s.total++;
    if (p.status === 'ໃຊ້ງານ') s.used++;
  });
  return summary;
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
