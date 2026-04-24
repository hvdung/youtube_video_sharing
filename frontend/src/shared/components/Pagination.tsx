'use client'

import { Pagination as PaginationType } from '@/types/video'

interface PaginationProps {
  pagination: PaginationType
  onPageChange: (page: number) => void
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { current_page, total_pages } = pagination

  if (total_pages <= 1) return null

  const pages = Array.from({ length: total_pages }, (_, i) => i + 1)

  const getVisiblePages = () => {
    if (total_pages <= 5) return pages
    if (current_page <= 3) return [...pages.slice(0, 5), -1]
    if (current_page >= total_pages - 2) return [-1, ...pages.slice(total_pages - 5)]
    return [-1, current_page - 1, current_page, current_page + 1, -2]
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center gap-1 mt-8 select-none">
      <button
        id="pagination-prev"
        onClick={() => onPageChange(current_page - 1)}
        disabled={!pagination.prev_page}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-gray-100
          text-gray-700 border-2 border-gray-900 bg-white"
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </button>

      {visiblePages.map((page, idx) =>
        page < 0 ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={page}
            id={`pagination-page-${page}`}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 border-2 border-gray-900
              ${page === current_page
                ? 'bg-gray-900 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            aria-current={page === current_page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        id="pagination-next"
        onClick={() => onPageChange(current_page + 1)}
        disabled={!pagination.next_page}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-gray-100
          text-gray-700 border-2 border-gray-900 bg-white"
        aria-label="Next page"
      >
        Next
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
