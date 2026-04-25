'use client'

import { useCallback } from 'react'
import { useAllVideosList } from './hooks/useAllVideosList'
import { useActionCable } from '@/lib/useActionCable'
import VideoList from '@/app/users/[id]/videos/components/VideoList'
import Pagination from '@/shared/components/Pagination'

export default function AllVideosPage() {
  const { videos, isLoading, error, count, pagination, changePage, refetch } = useAllVideosList()

  const handleCableMessage = useCallback(
    (data: Record<string, unknown>) => {
      if (data.type === 'new_video') {
        refetch()
      }
    },
    [refetch]
  )

  useActionCable({ channel: 'VideosChannel', onMessage: handleCableMessage })

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Videos</h1>
          {!isLoading && (
            <p className="text-sm text-gray-600 mt-1">
              {count} {count === 1 ? 'video' : 'videos'} available
              {pagination && ` — page ${pagination.current_page} of ${pagination.total_pages}`}
            </p>
          )}
        </div>

        <VideoList videos={videos} isLoading={isLoading} error={error} sharedBy="" />

        {pagination && <Pagination pagination={pagination} onPageChange={changePage} />}
      </div>
    </div>
  )
}
