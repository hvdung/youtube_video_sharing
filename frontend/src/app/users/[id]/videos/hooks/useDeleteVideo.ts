import { useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { deleteVideoAsync, fetchVideosByUserIdAsync } from '@/store/slices/videoSlice'

export function useDeleteVideo(userId?: string) {
  const dispatch = useAppDispatch()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (videoId: number) => {
    setIsDeleting(true)
    try {
      await dispatch(deleteVideoAsync(videoId)).unwrap()
      if (userId) {
        dispatch(fetchVideosByUserIdAsync(userId))
      }
    } catch (error: any) {
      alert(error || 'Failed to delete video')
    } finally {
      setIsDeleting(false)
    }
  }

  return { handleDelete, isDeleting }
}
