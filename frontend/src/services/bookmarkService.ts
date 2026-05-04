import apiClient from '@/lib/apiClient'
import {
  Bookmark,
  BookmarkDeleteResponse,
  BookmarkListResponse,
  BookmarkMutationResponse,
} from '@/types/bookmark'

export const bookmarkService = {
  async getBookmarksByUserId(userId: string, page = 1, query = ''): Promise<BookmarkListResponse> {
    const params: Record<string, unknown> = { page }

    if (query.trim()) {
      params.q = { video_title_cont: query.trim() }
    }

    const response = await apiClient.get(`/users/${userId}/bookmarks`, { params })
    return response.data
  },

  async createBookmark(userId: string, videoId: number, noted: string | null = null): Promise<BookmarkMutationResponse> {
    const response = await apiClient.post(`/users/${userId}/bookmarks`, {
      bookmark: {
        video_id: videoId,
        noted,
      },
    })
    return response.data
  },

  async deleteBookmark(userId: string, bookmarkId: number): Promise<BookmarkDeleteResponse> {
    const response = await apiClient.delete(`/users/${userId}/bookmarks/${bookmarkId}`)
    return response.data
  },

  async findBookmarkByVideoId(userId: string, videoId: number): Promise<Bookmark | null> {
    let page = 1

    while (true) {
      const response = await this.getBookmarksByUserId(userId, page)
      const found = response.bookmarks.find((bookmark) => bookmark.video_id === videoId)

      if (found) return found
      if (!response.pagination?.next_page) return null

      page = response.pagination.next_page
    }
  },
}
