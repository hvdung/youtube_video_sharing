'use client'

import { useEffect } from 'react'
import { useVideos } from '@/shared/hooks/useVideos'

export const useVideosList = (userId: string) => {
  const { videos, isLoading, error, count, fetchVideosByUserId, clearVideos } = useVideos()

  useEffect(() => {
    if (userId) {
      fetchVideosByUserId(userId)
    }

    return () => {
      clearVideos()
    }
  }, [userId, fetchVideosByUserId, clearVideos])

  return {
    videos,
    isLoading,
    error,
    count,
  }
}
