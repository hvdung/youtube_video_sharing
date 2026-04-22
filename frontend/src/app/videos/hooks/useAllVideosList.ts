'use client'

import { useEffect } from 'react'
import { useVideos } from '@/shared/hooks/useVideos'

export const useAllVideosList = () => {
  const { videos, isLoading, error, count, fetchAllVideos, clearVideos } = useVideos()

  useEffect(() => {
    fetchAllVideos()

    return () => {
      clearVideos()
    }
  }, [fetchAllVideos, clearVideos])

  return {
    videos,
    isLoading,
    error,
    count,
  }
}
