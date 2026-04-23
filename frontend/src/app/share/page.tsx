'use client'

import withAuth from '@/hoc/withAuth'
import ShareVideoForm from './components/ShareVideoForm'

function SharePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <ShareVideoForm />
      </div>
    </div>
  )
}

export default withAuth(SharePage)
