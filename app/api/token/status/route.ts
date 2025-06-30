import { NextResponse } from 'next/server'
import { getStoredAccessToken, getStoredRefreshToken, isAccessTokenValid, getTokenStoreInfo } from '@/lib/tokenStore'

export async function GET() {
  try {
    const accessToken = await getStoredAccessToken()
    const refreshToken = await getStoredRefreshToken()
    const isValid = await isAccessTokenValid()
    const storeInfo = await getTokenStoreInfo()

    const status = {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isValid: isValid,
      expiresAt: accessToken ? new Date(accessToken.expires_at).toLocaleString('ko-KR') : null,
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
        isValid: false
      },
      { status: 500 }
    )
  }
} 