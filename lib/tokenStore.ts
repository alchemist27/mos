import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { StoredToken } from './types';

// 토큰 컬렉션 및 문서 ID
const TOKENS_COLLECTION = 'cafe24_tokens';
const TOKEN_DOC_ID = 'main_token';

// Firebase 권한 오류 체크 함수
function isPermissionError(error: any): boolean {
  return error?.code === 'permission-denied' || 
         error?.message?.includes('PERMISSION_DENIED') ||
         error?.message?.includes('Missing or insufficient permissions');
}

// Firebase 설정 확인 함수
function checkFirebaseConfig(): boolean {
  if (!db) {
    console.error('🚫 Firebase가 초기화되지 않았습니다. 환경변수를 확인하세요.');
    return false;
  }
  return true;
}

// Access Token 저장
export async function saveAccessToken(accessToken: string, expiresIn: number): Promise<void> {
  if (!checkFirebaseConfig()) {
    throw new Error('Firebase가 초기화되지 않았습니다. 환경변수를 확인하세요.');
  }

  try {
    const tokenData: StoredToken = {
      access_token: accessToken,
      expires_at: Date.now() + (expiresIn * 1000)
    };

    const tokenRef = doc(db!, TOKENS_COLLECTION, TOKEN_DOC_ID);
    
    await setDoc(tokenRef, {
      access_token: tokenData,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }, { merge: true });

    const expiresAt = new Date(tokenData.expires_at).toLocaleString('ko-KR');
    console.log(`✅ Access Token Firebase 저장 완료 (만료: ${expiresAt})`);
    console.log(`🔥 Firebase 문서: ${TOKENS_COLLECTION}/${TOKEN_DOC_ID}`);
  } catch (error: any) {
    if (isPermissionError(error)) {
      console.error('🚫 Firebase 권한 오류 - Firestore 보안 규칙을 확인하세요:', error.message);
      throw new Error('Firebase 권한이 없습니다. Firestore 보안 규칙을 확인하세요.');
    } else {
      console.error('❌ Access Token Firebase 저장 실패:', error);
      throw error;
    }
  }
}

// Access Token 조회
export async function getStoredAccessToken(): Promise<StoredToken | null> {
  if (!checkFirebaseConfig()) {
    return null;
  }

  try {
    const tokenRef = doc(db!, TOKENS_COLLECTION, TOKEN_DOC_ID);
    const docSnap = await getDoc(tokenRef);
    
    if (!docSnap.exists()) {
      console.log('ℹ️ Firebase에 토큰 문서 없음');
      return null;
    }

    const data = docSnap.data();
    if (!data.access_token) {
      console.log('ℹ️ Firebase에 Access Token 없음');
      return null;
    }

    const tokenData: StoredToken = data.access_token;
    
    // 토큰 만료 확인
    if (Date.now() >= tokenData.expires_at) {
      console.log('⚠️ Access Token 만료됨');
      return null;
    }
    
    const expiresAt = new Date(tokenData.expires_at).toLocaleString('ko-KR');
    console.log(`✅ Access Token Firebase 조회 성공 (만료: ${expiresAt})`);
    return tokenData;
  } catch (error: any) {
    if (isPermissionError(error)) {
      console.error('🚫 Firebase 권한 오류 - Firestore 보안 규칙을 확인하세요:', error.message);
      return null;
    } else {
      console.error('❌ Access Token Firebase 조회 실패:', error);
      return null;
    }
  }
}

