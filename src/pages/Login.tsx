import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { LogIn, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { LoginFormData } from '@/lib/validations/auth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginFormData) => {
    setLoading(true)
    try {
      await login(values)
      message.success('ເຂົ້າສູ່ລະບົບສຳເລັດ')
      navigate('/')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen bg-linear-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4"
      role="main"
      aria-label="ໜ້າເຂົ້າສູ່ລະບົບ"
    >
      <div className="max-w-md w-full" role="region" aria-label="ຟອມເຂົ້າສູ່ລະບົບ">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            ລະບົບຈັດການໄອທີ
          </h1>
          <p className="text-purple-100">ເຂົ້າສູ່ລະບົບເພື່ອສືບຕໍ່</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="ຊື່ຜູ້ໃຊ້"
              name="username"
              rules={[
                { required: true, message: 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້' },
                { min: 3, message: 'ຊື່ຜູ້ໃຊ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ' }
              ]}
            >
              <Input
                size="large"
                placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
                autoFocus
                aria-label="ຊື່ຜູ້ໃຊ້"
                aria-describedby="username-help"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="ລະຫັດຜ່ານ"
              name="password"
              rules={[
                { required: true, message: 'ກະລຸນາປ້ອນລະຫັດຜ່ານ' },
                { min: 6, message: 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ' }
              ]}
            >
              <Input.Password
                size="large"
                placeholder="ປ້ອນລະຫັດຜ່ານ"
                aria-label="ລະຫັດຜ່ານ"
                aria-describedby="password-help"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                className="btn-shine btn-bounce"
                icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-5 h-5" />}
                aria-label={loading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ' : 'ເຂົ້າສູ່ລະບົບ'}
              >
                {loading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ'}
              </Button>
            </Form.Item>
          </Form>

        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-purple-100 mt-6">
          © 2024 IT Management System
        </p>
      </div>
    </div>
  )
}
