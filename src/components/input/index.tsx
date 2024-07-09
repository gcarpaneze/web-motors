/* eslint-disable @typescript-eslint/no-explicit-any */
import { RegisterOptions, UseFormRegister } from 'react-hook-form'

interface InputProps {
  type: string
  placeholder?: string
  name: string
  id: string
  register: UseFormRegister<any>
  error?: string
  rules?: RegisterOptions
}

export function Input({
  name,
  placeholder,
  register,
  type,
  error,
  rules,
}: InputProps) {
  return (
    <>
      <input
        placeholder={placeholder}
        type={type}
        {...register(name, rules)}
        className="w-full border-2 rounded-md h-11 px-2"
      />
      {error && <p className="my-1 text-red-500">{error}</p>}
    </>
  )
}
