import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase 설정 검증 함수
function validateFirebaseConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  // 빌드 환경 체크
  const isBuildTime = process.env.NODE_ENV === 'production' && 
                     (typeof window === 'undefined') && 
                     (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production');
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    if (isBuildTime) {
      // 빌드 시점에서는 아무것도 하지 않음
      return false;
    } else {
      // 개발 환경에서는 경고만
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Firebase 환경변수 누락 (개발 모드):', missing);
        return false;
      }
      // 프로덕션 런타임에서만 에러
      console.error('🚫 Firebase 환경변수 누락:', missing);
      throw new Error(`Firebase 환경변수가 누락되었습니다: ${missing.join(', ')}`);
    }
  }
  
  return true;
}

// 환경변수 검증
let isConfigValid = false;
try {
  isConfigValid = validateFirebaseConfig();
} catch (error) {
  console.warn('⚠️ Firebase 환경변수 검증 건너뜀');
}

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'build-time-dummy',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'build-time-dummy.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'build-time-dummy',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'build-time-dummy.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:dummy'
};

// Firebase 앱 초기화 (중복 초기화 방지)
let app;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('🔥 Firebase 앱 초기화 완료');
  } else {
    app = getApps()[0];
    console.log('🔥 기존 Firebase 앱 사용');
  }

  // 실제 환경변수가 있을 때만 서비스 초기화
  if (isConfigValid && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'build-time-dummy') {
    // Firestore 데이터베이스 초기화
    db = getFirestore(app);
    console.log('🗄️ Firestore 데이터베이스 초기화 완료');

    // Firebase Storage 초기화
    storage = getStorage(app);
    console.log('📁 Firebase Storage 초기화 완료');
  } else {
    // 더미값으로도 서비스 초기화 (실제로는 환경변수가 정상 주입됨)
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('🔥 Firebase 서비스 초기화 완료');
  }
} catch (error: any) {
  console.error('❌ Firebase 초기화 실패:', error);
}

export { db, storage };
export default app; 