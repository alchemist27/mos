import { type NextRequest, NextResponse } from 'next/server'
import Cafe24Client from '@/lib/cafe24Client'
import { saveAccessToken, saveRefreshToken } from '@/lib/tokenStore'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code가 없습니다.' },
      { status: 400 }
    )
  }

  try {
    console.log(`[${new Date().toISOString()}] 📝 카페24 인증 콜백 처리 시작`)
    
    const client = new Cafe24Client()
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    
    // Authorization Code로 토큰 발급
    const tokenData = await client.getTokenFromCode(code, redirectUri)
    
    // 토큰 저장
    await saveAccessToken(tokenData.access_token, tokenData.expires_in)
    await saveRefreshToken(tokenData.refresh_token)
    
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toLocaleString('ko-KR')
    console.log(`✅ 토큰 발급 및 저장 완료 (만료: ${expiresAt})`)
    
    // 성공 페이지로 리디렉션
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}?success=true`
    return NextResponse.redirect(successUrl)
    
  } catch (error: any) {
    console.error('❌ 인증 콜백 처리 실패:', error)
    
    // 에러 페이지로 리디렉션
    const errorUrl = `${process.env.NEXT_PUBLIC_APP_URL}?error=${encodeURIComponent(error.message)}`
    return NextResponse.redirect(errorUrl)
  }
} 