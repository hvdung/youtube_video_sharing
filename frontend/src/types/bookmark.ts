import { Pagination, Video } from './video'

export interface Bookmark {
  id: number
  user_id: number
  video_id: number
  noted?: string | null
  video: Video
}

export interface BookmarkListResponse {
  success: boolean
  bookmarks: Bookmark[]
  count: number
  pagination: Pagination
}

export interface BookmarkMutationResponse {
  success: boolean
  duplicate?: boolean
  message?: string
  bookmark?: Bookmark
}

export interface BookmarkDeleteResponse {
  success: boolean
  message: string
}
