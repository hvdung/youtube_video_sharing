'use client'

import { Video } from '@/types/video'
import VideoCard from './VideoCard'

interface VideoListProps {
  videos: Video[]
  isLoading: boolean
  error: string | null
  sharedBy: string
}

export default function VideoList({ videos, isLoading, error, sharedBy }: VideoListProps) {
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
        <p className="font-medium">Error loading videos</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (videos.length === 0) {
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No videos</h3>
        <p className="mt-1 text-sm text-gray-500">This user hasn't shared any videos yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} sharedBy={sharedBy} />
      ))}
    </div>
  )
}
