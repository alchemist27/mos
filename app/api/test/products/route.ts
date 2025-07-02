import { NextResponse } from 'next/server'
import Cafe24Client from '@/lib/cafe24Client'

export async function GET() {
  try {
    console.log('🛍️ 카페24 상품 목록 조회 테스트 시작')
    
    const client = new Cafe24Client()
    
    // 상품 목록 조회 (기본 10개 제한)
    const products = await client.apiRequest('/api/v2/admin/products?limit=10')
    
    console.log('✅ 카페24 상품 목록 조회 성공:', JSON.stringify(products, null, 2))
    
    return NextResponse.json({
      success: true,
      message: '카페24 상품 목록 조회 성공',
      data: products,
      productCount: products.products?.length || 0,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ 카페24 상품 목록 조회 실패:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST 요청으로 상품 목록 조회 옵션 설정
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      limit = 10, 
      offset = 0, 
      product_name = '',
      category = '',
      display = '',
      selling = ''
    } = body
    
    console.log(`🛍️ 카페24 상품 목록 커스텀 조회: limit=${limit}, offset=${offset}`)
    
    const client = new Cafe24Client()
    
    // 쿼리 파라미터 구성
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    })
    
    if (product_name) params.append('product_name', product_name)
    if (category) params.append('category', category)
    if (display) params.append('display', display)
    if (selling) params.append('selling', selling)
    
    const endpoint = `/api/v2/admin/products?${params.toString()}`
    const products = await client.apiRequest(endpoint)
    
    console.log('✅ 카페24 상품 목록 커스텀 조회 성공')
    
    return NextResponse.json({
      success: true,
      message: '카페24 상품 목록 커스텀 조회 성공',
      data: products,
      productCount: products.products?.length || 0,
      queryParams: Object.fromEntries(params),
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ 카페24 상품 목록 커스텀 조회 실패:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 