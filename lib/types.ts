// 카페24 토큰 관련 타입
export interface Cafe24Token {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  scope: string;
}

export interface StoredToken {
  access_token: string;
  expires_at: number;
}

export interface Cafe24TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface Cafe24ErrorResponse {
  error: string;
  error_description?: string;
} 