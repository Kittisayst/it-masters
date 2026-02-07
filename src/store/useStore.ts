import { create } from 'zustand'
import type { RepairTask, WorkTask } from '@/types/task'

interface Store {
  // ✅ UPDATED: Local state for optimistic updates
  repairTasks: RepairTask[]
  workTasks: WorkTask[]
  isLoading: boolean
  
  // CRUD operations for optimistic updates
  addRepairTask: (task: RepairTask) => void
  updateRepairTask: (id: string, task: Partial<RepairTask>) => void
  deleteRepairTask: (id: string) => void
  addWorkTask: (task: WorkTask) => void
  updateWorkTask: (id: string, task: Partial<WorkTask>) => void
  deleteWorkTask: (id: string) => void
  
  // Legacy methods (keep for compatibility)
  setRepairTasks: (tasks: RepairTask[]) => void
  setWorkTasks: (tasks: WorkTask[]) => void
  setLoading: (loading: boolean) => void
}

export const useStore = create<Store>((set) => ({
  repairTasks: [],
  workTasks: [],
  isLoading: false,
  setRepairTasks: (tasks) => set({ repairTasks: tasks }),
  setWorkTasks: (tasks) => set({ workTasks: tasks }),
  addRepairTask: (task) =>
    set((state) => ({ repairTasks: [...state.repairTasks, task] })),
  updateRepairTask: (id, updatedTask) =>
    set((state) => ({
      repairTasks: state.repairTasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      ),
    })),
  deleteRepairTask: (id) =>
    set((state) => ({
      repairTasks: state.repairTasks.filter((task) => task.id !== id),
    })),
  addWorkTask: (task) =>
    set((state) => ({ workTasks: [...state.workTasks, task] })),
  updateWorkTask: (id, updatedTask) =>
    set((state) => ({
      workTasks: state.workTasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      ),
    })),
  deleteWorkTask: (id) =>
    set((state) => ({
      workTasks: state.workTasks.filter((task) => task.id !== id),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}))
