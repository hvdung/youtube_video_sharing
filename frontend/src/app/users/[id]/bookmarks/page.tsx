'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
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
  const keywordFromQuery = (searchParams.get('q') || '').trim()
  const [keyword, setKeyword] = useState(keywordFromQuery)
  const { user } = useAuth()

  useEffect(() => {
    setKeyword(keywordFromQuery)
  }, [keywordFromQuery])

  const { bookmarks, isLoading, error, count, pagination, changePage } = useUserBookmarkVideosList(
    userId,
    currentPageFromQuery,
    keywordFromQuery
  )

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

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const params = new URLSearchParams(searchParams.toString())
      const trimmedKeyword = keyword.trim()

      if (trimmedKeyword) {
        params.set('q', trimmedKeyword)
      } else {
        params.delete('q')
      }

      params.delete('page')

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [keyword, pathname, router, searchParams]
  )

  const handleClearSearch = useCallback(() => {
    setKeyword('')

    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }, [pathname, router, searchParams])

  const sharedBy = user?.id.toString() === userId ? user.email : `user_${userId}`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bookmark</h1>
          <form onSubmit={handleSearchSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search by video title"
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-indigo-500"
            />
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Search
            </button>
            {keywordFromQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </form>
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
