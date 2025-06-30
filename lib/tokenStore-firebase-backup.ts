import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { StoredToken } from './types';

// 토큰 컬렉션 및 문서 ID
const TOKENS_COLLECTION = 'cafe24_tokens';
const TOKEN_DOC_ID = 'main_token';

// Access Token 저장
export async function saveAccessToken(accessToken: string, expiresIn: number): Promise<void> {
  try {
    const tokenData: StoredToken = {
      access_token: accessToken,
      expires_at: Date.now() + (expiresIn * 1000)
    };

    const tokenRef = doc(db, TOKENS_COLLECTION, TOKEN_DOC_ID);
    
    await setDoc(tokenRef, {
      access_token: tokenData,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }, { merge: true });

    const expiresAt = new Date(tokenData.expires_at).toLocaleString('ko-KR');
    console.log(`✅ Access Token Firebase 저장 완료 (만료: ${expiresAt})`);
    console.log(`🔥 Firebase 문서: ${TOKENS_COLLECTION}/${TOKEN_DOC_ID}`);
  } catch (error: any) {
    console.error('❌ Access Token Firebase 저장 실패:', error);
    throw error;
  }
}

// Access Token 조회
export async function getStoredAccessToken(): Promise<StoredToken | null> {
  try {
    const tokenRef = doc(db, TOKENS_COLLECTION, TOKEN_DOC_ID);
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
    console.error('❌ Access Token Firebase 조회 실패:', error);
    return null;
  }
}

// Refresh Token 저장
export async function saveRefreshToken(refreshToken: string): Promise<void> {
  try {
    const tokenRef = doc(db, TOKENS_COLLECTION, TOKEN_DOC_ID);
    
    await updateDoc(tokenRef, {
      refresh_token: refreshToken,
      updated_at: new Date().toISOString()
    });

    console.log('✅ Refresh Token Firebase 저장 완료');
    console.log(`🔥 Firebase 문서: ${TOKENS_COLLECTION}/${TOKEN_DOC_ID}`);
  } catch (error: any) {
    // 문서가 없는 경우 새로 생성
    if (error.code === 'not-found') {
      const tokenRef = doc(db, TOKENS_COLLECTION, TOKEN_DOC_ID);
      await setDoc(tokenRef, {
        refresh_token: refreshToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log('✅ Refresh Token Firebase 새 문서 생성 및 저장 완료');
    } else {
      console.error('❌ Refresh Token Firebase 저장 실패:', error);
      throw error;
    }
  }
}

// Refresh Token 조회
export async function getStoredRefreshToken(): Promise<string | null> {
  try {
    const tokenRef = doc(db, TOKENS_COLLECTION, TOKEN_DOC_ID);
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
    console.error('❌ Refresh Token Firebase 조회 실패:', error);
    return null;
  }
}

// 토큰 유효성 검사
export async function isAccessTokenValid(): Promise<boolean> {
  const token = await getStoredAccessToken();
  return token !== null;
}

// 디버깅용: Firebase 토큰 정보 조회
export async function getTokenStoreInfo(): Promise<any> {
  try {
    const tokenRef = doc(db, TOKENS_COLLECTION, TOKEN_DOC_ID);
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
    return {
      provider: 'Firebase Firestore',
      collection: TOKENS_COLLECTION,
      document: TOKEN_DOC_ID,
      exists: false,
      error: error.message
    };
  }
} 