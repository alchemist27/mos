import { type NextRequest, NextResponse } from "next/server"
import { saveAccessToken, getStoredAccessToken } from "@/lib/tokenStore"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accessToken, expiresIn = 7200 } = body // 초 단위 기본값 2시간

    if (!accessToken) {
      return NextResponse.json({ error: "액세스 토큰이 필요합니다." }, { status: 400 })
    }

    await saveAccessToken(accessToken, expiresIn)

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toLocaleTimeString("ko-KR")
    console.log(`✅ Access Token 저장됨 (만료 시각: ${expiresAt})`)

    return NextResponse.json({
      success: true,
      message: "Access Token 저장 완료",
      expires_at: expiresAt,
    })
  } catch (error: any) {
    console.error("❌ Access Token 저장 오류:", error)
    return NextResponse.json({ error: error.message || "토큰 저장 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET() {
  try {
    const token = await getStoredAccessToken()

    if (!token?.access_token || !token.expires_at) {
      return NextResponse.json({ error: "토큰이 저장되어 있지 않습니다." }, { status: 404 })
    }

    const timeLeftMs = token.expires_at - Date.now()
    const minLeft = Math.floor(timeLeftMs / 60000)

    return NextResponse.json({
      access_token: token.access_token,
      expires_at: new Date(token.expires_at).toISOString(),
      minutes_left: minLeft,
    })
  } catch (error: any) {
    console.error("❌ Access Token 조회 오류:", error)
    return NextResponse.json({ error: error.message || "토큰 조회 오류" }, { status: 500 })
  }
}
