'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  loginAsync,
  registerAsync,
  logoutAsync,
  fetchCurrentUserAsync,
  clearError,
} from '@/store/slices/authSlice'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token && !user && !isLoading) {
        hasFetchedRef.current = true
        dispatch(fetchCurrentUserAsync())
      }
    }
  }, [dispatch, user, isLoading])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await dispatch(loginAsync({ email, password }))
      return result
    },
    [dispatch]
  )

  const register = useCallback(
    async (name: string, email: string, password: string, passwordConfirmation: string) => {
      const result = await dispatch(
        registerAsync({ name, email, password, passwordConfirmation })
      )
      return result
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    await dispatch(logoutAsync())
  }, [dispatch])

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    clearError: clearAuthError,
  }
}
