import { useQuery } from '@tanstack/react-query';
import { departmentsApi, employeesApi, usersApi, equipmentApi } from '../services/api';
import type { Department, Employee, User, Equipment } from '../types';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await departmentsApi.findAll();
      return (res.data as Department[]) ?? [];
    },
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await employeesApi.findAll();
      return (res.data as Employee[]) ?? [];
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await usersApi.findAll();
      return (res.data as User[]) ?? [];
    },
  });
}

export function useAvailableEquipment() {
  return useQuery({
    queryKey: ['equipment', 'available'],
    queryFn: async () => {
      const res = await equipmentApi.find({ status: 'ປົກກະຕິ' });
      return (res.data as Equipment[]) ?? [];
    },
  });
}
