import { useForm } from 'react-hook-form'
import logo from '@/assets/logo.svg'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/input'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { useEffect } from 'react'
import { toast } from 'react-toastify'

const schema = z.object({
  email: z
    .string()
    .email('Insira um email válido')
    .min(1, 'O campo email precisa ser preenchido'),
  password: z.string().min(1, 'O campo password precisa ser preenchido'),
})

type FormInputType = z.infer<typeof schema>

export function SignIn() {
  useEffect(() => {
    async function onLogout() {
      await signOut(auth)
      toast.success('Usuário deslogado do sistema')
    }

    onLogout()
  }, [])

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputType>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  async function onSubmit(data: FormInputType) {
    const { email, password } = data

    try {
      await signInWithEmailAndPassword(auth, email, password)

      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error('Usuário ou senha incorretos.')
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 min-h-screen flex justify-center items-center flex-col gap-4">
      <img src={logo} alt="logo" className="mb-6 max-w-sm w-full" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white max-w-xl w-full rounded-lg flex flex-col gap-2 p-2"
      >
        <Input
          type="email"
          placeholder="Digite seu email"
          name="email"
          id="email"
          register={register}
          error={errors.email?.message}
        />

        <Input
          type="password"
          placeholder="Digite sua senha"
          name="password"
          id="password"
          register={register}
          error={errors.password?.message}
        />

        <button
          type="submit"
          className="bg-zinc-900 w-full rounded-md h-10 font-medium text-white mt-10"
        >
          Acessar
        </button>
      </form>

      <Link to="/sign-up" className="text-zinc-900 mt-2 hover:font-semibold">
        Ainda não possuí uma conta? Cadastre-se
      </Link>
    </div>
  )
}
