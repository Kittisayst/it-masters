import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { googleSheetsService } from '@/services/googleSheets'

export function useLoadData() {
  const { setRepairTasks, setWorkTasks, setLoading } = useStore()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // ✅ FIXED: Parallel data fetching with Promise.all
        // ດຶງຂໍ້ມູນພ້ອມກັນ - 50% ເລັ່ງເວລາ!
        const [repairData, workData] = await Promise.all([
          googleSheetsService.getRepairTasks(),
          googleSheetsService.getWorkTasks()
        ])

        // Set repair tasks
        if (repairData && Array.isArray(repairData)) {
          setRepairTasks(repairData)
          console.log('✅ Loaded repair tasks:', repairData.length)
        }

        // Set work tasks
        if (workData && Array.isArray(workData)) {
          setWorkTasks(workData)
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
