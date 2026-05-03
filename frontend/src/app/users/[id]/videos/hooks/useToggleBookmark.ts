import { useCallback, useRef, useState } from 'react'
import { bookmarkService } from '@/services/bookmarkService'
import { toast } from '@/lib/toast'

export function useToggleBookmark(currentUserId?: number) {
  const [pendingVideoId, setPendingVideoId] = useState<number | null>(null)
  const [bookmarkMap, setBookmarkMap] = useState<Record<number, number>>({})
  const checkedVideoIdsRef = useRef<Record<number, boolean>>({})

  const syncBookmarkFromServer = useCallback(
    async (videoId: number) => {
      if (!currentUserId || checkedVideoIdsRef.current[videoId]) return

      checkedVideoIdsRef.current[videoId] = true
      const existing = await bookmarkService.findBookmarkByVideoId(currentUserId.toString(), videoId)

      if (existing) {
        setBookmarkMap((prev) => ({ ...prev, [videoId]: existing.id }))
      }
    },
    [currentUserId]
  )

  const toggleBookmark = useCallback(
    async (videoId: number) => {
      if (!currentUserId) {
        toast('warning', 'Please login to bookmark videos')
        return
      }

      setPendingVideoId(videoId)

      try {
        let existingBookmarkId = bookmarkMap[videoId]

        if (!existingBookmarkId) {
          const existing = await bookmarkService.findBookmarkByVideoId(currentUserId.toString(), videoId)
          if (existing) {
            existingBookmarkId = existing.id
            setBookmarkMap((prev) => ({ ...prev, [videoId]: existing.id }))
          }
        }

        if (existingBookmarkId) {
          const response = await bookmarkService.deleteBookmark(currentUserId.toString(), existingBookmarkId)

          if (response.success) {
            setBookmarkMap((prev) => {
              const next = { ...prev }
              delete next[videoId]
              return next
            })
            toast('success', 'Bookmark removed')
          } else {
            toast('error', response.message || 'Failed to remove bookmark')
          }

          return
        }

        const createResponse = await bookmarkService.createBookmark(currentUserId.toString(), videoId)

        if (createResponse.success && createResponse.bookmark) {
          setBookmarkMap((prev) => ({ ...prev, [videoId]: createResponse.bookmark!.id }))
          toast('success', 'Video bookmarked')
          return
        }

        // Handle case when bookmark already exists on server but this card has no local state yet.
        if (createResponse.duplicate) {
          const existing = await bookmarkService.findBookmarkByVideoId(currentUserId.toString(), videoId)
          if (existing) {
            setBookmarkMap((prev) => ({ ...prev, [videoId]: existing.id }))
            toast('info', 'Video already bookmarked')
          } else {
            toast('warning', createResponse.message || 'Bookmark already exists')
          }
          return
        }

        toast('error', createResponse.message || 'Failed to bookmark video')
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to update bookmark'

        // Conflict can happen when server already has this bookmark.
        if (error?.response?.status === 409) {
          const existing = await bookmarkService.findBookmarkByVideoId(currentUserId.toString(), videoId)
          if (existing) {
            setBookmarkMap((prev) => ({ ...prev, [videoId]: existing.id }))
            toast('info', 'Video already bookmarked')
          } else {
            toast('warning', message)
          }
        } else {
          toast('error', message)
        }
      } finally {
        setPendingVideoId(null)
      }
    },
    [bookmarkMap, currentUserId]
  )

  return {
    toggleBookmark,
    syncBookmarkFromServer,
    isBookmarked: (videoId: number) => Boolean(bookmarkMap[videoId]),
    isToggling: (videoId: number) => pendingVideoId === videoId,
  }
}
