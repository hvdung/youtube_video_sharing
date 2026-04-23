'use client'

import { useCallback } from 'react'
import Header from '@/shared/components/Header'
import { useActionCable } from '@/lib/useActionCable'
import { useAuth } from '@/shared/hooks/useAuth'
import { toast } from '@/lib/toast'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const handleNewVideo = useCallback(
    (data: Record<string, unknown>) => {
      if (data.type !== 'new_video') return

      if (user && data.user_id === user.id) return

      toast('info', `🎬 ${data.title}`, {
        description: `Shared by ${data.shared_by}`,
        duration: 6000,
      })
    },
    [user]
  )

  useActionCable({ channel: 'VideosChannel', onMessage: handleNewVideo })

  return (
    <>
      <Header />
      {children}
    </>
  )
}
