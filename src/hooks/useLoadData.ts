import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { googleSheetsService } from '@/services/googleSheets'

export function useLoadData() {
  const { setRepairTasks, setWorkTasks, setLoading } = useStore()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // ດຶງຂໍ້ມູນວຽກສ້ອມແປງ
        const repairData = await googleSheetsService.getRepairTasks()
        if (repairData && Array.isArray(repairData)) {
          setRepairTasks(repairData as any)
          console.log('✅ Loaded repair tasks:', repairData.length)
        }

        // ດຶງຂໍ້ມູນວຽກງານ
        const workData = await googleSheetsService.getWorkTasks()
        if (workData && Array.isArray(workData)) {
          setWorkTasks(workData as any)
          console.log('✅ Loaded work tasks:', workData.length)
        }
      } catch (error) {
        console.error('❌ Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setRepairTasks, setWorkTasks, setLoading])
}
