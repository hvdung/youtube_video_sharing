'use client'

import Image from 'next/image'
import { Bookmark } from '@/types/bookmark'

interface BookmarkVideoCardProps {
  bookmark: Bookmark
  sharedBy: string
}

export default function BookmarkVideoCard({ bookmark, sharedBy }: BookmarkVideoCardProps) {
  const video = bookmark.video

  return (
    <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 bg-white border-2 border-gray-900 rounded-lg hover:shadow-md transition-shadow overflow-hidden">
      <div className="w-full sm:w-56 md:w-64 flex-shrink-0 h-44 sm:h-36 bg-gray-200 relative">
        {video?.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
          </div>
        )}

        <button
          onClick={() => window.open(video.url, '_blank', 'noopener,noreferrer')}
          title="Watch on YouTube"
          className="absolute bottom-2 left-2 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100"
        >
          <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 min-w-0 p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2">
          {video?.title || 'Untitled video'}
        </h3>

        <div className="text-xs sm:text-sm text-gray-600 mb-2">
          <span>Shared by: {video?.user_email || sharedBy}</span>
        </div>

        <div className="text-xs sm:text-sm text-gray-700 mb-2">
          <p className="font-semibold mb-0.5">Description:</p>
          <p className="line-clamp-2 text-gray-600">
            {video?.description || 'No description available'}
          </p>
        </div>

        <div className="text-xs sm:text-sm text-gray-700">
          <p className="font-semibold mb-0.5">Note:</p>
          <p className="line-clamp-2 text-gray-600">{bookmark.noted || 'No note'}</p>
        </div>
      </div>
    </div>
  )
}
