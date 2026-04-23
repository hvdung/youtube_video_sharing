import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/shared/hooks/useAuth'
import { videoService } from '@/services/videoService'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'

const shareVideoSchema = z.object({
  youtubeUrl: z
    .string()
    .min(1, 'Please enter a YouTube URL')
    .regex(
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/,
      'Please enter a valid YouTube URL'
    ),
})

type ShareVideoFormData = z.infer<typeof shareVideoSchema>

export function useShareVideo() {
  const { user } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ShareVideoFormData>({
    resolver: zodResolver(shareVideoSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: ShareVideoFormData) => {
    if (!user?.id) {
      toast('error', 'You must be logged in to share a video')
      return
    }

    try {
      const result = await videoService.createVideo(user.id, data.youtubeUrl)

      if (result.success) {
        reset()
        toast('success', 'The video has been successfully shared.!')
        router.push(`/videos`)
      } else {
        toast('error', result.message || 'Failed to share video')
      }
    } catch (error: any) {
      const status = error.response?.status
      const message = error.response?.data?.message

      if (status === 409) {
        toast('warning', message || 'The video has been shared.')
      } else {
        toast('error', message || 'Failed to share video')
      }
    }
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
  }
}
