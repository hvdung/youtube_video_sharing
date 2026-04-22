import apiClient from '@/lib/apiClient'
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth'
import { AxiosResponse } from 'axios'

export const authService = {
  async login(credentials: LoginRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/login', {
      user: credentials,
    })

    const accessToken = response.headers['authorization']?.replace('Bearer ', '') || ''
    const refreshToken = response.data.refresh_token

    return {
      user: response.data.user,
      accessToken,
      refreshToken,
    }
  },

  async register(data: RegisterRequest): Promise<{ user: User }> {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/signup', {
      user: data,
    })
    return { user: response.data.user }
  },

  async logout(): Promise<void> {
    await apiClient.delete('/logout')
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/me')
    return response.data.user
  },
}
