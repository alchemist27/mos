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

  // 빌드 시점 체크
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV;
  
  // 디버깅: 실제 환경변수 값들 확인
  console.log('🔍 Firebase 환경변수 디버깅:');
  console.log('🔍 process.env 확인:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`  ${varName}: ${value ? '✅ 설정됨' : '❌ 누락'} (${value ? 'length: ' + value.length : 'undefined'})`);
    if (value) {
      console.log(`    실제값: ${value.substring(0, 10)}...`);
    }
  });

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    if (isBuildTime) {
      // 빌드 시점에서는 경고만 출력하고 계속 진행
      console.warn('⚠️ Firebase 환경변수 누락 (빌드 시점):', missing);
      return false;
    } else {
      // 런타임에서는 에러 발생
      console.error('🚫 Firebase 환경변수 누락:', missing);
      throw new Error(`Firebase 환경변수가 누락되었습니다: ${missing.join(', ')}`);
    }
  }
  
  console.log('✅ Firebase 환경변수 확인 완료');
  return true;
}

// 환경변수 검증
const isConfigValid = validateFirebaseConfig();

// Firebase 설정 - 빌드 시점에서도 안전한 기본값 사용
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'build-time-dummy',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'build-time-dummy.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'build-time-dummy',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'build-time-dummy.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:dummy'
};

console.log('🔍 최종 Firebase 설정:', {
  apiKey: firebaseConfig.apiKey ? '✅ 설정됨' : '❌ 누락',
  authDomain: firebaseConfig.authDomain ? '✅ 설정됨' : '❌ 누락',
  projectId: firebaseConfig.projectId ? '✅ 설정됨' : '❌ 누락',
  storageBucket: firebaseConfig.storageBucket ? '✅ 설정됨' : '❌ 누락',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ 설정됨' : '❌ 누락',
  appId: firebaseConfig.appId ? '✅ 설정됨' : '❌ 누락'
});

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
    console.warn('⚠️ Firebase 서비스 초기화 건너뜀 (빌드 시점 또는 환경변수 누락)');
  }
} catch (error: any) {
  console.error('❌ Firebase 초기화 실패:', error);
  // 빌드 시점에서는 에러를 던지지 않음
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV) {
    throw error;
  }
}

export { db, storage };
export default app; 