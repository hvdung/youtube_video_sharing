'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchVideosByUserIdAsync,
  fetchAllVideosAsync,
  clearError,
  clearVideos,
} from '@/store/slices/videoSlice'

export const useVideos = () => {
  const dispatch = useAppDispatch()
  const { videos, isLoading, error, count, pagination } = useAppSelector((state) => state.video)

  const fetchVideosByUserId = useCallback(
    async (userId: string, page = 1) => {
      const result = await dispatch(fetchVideosByUserIdAsync({ userId, page }))
      return result
    },
    [dispatch]
  )

  const fetchAllVideos = useCallback(async (page = 1) => {
    const result = await dispatch(fetchAllVideosAsync(page))
    return result
  }, [dispatch])

  const clearVideoError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const clearAllVideos = useCallback(() => {
    dispatch(clearVideos())
  }, [dispatch])

  return {
    videos,
    isLoading,
    error,
    count,
    pagination,
    fetchVideosByUserId,
    fetchAllVideos,
    clearError: clearVideoError,
    clearVideos: clearAllVideos,
  }
}
