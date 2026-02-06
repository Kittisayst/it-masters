import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { LogIn, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success('ເຂົ້າສູ່ລະບົບສຳເລັດ')
      navigate('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ລະບົບຈັດການໄອທີ
          </h1>
          <p className="text-gray-600">ເຂົ້າສູ່ລະບົບເພື່ອສືບຕໍ່</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ຊື່ຜູ້ໃຊ້</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ລະຫັດຜ່ານ</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="ປ້ອນລະຫັດຜ່ານ"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ກຳລັງເຂົ້າສູ່ລະບົບ...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    ເຂົ້າສູ່ລະບົບ
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">ບັນຊີທົດສອບ:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="font-semibold text-gray-700">Admin</p>
                <p className="text-gray-600">admin / admin123</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="font-semibold text-gray-700">Technician</p>
                <p className="text-gray-600">tech1 / tech123</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="font-semibold text-gray-700">User</p>
                <p className="text-gray-600">user1 / user123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 IT Management System
        </p>
      </div>
    </div>
  )
}
