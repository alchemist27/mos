# 카페24 앱 인증/토큰 관리 시스템 구축 가이드

## 📋 개요

이 문서는 카페24 Admin API를 위한 OAuth 2.0 인증 및 토큰 자동 관리 시스템 구축 방법을 상세히 설명합니다.

### 🏗️ 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   카페24 앱     │    │   Next.js 앱    │    │ Firebase Store  │
│  (OAuth 2.0)    │◄──►│  (토큰 관리)    │◄──►│  (토큰 저장)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔑 핵심 기능

- **OAuth 2.0 인증 플로우** 완전 자동화
- **Access Token 자동 갱신** (만료 5분 전)
- **Refresh Token 안전 저장** (Firebase Firestore)
- **토큰 상태 실시간 모니터링**
- **API 요청 시 토큰 자동 검증**
- **백그라운드 스케줄러** (6시간마다 상태 확인)

---

## 🛠️ 기술 스택

### Frontend & Backend
- **Next.js 14** (App Router)
- **TypeScript**
- **React** (클라이언트 사이드)

### 데이터베이스
- **Firebase Firestore** (토큰 저장)
- **Firebase Storage** (파일 업로드)

### 배포
- **Vercel** (서버리스 배포)
- **GitHub** (소스 코드 관리)

---

## 🔧 환경 설정

### 1. 카페24 개발자 센터 설정

1. **카페24 개발자 센터** 접속
2. **새 앱 등록**
3. **OAuth 설정**:
   ```
   Redirect URI: https://your-domain.vercel.app/api/auth/callback
   Scope: mall.read_application, mall.write_application
   ```

### 2. 환경변수 설정

#### 카페24 관련
```env
CAFE24_MALL_ID=your_mall_id
CAFE24_CLIENT_ID=your_client_id
CAFE24_CLIENT_SECRET=your_client_secret
```

#### Firebase 관련 (NEXT_PUBLIC_ 접두사 필수)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase 설정

#### Firestore 보안 규칙
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cafe24_tokens/{document} {
      allow read, write: if true;
    }
  }
}
```

#### Storage 보안 규칙
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 📁 프로젝트 구조

```
MOS/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts    # OAuth 콜백 처리
│   │   │   └── url/route.ts         # 인증 URL 생성
│   │   ├── token/
│   │   │   ├── refresh/route.ts     # 토큰 갱신
│   │   │   └── status/route.ts      # 토큰 상태 확인
│   │   └── test/
│   │       └── boards/route.ts      # API 테스트 엔드포인트
│   ├── page.tsx                     # 메인 페이지
│   └── test/page.tsx               # 테스트 페이지
├── lib/
│   ├── firebase.ts                  # Firebase 설정
│   ├── cafe24Client.ts             # 카페24 API 클라이언트
│   ├── tokenStore.ts               # 토큰 저장/조회
│   ├── tokenScheduler.ts           # 토큰 스케줄러
│   └── types.ts                    # 타입 정의
├── next.config.js                  # Next.js 설정
└── server.js                       # 커스텀 서버 (스케줄러)
```

---

## 🔄 OAuth 2.0 인증 플로우

### 1. 인증 시작
```typescript
// /api/auth/url/route.ts
const authUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/authorize` +
  `?response_type=code` +
  `&client_id=${clientId}` +
  `&state=${state}` +
  `&redirect_uri=${redirectUri}` +
  `&scope=mall.read_application,mall.write_application`;
```

### 2. 콜백 처리
```typescript
// /api/auth/callback/route.ts
const tokenResponse = await fetch(`https://${mallId}.cafe24api.com/api/v2/oauth/token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    redirect_uri: redirectUri
  })
});
```

### 3. 토큰 저장
```typescript
// lib/tokenStore.ts
export async function saveAccessToken(accessToken: string, expiresIn: number) {
  const tokenData: StoredToken = {
    access_token: accessToken,
    expires_at: Date.now() + (expiresIn * 1000)
  };
  
  await setDoc(tokenRef, {
    access_token: tokenData,
    updated_at: new Date().toISOString()
  }, { merge: true });
}
```

---

## 🔄 토큰 자동 갱신 시스템

### 1. 토큰 상태 확인
```typescript
// lib/tokenStore.ts
export async function getStoredAccessToken(): Promise<StoredToken | null> {
  const tokenRef = doc(db!, TOKENS_COLLECTION, TOKEN_DOC_ID);
  const docSnap = await getDoc(tokenRef);
  
  if (!docSnap.exists()) return null;
  
  const tokenData = docSnap.data().access_token;
  
  // 토큰 만료 확인
  if (Date.now() >= tokenData.expires_at) {
    return null;
  }
  
  return tokenData;
}
```

### 2. 자동 갱신 로직
```typescript
// lib/cafe24Client.ts
private async ensureValidToken(): Promise<string> {
  const storedToken = await getStoredAccessToken();
  
  if (!storedToken) {
    throw new Error('토큰이 없습니다. 인증이 필요합니다.');
  }
  
  // 만료 5분 전에 자동 갱신
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
  if (storedToken.expires_at <= fiveMinutesFromNow) {
    await this.refreshAccessToken();
    const newToken = await getStoredAccessToken();
    return newToken!.access_token;
  }
  
  return storedToken.access_token;
}
```

### 3. 백그라운드 스케줄러
```typescript
// lib/tokenScheduler.ts
import * as cron from 'node-cron';

