import { forwardRef } from 'react'
import { formatDate } from '@/utils/dateFormat'

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

interface PrintableRepairReportProps {
  tasks: RepairTask[]
}

export const PrintableRepairReport = forwardRef<HTMLDivElement, PrintableRepairReportProps>(
  ({ tasks }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white">
        <style>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 15mm;
            }
            body {
              font-family: 'Noto Sans Lao', sans-serif;
            }
            .print-container {
              width: 100%;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
          }
        `}</style>

        <div className="print-container">
          {/* ຫົວເອກະສານ */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ລາຍງານການສ້ອມແປງໄອທີ
            </h1>
            <div className="text-sm text-gray-600">
              <p>ວັນທີ: {formatDate(new Date())}</p>
              <p>ຈຳນວນທັງໝົດ: {tasks.length} ລາຍການ</p>
            </div>
          </div>

          {/* ຕາຕະລາງ */}
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                  ວັນທີ
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                  ອຸປະກອນ
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                  ບັນຫາ
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                  ວິທີແກ້ໄຂ
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                  ຊ່າງເຕັກນິກ
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                  ສະຖານະ
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                  ຄວາມສຳຄັນ
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr
                  key={task.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {formatDate(task.date)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {task.equipment}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {task.issue}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {task.solution}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {task.technician}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {task.status}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {task.priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

PrintableRepairReport.displayName = 'PrintableRepairReport'
