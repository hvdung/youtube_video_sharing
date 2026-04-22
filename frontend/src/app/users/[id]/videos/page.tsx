'use client'

import { useParams } from 'next/navigation'
import { useVideosList } from './hooks/useVideosList'
import VideoList from './components/VideoList'
import { useAuth } from '@/shared/hooks/useAuth'

export default function UserVideosPage() {
  const params = useParams()
  const userId = params.id as string
  const { user } = useAuth()

  const { videos, isLoading, error, count } = useVideosList(userId)

  const sharedBy = user?.id.toString() === userId ? user.email : `user_${userId}`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shared Videos</h1>
          {!isLoading && (
            <p className="text-sm text-gray-600 mt-1">
              {count} {count === 1 ? 'video' : 'videos'} found
            </p>
          )}
        </div>

        <VideoList videos={videos} isLoading={isLoading} error={error} sharedBy={sharedBy} />
      </div>
    </div>
  )
}
