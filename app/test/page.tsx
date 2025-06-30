'use client'

import { useEffect } from 'react'

export default function TestPage() {
  useEffect(() => {
    // 스크립트 동적 로딩
    const script = document.createElement('script')
    script.src = '/cafe24-order-script.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>카페24 스크립트 테스트</h1>
      <p>카페24 스크립트가 정상적으로 로드되는지 확인하는 페이지입니다.</p>
      <p>개발자 도구 콘솔에서 로그를 확인하세요.</p>
      
      <div id="cafe24-script-error-container"></div>
      <div className="loading-container">로딩 중...</div>
      <div className="simple-order-table" style={{ display: 'none' }}>
        <div id="product-list-container"></div>
        <button id="multi-add-to-cart-btn">선택 상품 장바구니 담기</button>
      </div>
    </div>
  )
} 