// Refresh Token 저장
export async function saveRefreshToken(refreshToken: string): Promise<void> {
  if (!checkFirebaseConfig()) {
    throw new Error('Firebase가 초기화되지 않았습니다. 환경변수를 확인하세요.');
  }

  try {
    const tokenRef = doc(db!, TOKENS_COLLECTION, TOKEN_DOC_ID);
    
    await updateDoc(tokenRef, {
      refresh_token: refreshToken,
      updated_at: new Date().toISOString()
    });

    console.log('✅ Refresh Token Firebase 저장 완료');
    console.log(`🔥 Firebase 문서: ${TOKENS_COLLECTION}/${TOKEN_DOC_ID}`);
  } catch (error: any) {
    // 문서가 없는 경우 새로 생성
    if (error.code === 'not-found') {
      const tokenRef = doc(db!, TOKENS_COLLECTION, TOKEN_DOC_ID);
      await setDoc(tokenRef, {
        refresh_token: refreshToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log('✅ Refresh Token Firebase 새 문서 생성 및 저장 완료');
    } else if (isPermissionError(error)) {
      console.error('🚫 Firebase 권한 오류 - Firestore 보안 규칙을 확인하세요:', error.message);
      throw new Error('Firebase 권한이 없습니다. Firestore 보안 규칙을 확인하세요.');
    } else {
      console.error('❌ Refresh Token Firebase 저장 실패:', error);
      throw error;
    }
  }
}

// Refresh Token 조회
export async function getStoredRefreshToken(): Promise<string | null> {
  if (!checkFirebaseConfig()) {
    return null;
  }

  try {
    const tokenRef = doc(db!, TOKENS_COLLECTION, TOKEN_DOC_ID);
    const docSnap = await getDoc(tokenRef);
    
    if (!docSnap.exists()) {
      console.log('ℹ️ Firebase에 토큰 문서 없음');
      return null;
    }

    const data = docSnap.data();
    if (!data.refresh_token) {
      console.log('ℹ️ Firebase에 Refresh Token 없음');
      return null;
    }

    console.log('✅ Refresh Token Firebase 조회 성공');
    return data.refresh_token;
  } catch (error: any) {
    if (isPermissionError(error)) {
      console.error('🚫 Firebase 권한 오류 - Firestore 보안 규칙을 확인하세요:', error.message);
      return null;
    } else {
      console.error('❌ Refresh Token Firebase 조회 실패:', error);
      return null;
    }
  }
}

// 토큰 유효성 검사
export async function isAccessTokenValid(): Promise<boolean> {
  const token = await getStoredAccessToken();
  return token !== null;
}

// 디버깅용: Firebase 토큰 정보 조회
export async function getTokenStoreInfo(): Promise<any> {
  if (!checkFirebaseConfig()) {
    return {
      provider: 'Firebase Firestore',
      collection: TOKENS_COLLECTION,
      document: TOKEN_DOC_ID,
      exists: false,
      error: 'Firebase가 초기화되지 않았습니다. 환경변수를 확인하세요.',
      configError: true
    };
  }

  try {
    const tokenRef = doc(db!, TOKENS_COLLECTION, TOKEN_DOC_ID);
    const docSnap = await getDoc(tokenRef);
    
    if (!docSnap.exists()) {
      return {
        provider: 'Firebase Firestore',
        collection: TOKENS_COLLECTION,
        document: TOKEN_DOC_ID,
        exists: false
      };
    }

    const data = docSnap.data();
    return {
      provider: 'Firebase Firestore',
      collection: TOKENS_COLLECTION,
      document: TOKEN_DOC_ID,
      exists: true,
      hasAccessToken: !!data.access_token,
      hasRefreshToken: !!data.refresh_token,
      lastUpdated: data.updated_at,
      created: data.created_at
    };
  } catch (error: any) {
    if (isPermissionError(error)) {
      return {
        provider: 'Firebase Firestore',
        collection: TOKENS_COLLECTION,
        document: TOKEN_DOC_ID,
        exists: false,
        error: 'Firebase 권한 오류 - Firestore 보안 규칙을 확인하세요',
        permissionDenied: true
      };
    } else {
      return {
        provider: 'Firebase Firestore',
        collection: TOKENS_COLLECTION,
        document: TOKEN_DOC_ID,
        exists: false,
        error: error.message
      };
    }
  }
} 