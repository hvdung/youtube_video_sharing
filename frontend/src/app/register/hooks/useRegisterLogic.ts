'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/shared/hooks/useAuth'
import { registerAsync } from '@/store/slices/authSlice'

const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirmation: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ['passwordConfirmation'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export const useRegisterLogic = () => {
  const router = useRouter()
  const { register: registerUser, error, isLoading, clearError } = useAuth()
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      setServerErrors([])
      setSuccess(false)
      clearError()

      try {
        const result = await registerUser(
          data.name,
          data.email,
          data.password,
          data.passwordConfirmation
        )

        if (registerAsync.fulfilled.match(result)) {
          setSuccess(true)
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { errors?: string[] } } }
        const errs = axiosErr?.response?.data?.errors
        if (errs && errs.length > 0) {
          setServerErrors(errs)
        }
      }
    },
    [registerUser, router, clearError]
  )

  return {
    onSubmit: handleSubmit(onSubmit),
    register,
    errors,
    isSubmitting: isSubmitting || isLoading,
    serverError: error,
    serverErrors,
    success,
  }
}
