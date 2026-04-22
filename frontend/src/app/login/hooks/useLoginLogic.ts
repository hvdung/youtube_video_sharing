'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { loginAsync } from '@/store/slices/authSlice'

interface LoginFormData {
  email: string
  password: string
}

export const useLoginLogic = () => {
  const router = useRouter()
  const { login, error, isLoading, clearError } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const handleLogin = useCallback(
    async (data: LoginFormData) => {
      try {
        setFormError(null)
        clearError()

        const result = await login(data.email, data.password)

        if (loginAsync.fulfilled.match(result)) {
          router.push('/dashboard')
        } else {
          setFormError('Login failed. Please check your credentials.')
        }
      } catch (err) {
        setFormError('An error occurred during login')
        console.error('Login error:', err)
      }
    },
    [login, router, clearError]
  )

  return {
    handleLogin,
    isLoading,
    error: formError || error,
  }
}
