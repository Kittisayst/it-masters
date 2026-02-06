import { z } from 'zod'

export const repairTaskSchema = z.object({
  equipment: z.string().min(2, 'ອຸປະກອນຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ'),
  issue: z.string().min(5, 'ບັນຫາຕ້ອງມີຢ່າງໜ້ອຍ 5 ຕົວອັກສອນ'),
  solution: z.string().min(5, 'ວິທີແກ້ໄຂຕ້ອງມີຢ່າງໜ້ອຍ 5 ຕົວອັກສອນ'),
  technician: z.string().min(2, 'ຊື່ຊ່າງເຕັກນິກຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ'),
  status: z.enum(['pending', 'in-progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  date: z.string().optional(),
})

export const workTaskSchema = z.object({
  title: z.string().min(3, 'ຫົວຂໍ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ'),
  description: z.string().min(10, 'ລາຍລະອຽດຕ້ອງມີຢ່າງໜ້ອຍ 10 ຕົວອັກສອນ'),
  assignedTo: z.string().min(2, 'ຊື່ຜູ້ຮັບຜິດຊອບຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ'),
  status: z.enum(['todo', 'in-progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  createdDate: z.string().optional(),
})

export type RepairTaskFormData = z.infer<typeof repairTaskSchema>
export type WorkTaskFormData = z.infer<typeof workTaskSchema>
