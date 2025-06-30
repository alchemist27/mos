import { NextResponse } from 'next/server'
import Cafe24Client from '@/lib/cafe24Client'

export async function GET() {
  try {
    const client = new Cafe24Client()
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    const scope = 'mall.read_category mall.read_product mall.write_product mall.read_order mall.write_order'
    
    const authUrl = client.getAuthUrl(redirectUri, scope)
    
    return NextResponse.json({ authUrl })
  } catch (error: any) {
    console.error('인증 URL 생성 실패:', error)
    return NextResponse.json(
      { error: error.message || '인증 URL 생성 실패' },
      { status: 500 }
    )
  }
} 