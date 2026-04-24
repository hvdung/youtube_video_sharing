import apiClient from '@/lib/apiClient'
import { VideoListResponse } from '@/types/video'

export const videoService = {
  async getVideosByUserId(userId: string, page = 1): Promise<VideoListResponse> {
    const response = await apiClient.get(`/users/${userId}/videos`, { params: { page } })
    return response.data
  },

  async getAllVideos(page = 1): Promise<VideoListResponse> {
    const response = await apiClient.get('/videos', { params: { page } })
    return response.data
  },

  async deleteVideo(videoId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/videos/${videoId}`)
    return response.data
  },

  async createVideo(userId: number, url: string): Promise<{ success: boolean; message: string; video?: any }> {
    const response = await apiClient.post(`/videos`, { url })
    return response.data
  },
}
