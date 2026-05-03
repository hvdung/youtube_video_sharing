'use client'

import { Bookmark } from '@/types/bookmark'
import BookmarkVideoCard from './BookmarkVideoCard'

interface BookmarkVideoListProps {
  bookmarks: Bookmark[]
  isLoading: boolean
  error: string | null
  sharedBy: string
}

export default function BookmarkVideoList({ bookmarks, isLoading, error, sharedBy }: BookmarkVideoListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-gray-900 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading bookmarks</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v15l-7-3-7 3V5z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarks</h3>
        <p className="mt-1 text-sm text-gray-500">This user has not bookmarked any videos yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <BookmarkVideoCard key={bookmark.id} bookmark={bookmark} sharedBy={sharedBy} />
      ))}
    </div>
  )
}
