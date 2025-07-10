# Firebase 파일 업로드 CORS 문제 해결 가이드

## 🚨 문제 상황
카페24 사이트에서 Firebase Cloud Functions로 직접 파일 업로드 시 CORS 에러 발생:
```
Access to fetch at 'https://us-central1-teejoa-ai.cloudfunctions.net/uploadFile' 
from origin 'https://teejoa.cafe24.com' has been blocked by CORS policy
```

## ✅ 해결 방법: MOS API 프록시 사용

### 1. 새로운 업로드 URL 사용
기존 Firebase URL 대신 MOS API 프록시를 사용하세요:

**기존 (CORS 에러 발생):**
```javascript
const uploadUrl = 'https://us-central1-teejoa-ai.cloudfunctions.net/uploadFile'
```

**수정 (CORS 문제 해결):**
```javascript
const uploadUrl = 'https://mos-omega.vercel.app/api/external/upload'
```

### 2. JavaScript 코드 수정 예시

**기존 코드:**
```javascript
async function uploadFileToFirebase(file, fileName) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', fileName);
        
        const response = await fetch('https://us-central1-teejoa-ai.cloudfunctions.net/uploadFile', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.downloadURL;
    } catch (error) {
        console.error('❌ Firebase 파일 업로드 중 오류:', fileName, error);
        throw error;
    }
}
```

**수정된 코드:**
```javascript
async function uploadFileToFirebase(file, fileName) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', fileName);
        
        // MOS API 프록시 사용
        const response = await fetch('https://mos-omega.vercel.app/api/external/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // MOS API 응답 형식에 맞게 수정
        if (result.success) {
            return result.data.downloadURL || result.data.url;
        } else {
            throw new Error(result.error || '파일 업로드 실패');
        }
    } catch (error) {
        console.error('❌ Firebase 파일 업로드 중 오류:', fileName, error);
        throw error;
    }
}
```

### 3. 완전한 통합 예시

**MOS API를 활용한 완전한 주문 처리 플로우:**
```javascript
async function submitToMOSAPI(orderData) {
    try {
        console.log('🚀 MOS API 호출...');
        
        // 1. 파일 업로드 (있는 경우)
        let attachFileUrls = [];
        if (orderData.attachedFiles && orderData.attachedFiles.length > 0) {
            console.log('📤 첨부파일 업로드 시작...');
            
            for (const file of orderData.attachedFiles) {
                try {
                    const uploadUrl = await uploadFileToFirebase(file.file, file.fileName);
                    attachFileUrls.push(uploadUrl);
                    console.log('✅ 파일 업로드 성공:', file.fileName, uploadUrl);
                } catch (error) {
                    console.error('❌ 파일 업로드 실패:', file.fileName, error);
                    // 파일 업로드 실패해도 게시물 등록은 계속 진행
                }
            }
        }
        
        // 2. 게시물 등록
        const boardData = {
            writer: orderData.writer,
            title: orderData.title,
            content: orderData.content,
            category: orderData.category || '1',
            attachFileUrls: attachFileUrls,
            writerEmail: orderData.email,
            nickName: orderData.writer
        };
        
        const response = await fetch('https://mos-omega.vercel.app/api/external/boards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(boardData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ MOS API 성공:', result);
            return result;
        } else {
            throw new Error(result.error || 'MOS API 호출 실패');
        }
        
    } catch (error) {
        console.error('❌ MOS API 호출 실패:', error);
        throw error;
    }
}
```

### 4. 에러 처리 개선

```javascript
// 재시도 로직 포함
async function uploadFileWithRetry(file, fileName, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 파일 업로드 시도 ${attempt}/${maxRetries}:`, fileName);
            
            const result = await uploadFileToFirebase(file, fileName);
            console.log(`✅ 파일 업로드 성공 (${attempt}번째 시도):`, fileName);
            return result;
            
        } catch (error) {
            console.error(`❌ 파일 업로드 실패 (${attempt}번째 시도):`, fileName, error);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // 재시도 전 대기
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}
```

## 🔧 MOS API 프록시 엔드포인트 정보

### URL
```
https://mos-omega.vercel.app/api/external/upload
```

### 지원 메서드
- `POST`: 파일 업로드
- `OPTIONS`: CORS preflight 요청

### 요청 형식
- **Content-Type**: `multipart/form-data`
- **Body**: FormData 객체

### 응답 형식
**성공 시:**
```json
{
  "success": true,
  "message": "파일 업로드가 성공적으로 완료되었습니다.",
  "data": {
    "downloadURL": "https://storage.googleapis.com/...",
    "fileName": "uploaded_file.jpg"
  },
  "timestamp": "2025-07-10T07:30:00.000Z"
}
```

**실패 시:**
```json
{
  "success": false,
  "error": "파일 업로드 실패 메시지",
  "timestamp": "2025-07-10T07:30:00.000Z"
}
```

## 🚀 배포 및 테스트

1. **코드 수정**: 위의 예시에 따라 JavaScript 코드를 수정
2. **테스트**: 카페24 사이트에서 파일 업로드 테스트
3. **모니터링**: 브라우저 개발자 도구에서 네트워크 탭 확인

## 📞 문제 해결

만약 여전히 문제가 발생한다면:

1. **브라우저 개발자 도구**에서 네트워크 탭 확인
2. **MOS API 로그** 확인 (Vercel 대시보드)
3. **Firebase Cloud Functions 로그** 확인

## 🔒 보안 고려사항

- MOS API 프록시는 모든 도메인에서 접근 가능하도록 설정됨
- 운영 환경에서는 특정 도메인으로 제한 권장
- 파일 크기 및 형식 제한 고려 필요 