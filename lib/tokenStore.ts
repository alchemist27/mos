import { promises as fs } from 'fs';
import path from 'path';
import { StoredToken } from './types';

const TOKEN_DIR = process.env.TOKEN_STORE_PATH || './tokens';
const ACCESS_TOKEN_FILE = path.join(TOKEN_DIR, 'access_token.json');
const REFRESH_TOKEN_FILE = path.join(TOKEN_DIR, 'refresh_token.json');

// 토큰 디렉토리 생성
async function ensureTokenDir() {
  try {
    await fs.mkdir(TOKEN_DIR, { recursive: true });
  } catch (error) {
    console.error('토큰 디렉토리 생성 실패:', error);
  }
}

// Access Token 저장
export async function saveAccessToken(accessToken: string, expiresIn: number): Promise<void> {
  await ensureTokenDir();
  
  const tokenData: StoredToken = {
    access_token: accessToken,
    expires_at: Date.now() + (expiresIn * 1000)
  };

  try {
    await fs.writeFile(ACCESS_TOKEN_FILE, JSON.stringify(tokenData, null, 2));
    console.log('✅ Access Token 저장 완료');
  } catch (error) {
    console.error('❌ Access Token 저장 실패:', error);
    throw error;
  }
}

// Access Token 조회
export async function getStoredAccessToken(): Promise<StoredToken | null> {
  try {
    const data = await fs.readFile(ACCESS_TOKEN_FILE, 'utf-8');
    const tokenData: StoredToken = JSON.parse(data);
    
    // 토큰 만료 확인
    if (Date.now() >= tokenData.expires_at) {
      console.log('⚠️ Access Token 만료됨');
      return null;
    }
    
    return tokenData;
  } catch (error) {
    console.log('ℹ️ Access Token 없음');
    return null;
  }
}

// Refresh Token 저장
export async function saveRefreshToken(refreshToken: string): Promise<void> {
  await ensureTokenDir();
  
  try {
    await fs.writeFile(REFRESH_TOKEN_FILE, JSON.stringify({ refresh_token: refreshToken }, null, 2));
    console.log('✅ Refresh Token 저장 완료');
  } catch (error) {
    console.error('❌ Refresh Token 저장 실패:', error);
    throw error;
  }
}

// Refresh Token 조회
export async function getStoredRefreshToken(): Promise<string | null> {
  try {
    const data = await fs.readFile(REFRESH_TOKEN_FILE, 'utf-8');
    const tokenData = JSON.parse(data);
    return tokenData.refresh_token;
  } catch (error) {
    console.log('ℹ️ Refresh Token 없음');
    return null;
  }
}

// 토큰 유효성 검사
export async function isAccessTokenValid(): Promise<boolean> {
  const token = await getStoredAccessToken();
  return token !== null;
} 