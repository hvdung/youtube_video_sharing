export interface User {
  id: number
  email: string
  name: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  message: string
  user: User
  refresh_token: string
}

export interface RefreshResponse {
  message: string
  refresh_token: string
  user: User
}
