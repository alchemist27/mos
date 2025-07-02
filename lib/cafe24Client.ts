import { Cafe24TokenResponse, Cafe24ErrorResponse } from './types';
import { getStoredAccessToken, saveAccessToken, getStoredRefreshToken, saveRefreshToken } from './tokenStore';

class Cafe24Client {
  private mallId: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.mallId = process.env.CAFE24_MALL_ID || '';
    this.clientId = process.env.CAFE24_CLIENT_ID || '';
    this.clientSecret = process.env.CAFE24_CLIENT_SECRET || '';

    if (!this.mallId || !this.clientId || !this.clientSecret) {
      throw new Error('카페24 환경변수가 설정되지 않았습니다.');
    }
  }

  // 인증 URL 생성
  getAuthUrl(redirectUri: string, scope: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: redirectUri,
      state: this.mallId,
      scope: scope
    });

    return `https://${this.mallId}.cafe24api.com/api/v2/oauth/authorize?${params.toString()}`;
  }

  // Authorization Code로 토큰 발급
  async getTokenFromCode(code: string, redirectUri: string): Promise<Cafe24TokenResponse> {
    const tokenUrl = `https://${this.mallId}.cafe24api.com/api/v2/oauth/token`;
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
    };

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    });

    console.log(`🔗 카페24 토큰 요청:
- URL: ${tokenUrl}
- Grant Type: authorization_code
- Redirect URI: ${redirectUri}`);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers,
      body
    });

    const data = await response.json();

    console.log(`📥 카페24 토큰 응답:
- Status: ${response.status}
- Response: ${JSON.stringify(data, null, 2)}`);

    if (!response.ok) {
      throw new Error(`토큰 발급 실패: ${data.error_description || data.error}`);
    }

    // expires_in 값 검증
    if (!data.expires_in || isNaN(data.expires_in)) {
      console.warn(`⚠️ 카페24에서 받은 expires_in 값이 잘못됨: ${data.expires_in}`);
      data.expires_in = 7200; // 기본값 2시간
    }

    return data;
  }

  // Refresh Token으로 Access Token 갱신
  async refreshAccessToken(): Promise<Cafe24TokenResponse> {
    const refreshToken = await getStoredRefreshToken();
    
    if (!refreshToken) {
      throw new Error('Refresh Token이 없습니다.');
    }

    const tokenUrl = `https://${this.mallId}.cafe24api.com/api/v2/oauth/token`;
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
    };

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers,
      body
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`토큰 갱신 실패: ${data.error_description || data.error}`);
    }

    // 새 토큰들 저장
    await saveAccessToken(data.access_token, data.expires_in);
    
    if (data.refresh_token) {
      await saveRefreshToken(data.refresh_token);
    }

    return data;
  }

  // 유효한 Access Token 가져오기 (자동 갱신 포함)
  async getValidAccessToken(): Promise<string> {
    let token = await getStoredAccessToken();

    // 토큰이 없거나 만료된 경우 갱신 시도
    if (!token) {
      console.log('🔄 Access Token 갱신 시도...');
      try {
        const refreshedToken = await this.refreshAccessToken();
        return refreshedToken.access_token;
      } catch (error) {
        throw new Error('토큰 갱신 실패: 재인증이 필요합니다.');
      }
    }

    // 토큰이 5분 이내에 만료되는 경우 미리 갱신
    const timeLeft = token.expires_at - Date.now();
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    
    if (minutesLeft <= 5) {
      console.log(`🔄 토큰이 ${minutesLeft}분 후 만료됩니다. 미리 갱신합니다...`);
      try {
        const refreshedToken = await this.refreshAccessToken();
        return refreshedToken.access_token;
      } catch (error) {
        console.warn('⚠️ 토큰 미리 갱신 실패, 기존 토큰 사용:', error);
        // 갱신 실패해도 기존 토큰이 아직 유효하면 사용
        return token.access_token;
      }
    }

    return token.access_token;
  }

  // 카페24 API 요청 (자동 토큰 갱신 포함)
  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const accessToken = await this.getValidAccessToken();
    
    const url = `https://${this.mallId}.cafe24api.com${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Cafe24-Api-Version': '2025-06-01', // 카페24 API 버전 (최신 버전)
      ...options.headers
    };

    console.log(`🚀 카페24 API 요청:
- URL: ${url}
- Method: ${options.method || 'GET'}
- Headers: ${JSON.stringify(headers, null, 2)}
- Body: ${options.body || 'N/A'}`);

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    console.log(`📥 카페24 API 응답:
- Status: ${response.status} ${response.statusText}
- Response: ${JSON.stringify(data, null, 2)}`);

    // 토큰 만료 에러인 경우 갱신 후 재시도
    if (response.status === 401 && data.error === 'invalid_token') {
      console.log('🔄 토큰 만료로 인한 재시도...');
      
      const newAccessToken = await this.refreshAccessToken();
      const newHeaders = {
        ...headers,
        'Authorization': `Bearer ${newAccessToken.access_token}`,
        'X-Cafe24-Api-Version': '2025-06-01'
      };

      const retryResponse = await fetch(url, {
        ...options,
        headers: newHeaders
      });

      const retryData = await retryResponse.json();
      
      console.log(`🔄 재시도 응답:
- Status: ${retryResponse.status} ${retryResponse.statusText}
- Response: ${JSON.stringify(retryData, null, 2)}`);

      return retryData;
    }

    if (!response.ok) {
      // 더 자세한 오류 정보 포함
      const errorMessage = `API 요청 실패: ${response.status} ${response.statusText}`;
      const detailedError = new Error(errorMessage);
      (detailedError as any).response = {
        status: response.status,
        statusText: response.statusText,
        data: data,
        url: url,
        method: options.method || 'GET'
      };
      throw detailedError;
    }

    return data;
  }
}

export default Cafe24Client; 