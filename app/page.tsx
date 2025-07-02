'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [tokenStatus, setTokenStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 토큰 상태 확인
  const checkTokenStatus = async () => {
    try {
      setError(null)
      const response = await fetch('/api/token/status')
      const data = await response.json()
      
      if (data.storeInfo?.permissionDenied) {
        setError('Firebase 권한 오류: Firestore 보안 규칙을 확인하세요.')
      } else if (data.storeInfo?.configError) {
        setError('Firebase 설정 오류: 환경변수를 확인하세요.')
      }
      
      setTokenStatus(data)
    } catch (error) {
      console.error('토큰 상태 확인 실패:', error)
      setError('토큰 상태 확인 중 오류가 발생했습니다.')
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

  // 카페24 API 테스트
  const testApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      
      if (response.ok) {
        alert(`API 테스트 성공!\n\n쇼핑몰: ${data.data?.shop?.shop_name || '정보 없음'}\n응답 시간: ${data.timestamp}`)
        console.log('카페24 API 응답:', data)
      } else {
        alert(`API 테스트 실패: ${data.error}`)
      }
    } catch (error) {
      alert('API 테스트 실패')
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

        {/* 에러 메시지 표시 */}
        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24',
            padding: '1rem', 
            borderRadius: '4px',
            marginBottom: '2rem',
            border: '1px solid #f5c6cb'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>🚫 오류 발생</h4>
            <p style={{ margin: 0 }}>{error}</p>
            {error.includes('Firebase 권한') && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <strong>해결 방법:</strong>
                <ol style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1rem' }}>
                  <li>Firebase Console → Firestore Database → Rules로 이동</li>
                  <li>다음 규칙을 추가하세요:</li>
                </ol>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                  overflow: 'auto'
                }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cafe24_tokens/{document} {
      allow read, write: if true;
    }
  }
}`}
                </pre>
              </div>
            )}
            {error.includes('Firebase 설정') && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <strong>해결 방법:</strong>
                <ol style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1rem' }}>
                  <li>Vercel Dashboard → Project Settings → Environment Variables로 이동</li>
                  <li>다음 환경변수들을 설정하세요:</li>
                </ol>
                <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1rem', fontSize: '0.8rem' }}>
                  <li>FIREBASE_API_KEY</li>
                  <li>FIREBASE_AUTH_DOMAIN</li>
                  <li>FIREBASE_PROJECT_ID</li>
                  <li>FIREBASE_STORAGE_BUCKET</li>
                  <li>FIREBASE_MESSAGING_SENDER_ID</li>
                  <li>FIREBASE_APP_ID</li>
                </ul>
              </div>
            )}
          </div>
        )}

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

          <button 
            onClick={testApi}
            disabled={loading || !tokenStatus?.valid}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (loading || !tokenStatus?.valid) ? 'not-allowed' : 'pointer',
              opacity: (loading || !tokenStatus?.valid) ? 0.6 : 1
            }}
          >
            🧪 API 테스트
          </button>
        </div>

        {/* 추가 기능 */}
        {tokenStatus?.valid && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a 
              href="/test" 
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#ffc107',
                color: '#212529',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              🧪 상세 API 테스트 페이지로 이동
            </a>
          </div>
        )}

        {/* 정보 섹션 */}
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <h4 style={{ color: '#333' }}>ℹ️ 시스템 정보</h4>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>API 요청 시 토큰 만료 5분 전에 자동 갱신됩니다</li>
            <li>백그라운드에서 6시간마다 토큰 상태를 확인합니다</li>
            <li>토큰 정보는 Firebase Firestore에 안전하게 저장됩니다</li>
            <li>매일 자정에 토큰 상태가 로그에 기록됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
