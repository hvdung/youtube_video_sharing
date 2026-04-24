export interface Video {
  id: number
  url: string
  youtube_id: string
  title: string
  description?: string
  thumbnail_url?: string
  user_email?: string
  user_id: number
  created_at: string
  updated_at: string
}

export interface Pagination {
  current_page: number
  total_pages: number
  total_count: number
  per_page: number
  next_page: number | null
  prev_page: number | null
}

export interface VideoListResponse {
  success: boolean
  videos: Video[]
  count: number
  pagination: Pagination
}
