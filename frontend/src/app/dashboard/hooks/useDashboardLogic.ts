'use client'

import { useAuth } from '@/shared/hooks/useAuth'

export const useDashboardLogic = () => {
  const { user, isLoading, logout } = useAuth()

  return {
    user,
    isLoading,
    logout,
  }
}
