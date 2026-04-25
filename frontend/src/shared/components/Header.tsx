'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  const navLinkClass = (active: boolean) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
      ? 'bg-gray-100 text-gray-900'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-5xl mx-auto px-4 sm:px-5">
        <div className="flex justify-between h-14 sm:h-16 items-center gap-2">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <button
              onClick={() => router.push('/videos')}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 whitespace-nowrap">
                Funny Movies
              </h1>
            </button>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => router.push('/videos')}
                className={navLinkClass(pathname === '/videos' || pathname === '/')}
              >
                All Videos
              </button>
              {user && (
                <button
                  onClick={() => router.push(`/users/${user.id}/videos`)}
                  className={navLinkClass(pathname.includes('/users'))}
                >
                  My Videos
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {user ? (
              <>
                <span className="hidden lg:block text-sm text-gray-500 truncate max-w-[160px]">
                  Welcome {user.email}
                </span>

                <button
                  onClick={() => router.push('/share')}
                  className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Share a video</span>
                  <span className="sm:hidden">Share</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors whitespace-nowrap"
                >
                  Logout
                </button>

                <button
                  className="md:hidden p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {user.email && (
            <p className="text-xs text-gray-400 px-3 pb-2 truncate">
              Signed in as <span className="font-medium text-gray-600">{user.email}</span>
            </p>
          )}
          <button
            onClick={() => { router.push('/videos'); setMobileMenuOpen(false) }}
            className={`w-full text-left ${navLinkClass(pathname === '/videos' || pathname === '/')}`}
          >
            All Videos
          </button>
          <button
            onClick={() => { router.push(`/users/${user.id}/videos`); setMobileMenuOpen(false) }}
            className={`w-full text-left ${navLinkClass(pathname.includes('/users'))}`}
          >
            My Videos
          </button>
        </div>
      )}
    </nav>
  )
}
