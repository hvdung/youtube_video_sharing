'use client'

import { Video } from '@/types/video'
import Image from 'next/image'
import { useAuth } from '@/shared/hooks/useAuth'
import { useParams } from 'next/navigation'
import { useDeleteVideo } from '../hooks/useDeleteVideo'

interface VideoCardProps {
  video: Video
  sharedBy: string
}

export default function VideoCard({ video, sharedBy }: VideoCardProps) {
  const { user } = useAuth()
  const params = useParams()
  const userId = params.id as string
  const { handleDelete, isDeleting } = useDeleteVideo(userId)

  const isOwner = user?.id === video.user_id

  return (
    <div className="flex gap-6 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
      {isOwner && (
        <button
          onClick={() => handleDelete(video.id)}
          disabled={isDeleting}
          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors z-10"
          title="Delete video"
        >
          {isDeleting ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      )}
      
      <div className="flex-shrink-0 w-64 h-36 bg-gray-200 rounded overflow-hidden relative">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
          <button className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100">
            <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
          <div className="flex-1 h-1 bg-white bg-opacity-50 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-red-600"></div>
          </div>
          <button className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100">
            <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </button>
          <button className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100">
            <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-red-600 mb-2 truncate">{video.title}</h3>
        <div className="text-sm text-gray-600 mb-2">
          <span>Shared by: {video.user_email || sharedBy}</span>
        </div>
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-1">Description:</p>
          <p className="line-clamp-3 text-gray-600">
            {video.description || 'No description available'}
          </p>
        </div>
      </div>
    </div>
  )
}
