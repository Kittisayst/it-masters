export interface RepairTask {
  id: string
  date: string
  reportDate: string
  equipment: string
  issue: string
  solution: string
  technician: string
  reporter: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  notes?: string
}

export type RepairTaskStatus = RepairTask['status']
export type RepairTaskPriority = RepairTask['priority']

export interface WorkTask {
  id: string
  date: string
  title: string
  description: string
  assignedTo: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  notes?: string
}

export interface TaskWithIndex<T> {
  data: T
  rowIndex: number
}