// 6시간마다 토큰 상태 확인
cron.schedule('0 */6 * * *', async () => {
  try {
    const client = new Cafe24Client();
    await client.checkAndRefreshToken();
  } catch (error) {
    console.error('스케줄러 토큰 확인 실패:', error);
  }
});
```

---

## 🔒 보안 고려사항

### 1. 토큰 저장
- **Refresh Token**: Firebase Firestore에 암호화 저장
- **Access Token**: 메모리에서만 사용, 만료 시간과 함께 저장
- **Client Secret**: 환경변수로만 관리, 클라이언트에 노출 금지

### 2. API 요청 보안
```typescript
// 모든 API 요청 시 토큰 검증
const token = await this.ensureValidToken();
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. 환경변수 관리
- **서버 사이드**: `CAFE24_*` (클라이언트 접근 불가)
- **클라이언트 사이드**: `NEXT_PUBLIC_*` (브라우저 접근 가능)

---

## 📊 모니터링 및 로깅

### 1. 토큰 상태 모니터링
```typescript
// /api/token/status/route.ts
export async function GET() {
  const tokenInfo = await getStoredAccessToken();
  
  return Response.json({
    valid: !!tokenInfo,
    expiresAt: tokenInfo?.expires_at,
    minutesLeft: tokenInfo ? Math.floor((tokenInfo.expires_at - Date.now()) / 60000) : 0
  });
}
```

### 2. 로그 시스템
```typescript
// 토큰 갱신 로그
console.log(`✅ Access Token 갱신 완료 (만료: ${new Date(expiresAt).toLocaleString('ko-KR')})`);

// API 요청 로그
console.log(`📡 API 요청: ${method} ${url}`);
console.log(`📊 응답 상태: ${response.status}`);
```

### 3. 에러 처리
```typescript
// 권한 오류 처리
if (error?.code === 'permission-denied') {
  throw new Error('Firebase 권한이 없습니다. Firestore 보안 규칙을 확인하세요.');
}

// 토큰 만료 처리
if (response.status === 401) {
  await this.refreshAccessToken();
  return this.makeAuthenticatedRequest(url, options);
}
```

---

## 🚀 배포 가이드

### 1. Vercel 배포
```bash
# 1. GitHub 연결
git remote add origin https://github.com/username/repo.git

# 2. Vercel 프로젝트 생성
vercel --prod

# 3. 환경변수 설정
# Vercel Dashboard → Settings → Environment Variables
```

### 2. 환경변수 설정 (Vercel)
```
Production, Preview, Development 모두 체크:
- CAFE24_MALL_ID
- CAFE24_CLIENT_ID  
- CAFE24_CLIENT_SECRET
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
```

### 3. 도메인 설정
```bash
# 카페24 개발자 센터에서 Redirect URI 업데이트
https://your-app.vercel.app/api/auth/callback
```

---

## 🧪 테스트 방법

### 1. 인증 테스트
1. 메인 페이지에서 "카페24 인증 시작" 클릭
2. 카페24 로그인 후 권한 승인
3. 콜백 처리 확인
4. 토큰 저장 확인

### 2. API 테스트
```typescript
// /api/test/boards/route.ts
const response = await client.createBoardArticle(boardNo, articleData);
```

### 3. 토큰 갱신 테스트
```bash
# 수동 갱신 테스트
curl -X POST https://your-app.vercel.app/api/token/refresh
```

---

## 🔧 트러블슈팅

### 1. 환경변수 문제
**증상**: Firebase 초기화 실패
**해결**: 
- Vercel에서 `NEXT_PUBLIC_FIREBASE_*` 형태로 설정
- 모든 환경(Production, Preview, Development) 체크
- 빌드 캐시 삭제 후 재배포

### 2. Firebase 권한 문제
**증상**: `permission-denied` 오류
**해결**:
```javascript
// Firestore Rules
match /cafe24_tokens/{document} {
  allow read, write: if true;
}

// Storage Rules  
match /uploads/{allPaths=**} {
  allow read, write: if true;
}
```

### 3. 토큰 갱신 실패
**증상**: 401 Unauthorized
**해결**:
- Refresh Token 확인
- 카페24 앱 상태 확인
- Client Secret 검증

---

## 📈 성능 최적화

### 1. 토큰 캐싱
```typescript
// 메모리 캐싱으로 불필요한 DB 조회 최소화
private static tokenCache: { token: string; expiresAt: number } | null = null;
```

### 2. 배치 처리
```typescript
// 여러 API 요청 시 토큰 재사용
const token = await this.ensureValidToken();
const promises = urls.map(url => this.makeRequest(url, token));
```

### 3. 에러 재시도
```typescript
// 네트워크 오류 시 자동 재시도
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 📚 참고 자료

### 카페24 API 문서
- [카페24 Developer Center](https://developers.cafe24.com/)
- [OAuth 2.0 가이드](https://developers.cafe24.com/docs/api/admin/#oauth-2-0)
- [Admin API 레퍼런스](https://developers.cafe24.com/docs/api/admin/)

### Firebase 문서
- [Firebase Console](https://console.firebase.google.com/)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage 규칙](https://firebase.google.com/docs/storage/security)

### Next.js 문서
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)
- [App Router](https://nextjs.org/docs/app)

---

## 🎯 향후 개선사항

### 1. 보안 강화
- JWT 토큰 암호화
- IP 화이트리스트 적용
- Rate Limiting 구현

### 2. 기능 확장
- 멀티 몰 지원
- 토큰 히스토리 관리
- 웹훅 연동

### 3. 모니터링 개선
- 토큰 사용량 통계
- 알림 시스템 구축
- 대시보드 개발

---

*이 문서는 실제 구축 경험을 바탕으로 작성되었으며, 향후 업데이트될 수 있습니다.* 