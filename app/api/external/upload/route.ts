import { NextRequest, NextResponse } from 'next/server'

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

// 파일 업로드 프록시
export async function POST(request: NextRequest) {
  try {
    // CORS 헤더 포함
    const headers = { ...corsHeaders, 'Content-Type': 'application/json' }

    console.log(`[${new Date().toISOString()}] 📤 파일 업로드 프록시 요청`)

    // 요청 본문을 그대로 Firebase Cloud Function으로 전달
    const body = await request.arrayBuffer()
    const contentType = request.headers.get('content-type') || 'application/octet-stream'

    console.log('📋 요청 정보:')
    console.log('- Content-Type:', contentType)
    console.log('- Body Size:', body.byteLength, 'bytes')
    console.log('- Referer:', request.headers.get('referer'))

    // Firebase Cloud Function 호출
    const firebaseResponse = await fetch('https://us-central1-teejoa-ai.cloudfunctions.net/uploadFile', {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        // 기타 필요한 헤더들 전달
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body: body
    })

    console.log('📥 Firebase 응답:')
    console.log('- Status:', firebaseResponse.status)
    console.log('- Status Text:', firebaseResponse.statusText)

    if (!firebaseResponse.ok) {
      const errorText = await firebaseResponse.text()
      console.error('❌ Firebase 업로드 실패:', errorText)
      
      return NextResponse.json({
        success: false,
        error: `Firebase 업로드 실패: ${firebaseResponse.status} ${firebaseResponse.statusText}`,
        details: errorText,
        timestamp: new Date().toISOString()
      }, { status: firebaseResponse.status, headers })
    }

    // 성공 응답을 그대로 전달
    const responseData = await firebaseResponse.json()
    
    console.log('✅ 파일 업로드 프록시 성공:', responseData)

    return NextResponse.json({
      success: true,
      message: '파일 업로드가 성공적으로 완료되었습니다.',
      data: responseData,
      timestamp: new Date().toISOString()
    }, { headers })

  } catch (error: any) {
    console.error('❌ 파일 업로드 프록시 오류:', error)

    return NextResponse.json({
      success: false,
      error: error.message || '파일 업로드 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString()
    }, { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
} 