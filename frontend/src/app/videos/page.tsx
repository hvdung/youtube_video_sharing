'use client'

import { useAllVideosList } from './hooks/useAllVideosList'
import VideoList from '@/app/users/[id]/videos/components/VideoList'

export default function AllVideosPage() {
  const { videos, isLoading, error, count } = useAllVideosList()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Videos</h1>
          {!isLoading && (
            <p className="text-sm text-gray-600 mt-1">
              {count} {count === 1 ? 'video' : 'videos'} available
            </p>
          )}
        </div>

        <VideoList videos={videos} isLoading={isLoading} error={error} sharedBy="" />
      </div>
    </div>
  )
}
