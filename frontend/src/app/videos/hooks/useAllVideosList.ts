'use client'

import { useCallback, useEffect, useState } from 'react'
import { useVideos } from '@/shared/hooks/useVideos'

export const useAllVideosList = () => {
  const { videos, isLoading, error, count, pagination, fetchAllVideos, clearVideos } = useVideos()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchAllVideos(currentPage)

    return () => {
      clearVideos()
    }
  }, [currentPage, fetchAllVideos, clearVideos])

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
    refetch: () => fetchAllVideos(currentPage),
  }
}
