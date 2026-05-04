'use client'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Bookmark } from '@/types/bookmark'
import { Pagination } from '@/types/video'
import { bookmarkService } from '@/services/bookmarkService'

interface BookmarkState {
  bookmarks: Bookmark[]
  isLoading: boolean
  error: string | null
  count: number
  pagination: Pagination | null
}

const initialState: BookmarkState = {
  bookmarks: [],
  isLoading: false,
  error: null,
  count: 0,
  pagination: null,
}

export const fetchUserBookmarksAsync = createAsyncThunk(
  'bookmark/fetchByUserId',
  async ({ userId, page = 1, query = '' }: { userId: string; page?: number; query?: string }, { rejectWithValue }) => {
    try {
      const response = await bookmarkService.getBookmarksByUserId(userId, page, query)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookmarks')
    }
  }
)

const bookmarkSlice = createSlice({
  name: 'bookmark',
  initialState,
  reducers: {
    clearBookmarkError: (state) => {
      state.error = null
    },
    clearBookmarks: (state) => {
      state.bookmarks = []
      state.count = 0
      state.pagination = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBookmarksAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserBookmarksAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookmarks = action.payload.bookmarks
        state.count = action.payload.count
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchUserBookmarksAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearBookmarkError, clearBookmarks } = bookmarkSlice.actions
export default bookmarkSlice.reducer
