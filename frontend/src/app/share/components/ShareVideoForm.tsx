'use client'

import { useShareVideo } from '../hooks/useShareVideo'

export default function ShareVideoForm() {
  const { register, handleSubmit, errors, isSubmitting } = useShareVideo()

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="bg-white border-2 border-gray-900 rounded-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Share a Youtube movie
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="youtubeUrl" 
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Youtube URL:
            </label>
            <input
              id="youtubeUrl"
              type="text"
              {...register('youtubeUrl')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.youtubeUrl
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-900 focus:ring-gray-900'
              }`}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isSubmitting}
            />
            {errors.youtubeUrl && (
              <p className="mt-1 text-sm text-red-500">
                {errors.youtubeUrl.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-sm font-medium text-gray-900 bg-white border-2 border-gray-900 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Sharing...' : 'Share'}
          </button>
        </form>
      </div>
    </div>
  )
}
