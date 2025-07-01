import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase 설정 검증 함수
function validateFirebaseConfig() {
  const requiredVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN', 
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    // 런타임에만 에러 발생 (빌드 시에는 경고만)
    const isRuntime = typeof window !== 'undefined' || process.env.VERCEL_ENV;
    
    if (isRuntime && process.env.NODE_ENV === 'production') {
      console.error('🚫 Firebase 환경변수 누락:', missing);
      throw new Error(`Firebase 환경변수가 누락되었습니다: ${missing.join(', ')}`);
    } else {
      console.warn('⚠️ Firebase 환경변수 누락 (개발/빌드 모드):', missing);
      return false;
    }
  }
  
  console.log('✅ Firebase 환경변수 확인 완료');
  return true;
}

// 환경변수 검증
const isConfigValid = validateFirebaseConfig();

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'dummy-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'dummy-domain',
  projectId: process.env.FIREBASE_PROJECT_ID || 'dummy-project',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'dummy-bucket',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'dummy-sender',
  appId: process.env.FIREBASE_APP_ID || 'dummy-app'
};

// Firebase 앱 초기화 (중복 초기화 방지)
let app;
let db: Firestore | null = null;

if (isConfigValid) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('🔥 Firebase 앱 초기화 완료');
    } else {
      app = getApps()[0];
      console.log('🔥 기존 Firebase 앱 사용');
    }

    // Firestore 데이터베이스 초기화
    db = getFirestore(app);
    console.log('🗄️ Firestore 데이터베이스 초기화 완료');
  } catch (error: any) {
    console.error('❌ Firebase 초기화 실패:', error);
    throw error;
  }
} else {
  console.warn('⚠️ Firebase 설정이 유효하지 않아 초기화를 건너뜁니다.');
  // 더미 앱 생성 (빌드 시 오류 방지)
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.warn('⚠️ 더미 Firebase 앱 생성 실패 (정상적인 동작)');
  }
}

export { db };
export default app; 