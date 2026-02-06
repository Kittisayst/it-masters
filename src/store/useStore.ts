import { create } from 'zustand'

interface RepairTask {
  id: string
  date: string
  equipment: string
  issue: string
  solution: string
  technician: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

interface WorkTask {
  id: string
  date: string
  title: string
  description: string
  assignedTo: string
  status: 'todo' | 'in-progress' | 'done'
  dueDate: string
}

interface Store {
  repairTasks: RepairTask[]
  workTasks: WorkTask[]
  isLoading: boolean
  setRepairTasks: (tasks: RepairTask[]) => void
  setWorkTasks: (tasks: WorkTask[]) => void
  addRepairTask: (task: RepairTask) => void
  updateRepairTask: (id: string, task: Partial<RepairTask>) => void
  deleteRepairTask: (id: string) => void
  addWorkTask: (task: WorkTask) => void
  updateWorkTask: (id: string, task: Partial<WorkTask>) => void
  deleteWorkTask: (id: string) => void
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
