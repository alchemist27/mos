import { NextResponse } from 'next/server'
import Cafe24Client from '@/lib/cafe24Client'

export async function GET() {
  try {
    console.log('🧪 카페24 Admin API 테스트 시작')
    
    const client = new Cafe24Client()
    
    // 기본적인 쇼핑몰 정보 조회 테스트
    const shopInfo = await client.apiRequest('/api/v2/admin/shop')
    
    console.log('✅ 카페24 API 테스트 성공:', JSON.stringify(shopInfo, null, 2))
    
    return NextResponse.json({
      success: true,
      message: '카페24 Admin API 테스트 성공',
      data: shopInfo,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ 카페24 API 테스트 실패:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST 요청으로 특정 API 엔드포인트 테스트
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { endpoint = '/api/v2/admin/shop', method = 'GET' } = body
    
    console.log(`🧪 카페24 Admin API 커스텀 테스트: ${method} ${endpoint}`)
    
    const client = new Cafe24Client()
    
    const options: RequestInit = {
      method: method
    }
    
    if (method !== 'GET' && body.data) {
      options.body = JSON.stringify(body.data)
    }
    
    const result = await client.apiRequest(endpoint, options)
    
    console.log('✅ 카페24 API 커스텀 테스트 성공:', JSON.stringify(result, null, 2))
    
    return NextResponse.json({
      success: true,
      message: `카페24 Admin API ${method} ${endpoint} 테스트 성공`,
      data: result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ 카페24 API 커스텀 테스트 실패:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 