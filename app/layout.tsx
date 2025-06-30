export const metadata = {
    title: 'MOS - 카페24 Admin API',
    description: 'MOS 카페24 Admin API 토큰 관리 시스템',
  }
  
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="ko">
        <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
          {children}
        </body>
      </html>
    )
  }
  