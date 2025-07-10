import { NextRequest, NextResponse } from 'next/server'
import Cafe24Client from '@/lib/cafe24Client'

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 실제 운영시에는 카페24 도메인으로 제한
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

// 외부에서 게시물 등록 API 호출
export async function POST(request: NextRequest) {
  try {
    // CORS 헤더 포함
    const headers = { ...corsHeaders, 'Content-Type': 'application/json' }

    const body = await request.json()
    const { 
      boardNo = '5', // 기본값
      writer,
      title,
      content,
      category = '1',
      writerEmail,
      memberId,
      nickName,
      isSecret = false,
      isNotice = false,
      attachFileUrls = []
    } = body

    // 필수 필드 검증
    if (!writer || !title || !content) {
      return NextResponse.json({
        success: false,
        error: '필수 필드가 누락되었습니다. (writer, title, content)',
        required_fields: ['writer', 'title', 'content']
      }, { status: 400, headers })
    }

    console.log(`[${new Date().toISOString()}] 🌐 외부 게시물 등록 요청:`)
    console.log('- Board No:', boardNo)
    console.log('- Writer:', writer)
    console.log('- Title:', title)
    console.log('- Category:', category)
    console.log('- Attach File URLs:', attachFileUrls)
    console.log('- Referer:', request.headers.get('referer'))
    console.log('- User-Agent:', request.headers.get('user-agent'))

    const client = new Cafe24Client()

    // 카페24 API 요청 데이터 구성
    const requestData: any = {
      "writer": writer,
      "title": title,
      "content": content,
      "client_ip": request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  '127.0.0.1',
      "board_category_no": parseInt(category),
      "secret": isSecret ? "T" : "F",
      "writer_email": writerEmail || "sample@sample.com",
      "member_id": memberId || "external_user",
      "nick_name": nickName || writer,
      "deleted": "F",
      "input_channel": "P",
      "notice": isNotice ? "T" : "F",
      "fixed": "F",
      "reply": "F",
      "reply_mail": "N",
      "reply_user_id": "admin",
      "reply_status": "C"
    }

    // 첨부파일이 있는 경우에만 추가 (빈 배열 전송 방지)
    if (attachFileUrls && attachFileUrls.length > 0) {
      // 첨부파일 URL 유효성 검증 및 카페24 API 형식으로 변환
      const validAttachFiles = attachFileUrls
        .filter((url: string) => 
          url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))
        )
        .map((url: string) => {
          // URL에서 파일명 추출
          const fileName = url.split('/').pop() || 'attachment'
          return {
            name: fileName,
            url: url
          }
        })
      
      if (validAttachFiles.length > 0) {
        requestData.attach_file_urls = validAttachFiles
        console.log('📎 첨부파일 변환 완료:', validAttachFiles)
      }
    }

    const payload = {
      "shop_no": 1,
      "requests": [requestData]
    }

    // 카페24 API 호출 전 최종 payload 로깅
    console.log('📤 카페24 API 최종 요청 데이터:', JSON.stringify(payload, null, 2))
    
    // 카페24 API 호출
    const result = await client.apiRequest(`/api/v2/admin/boards/${boardNo}/articles`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    console.log('✅ 외부 게시물 등록 성공:', result)

    return NextResponse.json({
      success: true,
      message: '게시물이 성공적으로 등록되었습니다.',
      data: result,
      board_no: boardNo,
      category_name: category === '1' ? '견적문의' : '시안요청',
      timestamp: new Date().toISOString()
    }, { headers })

  } catch (error: any) {
    console.error('❌ 외부 게시물 등록 실패:', error)

    const errorResponse = {
      success: false,
      error: error.message || '게시물 등록 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString()
    }

    // 토큰 관련 에러인 경우 더 자세한 정보 제공
    if (error.message?.includes('토큰') || error.message?.includes('인증')) {
      errorResponse.error = '인증 토큰이 만료되었거나 유효하지 않습니다. 관리자에게 문의하세요.'
    }

    return NextResponse.json(errorResponse, { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
} 