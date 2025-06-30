import { NextResponse } from 'next/server'
import { getStoredAccessToken } from '@/lib/tokenStore'

export async function GET() {
  try {
    const token = await getStoredAccessToken()
    
    if (!token) {
      return NextResponse.json({
        valid: false,
        message: '저장된 토큰이 없습니다.'
      })
    }
    
    const timeLeft = token.expires_at - Date.now()
    const minutesLeft = Math.floor(timeLeft / (1000 * 60))
    
    return NextResponse.json({
      valid: true,
      expiresAt: token.expires_at,
      minutesLeft: minutesLeft,
      message: `토큰이 ${minutesLeft}분 후 만료됩니다.`
    })
    
  } catch (error: any) {
    console.error('토큰 상태 확인 실패:', error)
    return NextResponse.json(
      { error: error.message || '토큰 상태 확인 실패' },
      { status: 500 }
    )
  }
} 