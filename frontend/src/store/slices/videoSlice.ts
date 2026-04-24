'use client'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Video, Pagination } from '@/types/video'
import { videoService } from '@/services/videoService'

interface VideoState {
  videos: Video[]
  isLoading: boolean
  error: string | null
  count: number
  pagination: Pagination | null
}

const initialState: VideoState = {
  videos: [],
  isLoading: false,
  error: null,
  count: 0,
  pagination: null,
}

export const fetchVideosByUserIdAsync = createAsyncThunk(
  'video/fetchByUserId',
  async ({ userId, page = 1 }: { userId: string; page?: number }, { rejectWithValue }) => {
    try {
      const response = await videoService.getVideosByUserId(userId, page)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch videos')
    }
  }
)

export const fetchAllVideosAsync = createAsyncThunk(
  'video/fetchAllVideos',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await videoService.getAllVideos(page)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch videos')
    }
  }
)

export const deleteVideoAsync = createAsyncThunk(
  'video/deleteVideo',
  async (videoId: number, { rejectWithValue }) => {
    try {
      const response = await videoService.deleteVideo(videoId)
      return { ...response, videoId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete video')
    }
  }
)

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearVideos: (state) => {
      state.videos = []
      state.count = 0
      state.pagination = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideosByUserIdAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVideosByUserIdAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.videos = action.payload.videos
        state.count = action.payload.count
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchVideosByUserIdAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchAllVideosAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllVideosAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.videos = action.payload.videos
        state.count = action.payload.count
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchAllVideosAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(deleteVideoAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteVideoAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.videos = state.videos.filter(video => video.id !== action.payload.videoId)
        state.count = state.count - 1
        state.error = null
      })
      .addCase(deleteVideoAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearVideos } = videoSlice.actions
export default videoSlice.reducer
