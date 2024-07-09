import { useForm } from 'react-hook-form'

import logo from '@/assets/logo.svg'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/input'
import { Link, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/services/firebase'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useContextAuth } from '@/contexts/authProvider'

const schema = z.object({
  name: z.string().min(1, 'Insira um nome válido.'),
  email: z
    .string()
    .email('Insira um email válido')
    .min(1, 'O campo email precisa ser preenchido'),
  password: z.string().min(6, 'A senha tem que ter no mínimo 6 dígitos'),
})

type FormInputType = z.infer<typeof schema>

export function SignUp() {
  const { handleInfoUser } = useContextAuth()
  useEffect(() => {
    // when this component is building if the user is authenticate, the useEffect make logout of firebase
    async function onLogout() {
      await signOut(auth)
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
    const { name, email, password } = data

    try {
      await createUserWithEmailAndPassword(auth, email, password).then(
        async (userCredential) => {
          await updateProfile(userCredential.user, {
            displayName: name,
          })

          handleInfoUser({
            name: userCredential.user.displayName,
            uid: userCredential.user.uid,
            email,
          })
        },
      )

      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error('Erro ao cadastrar o usuário, tente novamente.')
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
          type="text"
          placeholder="Digite seu nome completo"
          name="name"
          id="name"
          register={register}
          error={errors.name?.message}
        />

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
          Cadastrar
        </button>
      </form>

      <Link to="/sign-in" className="text-zinc-900 mt-2 hover:font-semibold">
        Já possuí uma conta? Faça login
      </Link>
    </div>
  )
}
