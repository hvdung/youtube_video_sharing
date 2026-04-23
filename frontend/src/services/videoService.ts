import apiClient from '@/lib/apiClient'
import { VideoListResponse } from '@/types/video'

export const videoService = {
  async getVideosByUserId(userId: string): Promise<VideoListResponse> {
    const response = await apiClient.get(`/users/${userId}/videos`)
    return response.data
  },

  async getAllVideos(): Promise<VideoListResponse> {
    const response = await apiClient.get('/videos')
    return response.data
  },

  async deleteVideo(videoId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/videos/${videoId}`)
    return response.data
  },

  async createVideo(userId: number, url: string): Promise<{ success: boolean; message: string; video?: any }> {
    const response = await apiClient.post(`/users/${userId}/videos`, { url })
    return response.data
  },
}
