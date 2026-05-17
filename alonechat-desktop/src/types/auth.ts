export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface APIError {
  detail: string
  status_code: number
}
