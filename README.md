# MOS - 카페24 Admin API 토큰 관리 시스템

카페24 Admin API를 위한 토큰 인증 및 자동 갱신 시스템입니다.

## 🚀 주요 기능

- **카페24 OAuth 2.0 인증**: Authorization Code Grant 방식
- **자동 토큰 갱신**: 만료 10분 전 자동 갱신
- **토큰 상태 모니터링**: 실시간 토큰 상태 확인
- **안전한 토큰 저장**: 로컬 파일 시스템에 토큰 저장
- **스케줄러**: 30분마다 토큰 상태 확인, 일일 상태 로그

## 📦 설치 및 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 카페24 API 설정
CAFE24_CLIENT_ID=your_client_id
CAFE24_CLIENT_SECRET=your_client_secret
CAFE24_MALL_ID=your_mall_id

# 앱 URL 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 토큰 저장소 설정 (선택사항)
TOKEN_STORE_PATH=./tokens
```

### 3. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm run build
npm start
```

## 🔧 API 엔드포인트

### 인증 관련
- `GET /api/auth/url` - 카페24 인증 URL 생성
- `GET /api/auth/callback` - 카페24 인증 콜백 처리

### 토큰 관리
- `GET /api/token/status` - 토큰 상태 확인
- `POST /api/token/refresh` - 토큰 수동 갱신

### 테스트
- `GET /api/test` - 카페24 API 연결 테스트

## 📁 프로젝트 구조

```
MOS/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── auth/         # 인증 관련
│   │   ├── token/        # 토큰 관리
│   │   └── test/         # API 테스트
│   ├── layout.tsx        # 기본 레이아웃
│   └── page.tsx          # 메인 페이지
├── lib/                   # 유틸리티 라이브러리
│   ├── cafe24Client.ts   # 카페24 API 클라이언트
│   ├── tokenStore.ts     # 토큰 저장소 관리
│   ├── tokenScheduler.ts # 토큰 자동 갱신 스케줄러
│   └── types.ts          # 타입 정의
├── tokens/               # 토큰 저장 디렉토리 (자동 생성)
├── server.js             # 커스텀 서버 (스케줄러 포함)
└── package.json
```

## 🔄 토큰 자동 갱신 시스템

### 스케줄러 동작
- **매 30분마다**: 토큰 상태 확인 및 필요시 갱신
- **매일 자정**: 토큰 상태 로그 출력
- **만료 10분 전**: 자동 토큰 갱신 실행

### 토큰 저장 방식
- Access Token과 Refresh Token을 별도 JSON 파일로 저장
- 만료 시간 정보 포함하여 유효성 자동 확인
- 파일 기반 저장으로 서버 재시작 시에도 토큰 유지

## 🛡️ 보안 고려사항

- 환경변수를 통한 민감 정보 관리
- 토큰 파일은 `.gitignore`에 포함 필요
- HTTPS 사용 권장 (프로덕션 환경)
- 적절한 파일 권한 설정 필요

## 📝 사용 방법

1. **초기 인증**: 웹 인터페이스에서 "카페24 인증 시작" 버튼 클릭
2. **토큰 확인**: "상태 새로고침" 버튼으로 현재 토큰 상태 확인
3. **수동 갱신**: 필요시 "토큰 수동 갱신" 버튼으로 즉시 갱신
4. **API 테스트**: `/api/test` 엔드포인트로 연결 상태 확인

## 🔍 로그 모니터링

서버 콘솔에서 다음과 같은 로그를 확인할 수 있습니다:
- 토큰 발급/갱신 성공/실패
- 스케줄러 동작 상태
- API 요청 결과
- 일일 토큰 상태 리포트

## ⚠️ 주의사항

- 카페24 개발자 센터에서 앱 등록 및 리디렉션 URI 설정 필요
- 토큰 저장 디렉토리에 대한 읽기/쓰기 권한 필요
- 프로덕션 환경에서는 적절한 에러 핸들링 및 로깅 시스템 구축 권장
# Firebase integration complete
