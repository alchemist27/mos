'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [tokenStatus, setTokenStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 토큰 상태 확인
  const checkTokenStatus = async () => {
    try {
      const response = await fetch('/api/token/status')
      const data = await response.json()
      setTokenStatus(data)
    } catch (error) {
      console.error('토큰 상태 확인 실패:', error)
    }
  }

  // 카페24 인증 시작
  const startAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/url')
      const data = await response.json()
      
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        alert('인증 URL 생성 실패')
      }
    } catch (error) {
      alert('인증 시작 실패')
    } finally {
      setLoading(false)
    }
  }

  // 토큰 수동 갱신
  const refreshToken = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/token/refresh', { method: 'POST' })
      const data = await response.json()
      
      if (response.ok) {
        alert('토큰 갱신 성공')
        checkTokenStatus()
      } else {
        alert(`토큰 갱신 실패: ${data.error}`)
      }
    } catch (error) {
      alert('토큰 갱신 실패')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkTokenStatus()
  }, [])

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>
          🏪 MOS - 카페24 Admin API
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          카페24 Admin API 토큰 관리 및 자동 갱신 시스템
        </p>

        {/* 토큰 상태 표시 */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>📊 토큰 상태</h3>
          {tokenStatus ? (
            tokenStatus.valid ? (
              <div style={{ color: '#28a745' }}>
                ✅ 토큰 유효 (만료까지 {tokenStatus.minutesLeft}분 남음)
                <br />
                <small>만료 시간: {new Date(tokenStatus.expiresAt).toLocaleString('ko-KR')}</small>
              </div>
            ) : (
              <div style={{ color: '#dc3545' }}>
                ❌ 토큰 없음 또는 만료됨
              </div>
            )
          ) : (
            <div style={{ color: '#6c757d' }}>
              ⏳ 토큰 상태 확인 중...
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={startAuth}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            🔐 카페24 인증 시작
          </button>

          <button 
            onClick={refreshToken}
            disabled={loading || !tokenStatus?.valid}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (loading || !tokenStatus?.valid) ? 'not-allowed' : 'pointer',
              opacity: (loading || !tokenStatus?.valid) ? 0.6 : 1
            }}
          >
            🔄 토큰 수동 갱신
          </button>

          <button 
            onClick={checkTokenStatus}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            📊 상태 새로고침
          </button>
        </div>

        {/* 정보 섹션 */}
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <h4 style={{ color: '#333' }}>ℹ️ 시스템 정보</h4>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>토큰은 자동으로 30분마다 상태 확인됩니다</li>
            <li>만료 10분 전에 자동으로 갱신됩니다</li>
            <li>토큰 정보는 로컬 파일에 안전하게 저장됩니다</li>
            <li>매일 자정에 토큰 상태가 로그에 기록됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
