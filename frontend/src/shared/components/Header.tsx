'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'

/**
 * Shared header component for authenticated pages
 * Displays navigation and user info
 */
export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Don't show header on login/register pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-5xl mx-auto px-[20px]">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => router.push('/videos')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <svg 
                className="w-8 h-8 text-gray-900" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">Funny Movies</h1>
            </button>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => router.push('/videos')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  pathname === '/videos'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All Videos
              </button>
              {user && (
                <button
                  onClick={() => router.push(`/users/${user.id}/videos`)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    pathname.includes('/users')
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  My Videos
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600">Welcome {user?.email}</span>
            <button
              onClick={() => router.push('/share')}
              className="px-6 py-2 text-sm font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
            >
              Share a video
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
