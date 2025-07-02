import { NextRequest, NextResponse } from 'next/server';
import Cafe24Client from '../../../../lib/cafe24Client';

export async function POST(request: NextRequest) {
  try {
    const { boardNo, data } = await request.json();
    
    if (!boardNo) {
      return NextResponse.json({
        success: false,
        error: 'board_no가 필요합니다.',
        timestamp: new Date().toISOString()
      });
    }

    console.log('🔍 게시물 업로드 요청 데이터:', JSON.stringify(data, null, 2));

    const client = new Cafe24Client();
    
    // 게시판에 게시물 업로드
    const endpoint = `/api/v2/admin/boards/${boardNo}/articles`;
    
    console.log(`📤 카페24 API 요청:
- Endpoint: ${endpoint}
- Method: POST
- Data: ${JSON.stringify(data, null, 2)}`);
    
    const result = await client.apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    console.log('✅ 카페24 API 응답 성공:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      data: result,
      endpoint,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ 게시물 업로드 API 오류:', error);
    console.error('❌ 오류 스택:', error.stack);
    
    // 더 자세한 오류 정보 반환
    return NextResponse.json({
      success: false,
      error: error.message,
      errorDetails: error.response?.data || error.response || null,
      requestData: request.body,
      timestamp: new Date().toISOString()
    });
  }
} 