// 환경변수 테스트 파일
console.log('🧪 환경변수 테스트 시작');
console.log('🧪 NODE_ENV:', process.env.NODE_ENV);
console.log('🧪 VERCEL_ENV:', process.env.VERCEL_ENV);

// 모든 환경변수 출력
console.log('🧪 모든 환경변수 키:', Object.keys(process.env).sort());

// FIREBASE 관련 환경변수만 필터링
const firebaseEnvs = Object.keys(process.env).filter(key => key.includes('FIREBASE'));
console.log('🧪 FIREBASE 관련 환경변수:', firebaseEnvs);

firebaseEnvs.forEach(key => {
  const value = process.env[key];
  console.log(`🧪 ${key}: ${value ? '있음' : '없음'} (${value ? value.substring(0, 10) + '...' : 'undefined'})`);
});

// 필요한 환경변수들 개별 확인
const requiredVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('🧪 필요한 환경변수 확인:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`🧪 ${varName}: ${value ? '✅ 있음' : '❌ 없음'}`);
});

export const envTest = {
  allEnvKeys: Object.keys(process.env),
  firebaseEnvs,
  requiredVars: requiredVars.map(varName => ({
    name: varName,
    exists: !!process.env[varName],
    value: process.env[varName] ? process.env[varName]?.substring(0, 10) + '...' : undefined
  }))
}; 