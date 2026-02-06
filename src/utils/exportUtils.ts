import * as XLSX from 'xlsx'
import { formatDate } from './dateFormat'

interface RepairTask {
  id: string
  date: string
  equipment: string
  issue: string
  solution: string
  technician: string
  status: string
  priority: string
}

interface WorkTask {
  id: string
  date: string
  title: string
  description: string
  assignedTo: string
  status: string
  dueDate: string
}

/**
 * Export ລາຍງານສ້ອມແປງເປັນ Excel
 */
export function exportRepairsToExcel(tasks: RepairTask[]) {
  // ສ້າງຂໍ້ມູນສຳລັບ Excel
  const data = tasks.map(task => ({
    'ວັນທີ': formatDate(task.date),
    'ອຸປະກອນ': task.equipment,
    'ບັນຫາ': task.issue,
    'ວິທີແກ້ໄຂ': task.solution,
    'ຊ່າງເຕັກນິກ': task.technician,
    'ສະຖານະ': task.status,
    'ຄວາມສຳຄັນ': task.priority,
  }))
  
  // ສ້າງ worksheet
  const ws = XLSX.utils.json_to_sheet(data)
  
  // ກຳນົດຄວາມກວ້າງຂອງຄໍລໍາ
  ws['!cols'] = [
    { wch: 12 }, // ວັນທີ
    { wch: 20 }, // ອຸປະກອນ
    { wch: 30 }, // ບັນຫາ
    { wch: 30 }, // ວິທີແກ້ໄຂ
    { wch: 15 }, // ຊ່າງເຕັກນິກ
    { wch: 15 }, // ສະຖານະ
    { wch: 12 }, // ຄວາມສຳຄັນ
  ]
  
  // ສ້າງ workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ລາຍງານສ້ອມແປງ')
  
  // ບັນທຶກໄຟລ໌
  XLSX.writeFile(wb, `ລາຍງານສ້ອມແປງ_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`)
}

/**
 * Export ລາຍງານວຽກງານເປັນ Excel
 */
export function exportWorkTasksToExcel(tasks: WorkTask[]) {
  // ສ້າງຂໍ້ມູນສຳລັບ Excel
  const data = tasks.map(task => ({
    'ວັນທີສ້າງ': formatDate(task.date),
    'ຫົວຂໍ້ວຽກງານ': task.title,
    'ລາຍລະອຽດ': task.description,
    'ຜູ້ຮັບຜິດຊອບ': task.assignedTo,
    'ສະຖານະ': task.status,
    'ວັນທີກຳນົດສົ່ງ': formatDate(task.dueDate),
  }))
  
  // ສ້າງ worksheet
  const ws = XLSX.utils.json_to_sheet(data)
  
  // ກຳນົດຄວາມກວ້າງຂອງຄໍລໍາ
  ws['!cols'] = [
    { wch: 12 }, // ວັນທີສ້າງ
    { wch: 25 }, // ຫົວຂໍ້
    { wch: 35 }, // ລາຍລະອຽດ
    { wch: 15 }, // ຜູ້ຮັບຜິດຊອບ
    { wch: 15 }, // ສະຖານະ
    { wch: 12 }, // ວັນທີກຳນົດສົ່ງ
  ]
  
  // ສ້າງ workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ລາຍງານວຽກງານ')
  
  // ບັນທຶກໄຟລ໌
  XLSX.writeFile(wb, `ລາຍງານວຽກງານ_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`)
}
