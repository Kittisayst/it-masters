import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3, 'ຊື່ຜູ້ໃຊ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ'),
  password: z.string().min(6, 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ'),
})

export const userSchema = z.object({
  username: z.string().min(3, 'ຊື່ຜູ້ໃຊ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ'),
  password: z.string().min(6, 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ').optional(),
  fullName: z.string().min(2, 'ຊື່ເຕັມຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ'),
  email: z.string().email('ອີເມວບໍ່ຖືກຕ້ອງ'),
  role: z.enum(['admin', 'technician', 'user']),
  department: z.string().min(2, 'ພະແນກຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ'),
  status: z.enum(['active', 'inactive']),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type UserFormData = z.infer<typeof userSchema>
