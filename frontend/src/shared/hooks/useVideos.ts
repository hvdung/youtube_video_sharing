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
  const { videos, isLoading, error, count } = useAppSelector((state) => state.video)

  const fetchVideosByUserId = useCallback(
    async (userId: string) => {
      const result = await dispatch(fetchVideosByUserIdAsync(userId))
      return result
    },
    [dispatch]
  )

  const fetchAllVideos = useCallback(async () => {
    const result = await dispatch(fetchAllVideosAsync())
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
    fetchVideosByUserId,
    fetchAllVideos,
    clearError: clearVideoError,
    clearVideos: clearAllVideos,
  }
}
