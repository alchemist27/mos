import { promises as fs } from 'fs';
import path from 'path';
import { StoredToken } from './types';

// Vercel 서버리스 환경에서는 /tmp 디렉토리만 쓰기 가능
const TOKEN_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/tokens' 
  : (process.env.TOKEN_STORE_PATH || './tokens');
const ACCESS_TOKEN_FILE = path.join(TOKEN_DIR, 'access_token.json');
const REFRESH_TOKEN_FILE = path.join(TOKEN_DIR, 'refresh_token.json');

// 토큰 디렉토리 생성
async function ensureTokenDir() {
  try {
    await fs.mkdir(TOKEN_DIR, { recursive: true });
    console.log(`📁 토큰 디렉토리 확인/생성: ${TOKEN_DIR}`);
  } catch (error: any) {
    console.error('토큰 디렉토리 생성 실패:', error);
    throw error;
  }
}

// Access Token 저장
export async function saveAccessToken(accessToken: string, expiresIn: number): Promise<void> {
  try {
    await ensureTokenDir();
    
    const tokenData: StoredToken = {
      access_token: accessToken,
      expires_at: Date.now() + (expiresIn * 1000)
    };

    await fs.writeFile(ACCESS_TOKEN_FILE, JSON.stringify(tokenData, null, 2));
    const expiresAt = new Date(tokenData.expires_at).toLocaleString('ko-KR');
    console.log(`✅ Access Token 저장 완료 (만료: ${expiresAt})`);
    console.log(`📁 저장 위치: ${ACCESS_TOKEN_FILE}`);
  } catch (error: any) {
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
    
    const expiresAt = new Date(tokenData.expires_at).toLocaleString('ko-KR');
    console.log(`✅ Access Token 조회 성공 (만료: ${expiresAt})`);
    return tokenData;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('ℹ️ Access Token 파일 없음');
    } else {
      console.error('❌ Access Token 조회 실패:', error);
    }
    return null;
  }
}

// Refresh Token 저장
export async function saveRefreshToken(refreshToken: string): Promise<void> {
  try {
    await ensureTokenDir();
    
    await fs.writeFile(REFRESH_TOKEN_FILE, JSON.stringify({ refresh_token: refreshToken }, null, 2));
    console.log('✅ Refresh Token 저장 완료');
    console.log(`📁 저장 위치: ${REFRESH_TOKEN_FILE}`);
  } catch (error: any) {
    console.error('❌ Refresh Token 저장 실패:', error);
    throw error;
  }
}

// Refresh Token 조회
export async function getStoredRefreshToken(): Promise<string | null> {
  try {
    const data = await fs.readFile(REFRESH_TOKEN_FILE, 'utf-8');
    const tokenData = JSON.parse(data);
    console.log('✅ Refresh Token 조회 성공');
    return tokenData.refresh_token;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('ℹ️ Refresh Token 파일 없음');
    } else {
      console.error('❌ Refresh Token 조회 실패:', error);
    }
    return null;
  }
}

// 토큰 유효성 검사
export async function isAccessTokenValid(): Promise<boolean> {
  const token = await getStoredAccessToken();
  return token !== null;
}

// 디버깅용: 토큰 디렉토리 정보 출력
export async function getTokenStoreInfo(): Promise<any> {
  try {
    const stats = await fs.stat(TOKEN_DIR);
    const files = await fs.readdir(TOKEN_DIR);
    return {
      directory: TOKEN_DIR,
      exists: true,
      isDirectory: stats.isDirectory(),
      files: files,
      accessTokenExists: files.includes('access_token.json'),
      refreshTokenExists: files.includes('refresh_token.json')
    };
  } catch (error: any) {
    return {
      directory: TOKEN_DIR,
      exists: false,
      error: error.message
    };
  }
} 