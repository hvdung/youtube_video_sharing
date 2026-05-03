'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchUserBookmarksAsync,
  clearBookmarkError,
  clearBookmarks,
} from '@/store/slices/bookmarkSlice'

export const useUserBookmarkVideosList = (userId: string) => {
  const [currentPage, setCurrentPage] = useState(1)
  const dispatch = useAppDispatch()
  const { bookmarks, isLoading, error, count, pagination } = useAppSelector((state) => state.bookmark)

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserBookmarksAsync({ userId, page: currentPage }))
    }

    return () => {
      dispatch(clearBookmarks())
    }
  }, [userId, currentPage, dispatch])

  const clearVideoError = useCallback(() => {
    dispatch(clearBookmarkError())
  }, [dispatch])

  const clearAllVideos = useCallback(() => {
    dispatch(clearBookmarks())
  }, [dispatch])

  const changePage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  return {
    bookmarks,
    isLoading,
    error,
    count,
    pagination,
    currentPage,
    changePage,
    clearError: clearVideoError,
    clearBookmarks: clearAllVideos,
  }
}

export const useBookmarkVideosList = useUserBookmarkVideosList
