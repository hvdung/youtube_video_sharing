'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'

interface RegisterFormData {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

/**
 * Custom hook for register page logic
 * Handles form submission and navigation
 */
export const useRegisterLogic = () => {
  const router = useRouter()
  const { register, error, isLoading, clearError } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = useCallback(
    async (data: RegisterFormData) => {
      setFormError(null)
      setSuccess(false)
      clearError()

      const result = await register(
        data.name,
        data.email,
        data.password,
        data.passwordConfirmation
      )

      if (registerAsync.fulfilled.match(result)) {
        setSuccess(true)
        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setFormError(error || 'Registration failed')
      }
    },
    [register, router, error, clearError]
  )

  return {
    handleRegister,
    isLoading,
    error: formError || error,
    success,
  }
}

// Import for type checking
import { registerAsync } from '@/store/slices/authSlice'
