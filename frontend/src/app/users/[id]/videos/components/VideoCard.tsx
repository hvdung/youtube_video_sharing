'use client'

import { useState } from 'react'
import { Video } from '@/types/video'
import Image from 'next/image'
import { useAuth } from '@/shared/hooks/useAuth'
import { useParams } from 'next/navigation'
import { useDeleteVideo } from '../hooks/useDeleteVideo'
import ConfirmModal from '@/shared/components/ConfirmModal'

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
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeleteClick = () => setShowConfirm(true)
  const handleConfirm = async () => {
    await handleDelete(video.id)
    setShowConfirm(false)
  }
  const handleCancel = () => setShowConfirm(false)

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        title="Xóa video"
        message={`Bạn có chắc muốn xóa "${video.title}" không? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        isLoading={isDeleting}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 bg-white border-2 border-gray-900 rounded-lg hover:shadow-md transition-shadow relative overflow-hidden">

        {isOwner && (
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors z-10"
            title="Delete video"
          >
            {isDeleting ? (
              <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        )}

        <div className="w-full sm:w-56 md:w-64 flex-shrink-0 h-44 sm:h-36 bg-gray-200 relative">
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
            <button
              onClick={() => window.open(video.url, '_blank', 'noopener,noreferrer')}
              title="Watch on YouTube"
              className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100"
            >
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

        <div className="flex-1 min-w-0 p-3 sm:p-4 pr-8 sm:pr-10">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2">
            {video.title}
          </h3>
          <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            <span>Shared by: {video.user_email || sharedBy}</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-700">
            <p className="font-semibold mb-0.5">Description:</p>
            <p className="line-clamp-3 text-gray-600">
              {video.description || 'No description available'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
