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

    // FormData에서 파일과 파일명 추출
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string || file?.name || 'unnamed_file'

    if (!file) {
      return NextResponse.json({
        success: false,
        error: '파일이 업로드되지 않았습니다.',
        timestamp: new Date().toISOString()
      }, { status: 400, headers })
    }

    console.log('📋 요청 정보:')
    console.log('- File Name:', fileName)
    console.log('- File Size:', file.size, 'bytes')
    console.log('- File Type:', file.type)
    console.log('- Referer:', request.headers.get('referer'))

    // 파일을 Base64로 변환
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    // Firebase Cloud Function에 맞는 형식으로 변환
    const firebasePayload = {
      fileName: fileName,
      base64Data: base64Data
    }

    console.log('📤 Firebase 요청 데이터:')
    console.log('- fileName:', fileName)
    console.log('- base64Data length:', base64Data.length)

    // Firebase Cloud Function 호출
    const firebaseResponse = await fetch('https://us-central1-tijuri-admin.cloudfunctions.net/uploadFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 기타 필요한 헤더들 전달
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(firebasePayload)
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