'use client'

import { useCallback, useEffect, useState } from 'react'
import { useVideos } from '@/shared/hooks/useVideos'

export const useVideosList = (userId: string) => {
  const { videos, isLoading, error, count, pagination, fetchVideosByUserId, clearVideos } = useVideos()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (userId) {
      fetchVideosByUserId(userId, currentPage)
    }

    return () => {
      clearVideos()
    }
  }, [userId, currentPage, fetchVideosByUserId, clearVideos])

  const changePage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  return {
    videos,
    isLoading,
    error,
    count,
    pagination,
    currentPage,
    changePage,
  }
}
