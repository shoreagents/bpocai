export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  location: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface SignUpData {
  firstName: string
  lastName: string
  email: string
  location: string
  password: string
  confirmPassword: string
}

export interface UserMetadata {
  first_name: string
  last_name: string
  full_name: string
  location: string
  avatar_url?: string
} 