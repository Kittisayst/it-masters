import useSWR from 'swr'
import { googleSheetsService } from '@/services/googleSheets'

// SWR fetcher function
const fetcher = async (key: string) => {
  switch (key) {
    case 'repair-tasks':
      return await googleSheetsService.getRepairTasks()
    case 'work-tasks':
      return await googleSheetsService.getWorkTasks()
    default:
      throw new Error(`Unknown fetch key: ${key}`)
  }
}

// ✅ FIXED: SWR hooks for request deduplication
export function useRepairTasks() {
  const { data, error, isLoading, mutate } = useSWR(
    'repair-tasks',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
      errorRetryCount: 3,
    }
  )

  return {
    repairTasks: data || [],
    isLoading,
    error,
    mutate, // For manual refresh
  }
}

export function useWorkTasks() {
  const { data, error, isLoading, mutate } = useSWR(
    'work-tasks',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
      errorRetryCount: 3,
    }
  )

  return {
    workTasks: data || [],
    isLoading,
    error,
    mutate, // For manual refresh
  }
}

// Hook for both data types
export function useAllTasks() {
  const { repairTasks, isLoading: repairLoading, error: repairError, mutate: mutateRepairs } = useRepairTasks()
  const { workTasks, isLoading: workLoading, error: workError, mutate: mutateWork } = useWorkTasks()

  const isLoading = repairLoading || workLoading
  const error = repairError || workError

  const mutateAll = () => {
    mutateRepairs()
    mutateWork()
  }

  return {
    repairTasks,
    workTasks,
    isLoading,
    error,
    mutateAll,
    mutateRepairs,
    mutateWork,
  }
}
