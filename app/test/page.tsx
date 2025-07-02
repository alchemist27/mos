'use client'

import { useState } from 'react'

export default function TestPage() {
  // 게시물 폼 상태
  const [formData, setFormData] = useState({
    writer: '',
    title: '',
    content: '',
    writerEmail: '',
    memberId: '',
    nickName: '',
    isSecret: false,
    isNotice: false
  })
  
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)

  // 폼 데이터 업데이트
  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 게시물 업로드 함수
  const uploadBoardArticle = async () => {
    // 필수 필드 검증
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.')
      return
    }
    if (!formData.writer.trim()) {
      alert('작성자를 입력해주세요.')
      return
    }

    setLoading(true)
    setResponse(null)
    
    try {
      const payload = {
        "shop_no": 1,
        "requests": [
          {
            "writer": formData.writer,
            "title": formData.title,
            "content": formData.content,
            "client_ip": "127.0.0.1",
            "board_category_no": 1,
            "secret": formData.isSecret ? "T" : "F",
            "writer_email": formData.writerEmail || "user@example.com",
            "member_id": formData.memberId || "user",
            "nick_name": formData.nickName || formData.writer,
            "deleted": "F",
            "input_channel": "P",
            "notice": formData.isNotice ? "T" : "F",
            "fixed": "F",
            "reply": "F",
            "reply_mail": "N"
          }
        ]
      }
      
      const res = await fetch('/api/test/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          boardNo: '5',
          data: payload
        })
      })
      
      const data = await res.json()
      setResponse(data)
      
      // 성공시 폼 초기화
      if (data.success) {
        setFormData({
          writer: '',
          title: '',
          content: '',
          writerEmail: '',
          memberId: '',
          nickName: '',
          isSecret: false,
          isNotice: false
        })
      }
      
    } catch (error: any) {
      setResponse({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

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
        <h1 style={{ color: '#333', marginBottom: '0.5rem', textAlign: 'center' }}>
          📝 게시물 작성
        </h1>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '2rem' }}>
          5번 게시판에 새로운 게시물을 작성하세요
        </p>
        
        <div style={{ marginBottom: '2rem' }}>
          <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
            ← 메인으로 돌아가기
          </a>
        </div>

        {/* 게시물 작성 폼 */}
        <div style={{ marginBottom: '2rem' }}>
          {/* 작성자 (필수) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              작성자 <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.writer}
              onChange={(e) => updateFormData('writer', e.target.value)}
              style={{
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                width: '100%',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="작성자 이름을 입력하세요"
            />
          </div>

          {/* 제목 (필수) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              제목 <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              style={{
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                width: '100%',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="게시물 제목을 입력하세요"
            />
          </div>

          {/* 내용 (필수) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              내용 <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => updateFormData('content', e.target.value)}
              style={{
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                width: '100%',
                height: '200px',
                fontSize: '1rem',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
              placeholder="게시물 내용을 입력하세요"
            />
          </div>

          {/* 선택 항목들 */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem' 
          }}>
            <h4 style={{ color: '#333', marginBottom: '1rem', marginTop: 0 }}>선택 정보</h4>
            
            {/* 이메일 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                이메일
              </label>
              <input
                type="email"
                value={formData.writerEmail}
                onChange={(e) => updateFormData('writerEmail', e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                placeholder="작성자 이메일 (선택사항)"
              />
            </div>

            {/* 닉네임 */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                닉네임
              </label>
              <input
                type="text"
                value={formData.nickName}
                onChange={(e) => updateFormData('nickName', e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                placeholder="닉네임 (선택사항, 미입력시 작성자명 사용)"
              />
            </div>

            {/* 회원 ID */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                회원 ID
              </label>
              <input
                type="text"
                value={formData.memberId}
                onChange={(e) => updateFormData('memberId', e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                placeholder="회원 ID (선택사항)"
              />
            </div>

            {/* 체크박스 옵션들 */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isSecret}
                  onChange={(e) => updateFormData('isSecret', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ color: '#333' }}>비밀글로 설정</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isNotice}
                  onChange={(e) => updateFormData('isNotice', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ color: '#333' }}>공지사항으로 설정</span>
              </label>
            </div>
          </div>

          {/* 등록 버튼 */}
          <button
            onClick={uploadBoardArticle}
            disabled={loading}
            style={{
              padding: '1rem 2rem',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              width: '100%',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '⏳ 등록 중...' : '📝 게시물 등록'}
          </button>
        </div>

        {/* 응답 결과 */}
        {response && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: response.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${response.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h4 style={{ 
                color: response.success ? '#155724' : '#721c24',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                {response.success ? '✅ 게시물이 성공적으로 등록되었습니다!' : '❌ 게시물 등록에 실패했습니다'}
              </h4>
              {response.success && (
                <p style={{ margin: 0, color: '#155724' }}>
                  게시물이 5번 게시판에 등록되었습니다.
                </p>
              )}
            </div>
            
            {/* 상세 응답 (개발자용) */}
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', color: '#666', fontSize: '0.9rem' }}>
                상세 응답 보기 (개발자용)
              </summary>
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '1rem',
                marginTop: '0.5rem',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                <pre style={{
                  margin: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* 안내 */}
        <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>
            ⚠️ <span style={{ color: '#dc3545' }}>*</span> 표시된 항목은 필수 입력 항목입니다.
          </p>
        </div>
      </div>
    </div>
  )
} 