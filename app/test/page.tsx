'use client'

import { useState } from 'react'

export default function TestPage() {
  const [endpoint, setEndpoint] = useState('/api/v2/admin/shop')
  const [method, setMethod] = useState('GET')
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  // 게시물 업로드 상태
  const [boardNo, setBoardNo] = useState('5')
  const [boardLoading, setBoardLoading] = useState(false)
  const [boardResponse, setBoardResponse] = useState<any>(null)

  // 자주 사용하는 API 엔드포인트들
  const commonEndpoints = [
    { name: '쇼핑몰 정보', endpoint: '/api/v2/admin/shop' },
    { name: '상품 목록', endpoint: '/api/v2/admin/products' },
    { name: '주문 목록', endpoint: '/api/v2/admin/orders' },
    { name: '고객 목록', endpoint: '/api/v2/admin/customers' },
    { name: '카테고리 목록', endpoint: '/api/v2/admin/categories' },
    { name: '게시판 목록', endpoint: '/api/v2/admin/boards' },
  ]

  const testApi = async () => {
    setLoading(true)
    setResponse(null)
    
    try {
      const requestData: any = {
        endpoint,
        method
      }
      
      if (method !== 'GET' && requestBody.trim()) {
        try {
          requestData.data = JSON.parse(requestBody)
        } catch (e) {
          throw new Error('요청 본문이 유효한 JSON이 아닙니다.')
        }
      }
      
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      const data = await res.json()
      setResponse(data)
      
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

  // 게시물 업로드 함수
  const uploadBoardArticle = async () => {
    setBoardLoading(true)
    setBoardResponse(null)
    
    try {
      const payload = {
        "shop_no": 1,
        "requests": [
          {
            "writer": "테스트 작성자",
            "title": "테스트 게시물 제목",
            "content": "테스트 게시물 내용입니다. 이것은 API 테스트를 위한 게시물입니다.",
            "client_ip": "127.0.0.1",
            "board_category_no": 1,
            "secret": "F",
            "writer_email": "test@example.com",
            "member_id": "testuser",
            "nick_name": "테스트유저",
            "deleted": "F",
            "input_channel": "P",
            "notice": "F",
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
          boardNo,
          data: payload
        })
      })
      
      const data = await res.json()
      setBoardResponse(data)
      
    } catch (error: any) {
      setBoardResponse({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setBoardLoading(false)
    }
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
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
          🧪 카페24 Admin API 테스트
        </h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
            ← 메인으로 돌아가기
          </a>
        </div>

        {/* 자주 사용하는 엔드포인트 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>자주 사용하는 API</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {commonEndpoints.map((item, index) => (
              <button
                key={index}
                onClick={() => setEndpoint(item.endpoint)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: endpoint === item.endpoint ? '#007bff' : '#e9ecef',
                  color: endpoint === item.endpoint ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* API 요청 설정 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>API 요청 설정</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              HTTP 메서드:
            </label>
            <select 
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '200px'
              }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              API 엔드포인트:
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
                fontFamily: 'monospace'
              }}
              placeholder="/api/v2/admin/shop"
            />
          </div>

          {method !== 'GET' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                요청 본문 (JSON):
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%',
                  height: '120px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          <button
            onClick={testApi}
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ 요청 중...' : '🚀 API 호출'}
          </button>
        </div>

        {/* 게시물 업로드 테스트 */}
        <div style={{ 
          marginBottom: '2rem', 
          border: '2px solid #007bff', 
          borderRadius: '8px', 
          padding: '1.5rem',
          backgroundColor: '#f8f9ff'
        }}>
          <h3 style={{ color: '#007bff', marginBottom: '1rem' }}>📝 게시물 업로드 테스트</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              게시판 번호:
            </label>
            <input
              type="text"
              value={boardNo}
              onChange={(e) => setBoardNo(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '200px'
              }}
              placeholder="5"
            />
            <small style={{ marginLeft: '1rem', color: '#666' }}>
              (기본값: 5번 게시판)
            </small>
          </div>

          <button
            onClick={uploadBoardArticle}
            disabled={boardLoading}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: boardLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: boardLoading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {boardLoading ? '⏳ 업로드 중...' : '📝 테스트 게시물 업로드'}
          </button>

          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            <strong>테스트 데이터:</strong> 간단한 테스트 게시물이 업로드됩니다.
            <br />
            <strong>API 엔드포인트:</strong> POST /api/v2/admin/boards/{boardNo}/articles
          </div>

          {/* 게시물 업로드 응답 결과 */}
          {boardResponse && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ 
                color: boardResponse.success ? '#28a745' : '#dc3545',
                marginBottom: '1rem' 
              }}>
                {boardResponse.success ? '✅ 게시물 업로드 성공' : '❌ 게시물 업로드 실패'}
              </h4>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '1rem',
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
                  {JSON.stringify(boardResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 응답 결과 */}
        {response && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ 
              color: response.success ? '#28a745' : '#dc3545',
              marginBottom: '1rem' 
            }}>
              {response.success ? '✅ 응답 성공' : '❌ 응답 실패'}
            </h3>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '1rem',
              maxHeight: '500px',
              overflow: 'auto'
            }}>
              <pre style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* 도움말 */}
        <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#666' }}>
          <h4 style={{ color: '#333' }}>💡 사용 팁</h4>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>먼저 메인 페이지에서 토큰이 유효한지 확인하세요</li>
            <li>GET 요청은 대부분의 정보 조회에 사용됩니다</li>
            <li>POST/PUT 요청 시에는 요청 본문에 유효한 JSON을 입력하세요</li>
            <li>API 응답이 실패하면 토큰이 자동으로 갱신됩니다</li>
            <li>카페24 Admin API 문서: <a href="https://developers.cafe24.com/docs/api/admin/" target="_blank" style={{ color: '#007bff' }}>https://developers.cafe24.com/docs/api/admin/</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
} 