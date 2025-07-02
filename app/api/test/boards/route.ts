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

    const client = new Cafe24Client();
    
    // 게시판에 게시물 업로드
    const endpoint = `/api/v2/admin/boards/${boardNo}/articles`;
    const result = await client.apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    return NextResponse.json({
      success: true,
      data: result,
      endpoint,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('게시물 업로드 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 