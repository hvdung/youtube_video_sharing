'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/shared/hooks/useAuth'
import { loginAsync } from '@/store/slices/authSlice'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const useLoginLogic = () => {
  const router = useRouter()
  const { isAuthenticated, login, error, isLoading, clearError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/videos')
    }
  }, [isAuthenticated, router])

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      clearError()
      const result = await login(data.email, data.password)
      if (loginAsync.fulfilled.match(result)) {
        router.push('/videos')
      }
    },
    [login, router, clearError]
  )

  return {
    onSubmit: handleSubmit(onSubmit),
    register,
    errors,
    isSubmitting: isSubmitting || isLoading,
    serverError: error,
  }
}
