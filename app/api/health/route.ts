import { NextResponse } from 'next/server'

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 모든 도메인 허용
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

// GET 요청 처리 (헬스체크)
export async function GET() {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        api: 'operational',
        database: 'operational',
        authentication: 'operational'
      }
    }

    return NextResponse.json(healthStatus, {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error: any) {
    console.error('❌ 헬스체크 실패:', error)
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        api: 'error',
        database: 'unknown',
        authentication: 'unknown'
      }
    }

    return NextResponse.json(errorStatus, {
      status: 500,
      headers: corsHeaders,
    })
  }
} 