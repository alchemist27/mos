import { NextResponse } from 'next/server'
import { getStoredAccessToken, getStoredRefreshToken, isAccessTokenValid, getTokenStoreInfo, cleanupInvalidTokenData } from '@/lib/tokenStore'

export async function GET() {
  try {
    // 잘못된 토큰 데이터 정리
    await cleanupInvalidTokenData()
    
    const accessToken = await getStoredAccessToken()
    const refreshToken = await getStoredRefreshToken()
    const isValid = await isAccessTokenValid()
    const storeInfo = await getTokenStoreInfo()

    // 토큰이 있는 경우 만료까지 남은 시간 계산
    let minutesLeft = null
    let expiresAt = null
    
    if (accessToken && accessToken.expires_at && !isNaN(accessToken.expires_at)) {
      const now = Date.now()
      const timeLeft = accessToken.expires_at - now
      minutesLeft = Math.floor(timeLeft / (1000 * 60))
      expiresAt = accessToken.expires_at
    }

    const status = {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      valid: isValid,
      isValid: isValid, // 호환성을 위해 두 필드 모두 제공
      expiresAt: expiresAt,
      minutesLeft: minutesLeft,
      storeInfo: storeInfo
    }

    console.log('📊 토큰 상태 조회:', status)

    return NextResponse.json(status)
  } catch (error: any) {
    console.error('❌ 토큰 상태 조회 실패:', error)
    return NextResponse.json(
      { 
        error: error.message,
        hasAccessToken: false,
        hasRefreshToken: false,
        valid: false,
        isValid: false
      },
      { status: 500 }
    )
  }
} 