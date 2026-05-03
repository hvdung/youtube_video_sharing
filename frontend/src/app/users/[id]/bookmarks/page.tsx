'use client'

import { useCallback } from 'react'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useUserBookmarkVideosList } from './hooks/useBookmarkVideosList'
import BookmarkVideoList from '@/app/users/[id]/bookmarks/components/BookmarkVideoList'
import { useAuth } from '@/shared/hooks/useAuth'
import Pagination from '@/shared/components/Pagination'

export default function UserVideosPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const userId = params.id as string
  const currentPageFromQuery = Math.max(1, Number(searchParams.get('page') || '1') || 1)
  const { user } = useAuth()

  const { bookmarks, isLoading, error, count, pagination, changePage } = useUserBookmarkVideosList(userId, currentPageFromQuery)

  const handlePageChange = useCallback(
    (page: number) => {
      changePage(page)

      const params = new URLSearchParams(searchParams.toString())
      if (page <= 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [changePage, pathname, router, searchParams]
  )

  const sharedBy = user?.id.toString() === userId ? user.email : `user_${userId}`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bookmark</h1>
          {!isLoading && (
            <p className="text-sm text-gray-600 mt-1">
              {count} {count === 1 ? 'video' : 'videos'} found
              {pagination && ` — page ${pagination.current_page} of ${pagination.total_pages}`}
            </p>
          )}
        </div>

        <BookmarkVideoList bookmarks={bookmarks} isLoading={isLoading} error={error} sharedBy={sharedBy} />

        {pagination && <Pagination pagination={pagination} onPageChange={handlePageChange} />}
      </div>
    </div>
  )
}
