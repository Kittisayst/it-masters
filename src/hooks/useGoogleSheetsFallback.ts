// Fallback hook while SWR dependency resolves
import { useState, useEffect } from 'react'
import { googleSheetsService } from '@/services/googleSheets'
import type { RepairTask, WorkTask } from '@/types/task'

export function useRepairTasksFallback() {
  const [repairTasks, setRepairTasks] = useState<RepairTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await googleSheetsService.getRepairTasks()
        setRepairTasks(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load repair tasks'))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return { repairTasks, isLoading, error }
}

export function useWorkTasksFallback() {
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await googleSheetsService.getWorkTasks()
        setWorkTasks(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load work tasks'))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return { workTasks, isLoading, error }
}

export function useAllTasks() {
  const { repairTasks, isLoading: repairLoading, error: repairError } = useRepairTasksFallback()
  const { workTasks, isLoading: workLoading, error: workError } = useWorkTasksFallback()

  const isLoading = repairLoading || workLoading
  const error = repairError || workError

  const mutateAll = () => {
    window.location.reload() // Simple refresh for fallback
  }

  return {
    repairTasks,
    workTasks,
    isLoading,
    error,
    mutateAll,
  }
}
