import { type NextRequest, NextResponse } from 'next/server'
import Cafe24Client from '@/lib/cafe24Client'
import { saveAccessToken, saveRefreshToken, getStoredAccessToken, getStoredRefreshToken } from '@/lib/tokenStore'

async function handleCallback(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  // 디버깅을 위한 상세 로깅
  console.log(`[${new Date().toISOString()}] 📝 카페24 콜백 수신 (${request.method}):`)
  console.log('- URL:', request.url)
  console.log('- code:', code ? '✅ 있음' : '❌ 없음')
  console.log('- state:', state)
  console.log('- error:', error)
  console.log('- error_description:', errorDescription)
  console.log('- 모든 파라미터:', Object.fromEntries(url.searchParams))

  // 카페24에서 에러를 반환한 경우
  if (error) {
    const errorMsg = errorDescription || error
    console.error('❌ 카페24 인증 에러:', errorMsg)
    const errorUrl = `https://mos-omega.vercel.app?error=${encodeURIComponent(errorMsg)}`
    return NextResponse.redirect(errorUrl)
  }

  if (!code) {
    console.error('❌ Authorization code가 없습니다. 받은 파라미터:', Object.fromEntries(url.searchParams))
    return NextResponse.json(
      { 
        error: 'Authorization code가 없습니다.',
        received_params: Object.fromEntries(url.searchParams),
        help: '카페24 인증 과정에서 code 파라미터가 전달되지 않았습니다. 카페24 앱 설정을 확인해주세요.',
        debug_info: {
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers.entries())
        }
      },
      { status: 400 }
    )
  }

  try {
    console.log(`[${new Date().toISOString()}] 📝 카페24 인증 콜백 처리 시작`)
    
    const client = new Cafe24Client()
    // 배포된 URL을 직접 사용 (환경변수 undefined 문제 해결)
    const redirectUri = process.env.CAFE24_REDIRECT_URI || 'https://mos-omega.vercel.app/api/auth/callback'
    
    console.log('🔗 사용할 redirect_uri:', redirectUri)
    
    // Authorization Code로 토큰 발급
    console.log('🔄 토큰 발급 요청 중...')
    const tokenData = await client.getTokenFromCode(code, redirectUri)
    console.log('✅ 토큰 발급 완료:', {
      access_token: tokenData.access_token ? `${tokenData.access_token.substring(0, 20)}...` : 'null',
      refresh_token: tokenData.refresh_token ? `${tokenData.refresh_token.substring(0, 20)}...` : 'null',
      expires_in: tokenData.expires_in
    })
    
    // 토큰 저장
    console.log('💾 토큰 저장 시작...')
    await saveAccessToken(tokenData.access_token, tokenData.expires_in)
    console.log('✅ Access Token 저장 완료')
    
    await saveRefreshToken(tokenData.refresh_token)
    console.log('✅ Refresh Token 저장 완료')
    
    // 저장된 토큰 검증
    console.log('🔍 저장된 토큰 검증 중...')
    const storedAccessToken = await getStoredAccessToken()
    const storedRefreshToken = await getStoredRefreshToken()
    
    if (!storedAccessToken) {
      console.error('❌ Access Token 저장 검증 실패')
      const errorUrl = `https://mos-omega.vercel.app?error=${encodeURIComponent('토큰 저장 검증 실패')}`
      return NextResponse.redirect(errorUrl)
    }
    
    if (!storedRefreshToken) {
      console.error('❌ Refresh Token 저장 검증 실패')
      const errorUrl = `https://mos-omega.vercel.app?error=${encodeURIComponent('Refresh Token 저장 검증 실패')}`
      return NextResponse.redirect(errorUrl)
    }
    
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toLocaleString('ko-KR')
    console.log(`✅ 토큰 발급, 저장 및 검증 완료 (만료: ${expiresAt})`)
    console.log('🔍 저장된 토큰 정보:', {
      access_token_length: storedAccessToken.access_token.length,
      expires_at: new Date(storedAccessToken.expires_at).toLocaleString('ko-KR'),
      refresh_token_length: storedRefreshToken.length,
      minutes_until_expiry: Math.floor((storedAccessToken.expires_at - Date.now()) / (1000 * 60))
    })
    
    // 성공 페이지로 리디렉션
    const successUrl = 'https://mos-omega.vercel.app?success=true'
    console.log('🔄 성공 페이지로 리디렉션:', successUrl)
    return NextResponse.redirect(successUrl)
    
  } catch (error: any) {
    console.error('❌ 인증 콜백 처리 실패:', error)
    console.error('❌ 에러 스택:', error.stack)
    
    // 에러 페이지로 리디렉션
    const errorUrl = `https://mos-omega.vercel.app?error=${encodeURIComponent(error.message)}`
    return NextResponse.redirect(errorUrl)
  }
}

export async function GET(request: NextRequest) {
  return handleCallback(request)
}

export async function POST(request: NextRequest) {
  return handleCallback(request)
} 