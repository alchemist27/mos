import { NextResponse } from 'next/server'
import Cafe24Client from '@/lib/cafe24Client'

export async function POST() {
  try {
    console.log('🔄 토큰 수동 갱신 요청 시작')
    
    const client = new Cafe24Client()
    const tokenData = await client.refreshAccessToken()
    
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toLocaleString('ko-KR')
    console.log(`✅ 토큰 수동 갱신 완료 (만료: ${expiresAt})`)
    
    return NextResponse.json({
      success: true,
      message: '토큰 갱신 완료',
      expiresAt: expiresAt,
      expiresIn: tokenData.expires_in
    })
    
  } catch (error: any) {
    console.error('❌ 토큰 수동 갱신 실패:', error)
    return NextResponse.json(
      { error: error.message || '토큰 갱신 실패' },
      { status: 500 }
    )
  }
} 