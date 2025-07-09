# 카페24 디자인 스킨 - MOS 게시물 등록 API 연동 가이드

## 📋 개요

이 가이드는 카페24 디자인 스킨에서 MOS 앱의 게시물 등록 API를 호출하는 방법을 설명합니다.

## 🔧 구성 요소

### 1. MOS API 엔드포인트
- **URL**: `https://mos-omega.vercel.app/api/external/boards`
- **Method**: POST
- **Content-Type**: application/json
- **CORS**: 활성화됨

### 2. 필요한 파일
- `cafe24-skin-integration.js` - MOS API 연동 JavaScript 라이브러리
- `cafe24-skin-example.html` - 사용 예시 HTML

## 🚀 설치 및 설정

### 1단계: JavaScript 파일 포함
카페24 스킨 프로젝트에 `cafe24-skin-integration.js` 파일을 포함하세요.

```html
<script src="cafe24-skin-integration.js"></script>
```

### 2단계: HTML 폼 작성
게시물 등록 폼을 다음과 같이 작성하세요:

```html
<form id="inquiry-form" onsubmit="return false;">
    <input type="text" name="writer" required placeholder="이름">
    <input type="text" name="title" required placeholder="제목">
    <textarea name="content" required placeholder="내용"></textarea>
    <select name="category">
        <option value="1">견적문의</option>
        <option value="2">시안요청</option>
    </select>
    <button type="submit">등록</button>
</form>
```

### 3단계: JavaScript 초기화
폼에 MOS API 연동을 초기화하세요:

```javascript
MOS.initMOSBoardIntegration('#inquiry-form', {
    defaultCategory: '1',
    onSuccess: function(result) {
        alert('등록 성공!');
    },
    onError: function(error) {
        alert('등록 실패: ' + error.message);
    }
});
```

## 📝 API 스펙

### 요청 데이터
```json
{
    "boardNo": "5",
    "writer": "홍길동",
    "title": "견적 문의합니다",
    "content": "상품에 대한 견적을 요청합니다.",
    "category": "1",
    "writerEmail": "hong@example.com",
    "memberId": "member123",
    "nickName": "홍길동",
    "isSecret": false,
    "isNotice": false,
    "attachFileUrls": []
}
```

### 응답 데이터
```json
{
    "success": true,
    "message": "게시물이 성공적으로 등록되었습니다.",
    "data": { /* 카페24 API 응답 */ },
    "board_no": "5",
    "category_name": "견적문의",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 사용 방법

### 방법 1: 자동 초기화 (권장)
```javascript
MOS.initMOSBoardIntegration('#inquiry-form', {
    defaultCategory: '1',
    redirectUrl: '/board/list',
    onSuccess: function(result) {
        console.log('성공:', result);
    },
    onError: function(error) {
        console.error('실패:', error);
    }
});
```

### 방법 2: 수동 호출
```javascript
document.getElementById('inquiry-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const boardData = {
        writer: formData.get('writer'),
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category')
    };
    
    try {
        const result = await MOS.submitBoardToMOS(boardData);
        alert('등록 성공!');
    } catch (error) {
        alert('등록 실패: ' + error.message);
    }
});
```

### 방법 3: 직접 API 호출
```javascript
async function submitInquiry() {
    const response = await fetch('https://mos-omega.vercel.app/api/external/boards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            writer: '홍길동',
            title: '견적 문의',
            content: '상품 견적을 요청합니다.',
            category: '1'
        })
    });
    
    const result = await response.json();
    
    if (result.success) {
        alert('등록 성공!');
    } else {
        alert('등록 실패: ' + result.error);
    }
}
```

## 📋 필드 설명

### 필수 필드
- **writer**: 작성자 이름
- **title**: 게시물 제목
- **content**: 게시물 내용

### 선택 필드
- **category**: 카테고리 (1: 견적문의, 2: 시안요청)
- **writerEmail**: 작성자 이메일
- **memberId**: 회원 ID
- **nickName**: 닉네임
- **isSecret**: 비밀글 여부 (boolean)
- **isNotice**: 공지사항 여부 (boolean)
- **attachFileUrls**: 첨부파일 URL 배열

## 🎨 스타일링 예시

```css
.inquiry-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

.submit-btn {
    background: #007bff;
    color: white;
    padding: 12px 30px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    width: 100%;
}

.submit-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}
```

## 🔒 보안 고려사항

### 1. CORS 설정
현재 모든 도메인에서 접근 가능하도록 설정되어 있습니다. 운영 환경에서는 특정 도메인으로 제한하는 것을 권장합니다.

### 2. 입력값 검증
클라이언트 측에서 입력값을 검증하고, 서버 측에서도 추가 검증을 수행합니다.

### 3. 에러 처리
API 호출 실패 시 적절한 에러 메시지를 사용자에게 표시합니다.

## 🐛 문제 해결

### 1. CORS 에러가 발생하는 경우
브라우저 개발자 도구에서 CORS 에러를 확인하고, MOS API 서버의 CORS 설정을 확인하세요.

### 2. 토큰 인증 에러가 발생하는 경우
MOS 앱에서 카페24 토큰이 유효한지 확인하세요. 토큰이 만료된 경우 재인증이 필요합니다.

### 3. 네트워크 에러가 발생하는 경우
MOS API 서버가 정상적으로 작동하는지 확인하고, 네트워크 연결을 확인하세요.

## 📞 지원

문제가 발생하거나 추가 기능이 필요한 경우, MOS 개발팀에 문의하세요.

- **API 서버**: https://mos-omega.vercel.app
- **상태 확인**: https://mos-omega.vercel.app/api/token/status
- **테스트 페이지**: https://mos-omega.vercel.app/test

## 📝 변경 이력

- **v1.0.0**: 초기 버전 릴리스
- **v1.1.0**: CORS 지원 추가
- **v1.2.0**: 에러 처리 개선 