/**
 * 카페24 디자인 스킨에서 MOS 게시물 등록 API 호출
 * 이 파일을 카페24 스킨 프로젝트에 포함하여 사용하세요.
 */

// MOS API 설정
const MOS_API_CONFIG = {
  BASE_URL: 'https://mos-omega.vercel.app',
  BOARD_ENDPOINT: '/api/external/boards',
  TIMEOUT: 30000 // 30초 타임아웃
}

/**
 * MOS 게시물 등록 API 호출 함수
 * @param {Object} formData - 게시물 데이터
 * @param {string} formData.writer - 작성자 (필수)
 * @param {string} formData.title - 제목 (필수)
 * @param {string} formData.content - 내용 (필수)
 * @param {string} formData.category - 카테고리 (1: 견적문의, 2: 시안요청)
 * @param {string} formData.writerEmail - 작성자 이메일 (선택)
 * @param {string} formData.memberId - 회원 ID (선택)
 * @param {string} formData.nickName - 닉네임 (선택)
 * @param {boolean} formData.isSecret - 비밀글 여부 (선택)
 * @param {boolean} formData.isNotice - 공지사항 여부 (선택)
 * @param {Array} formData.attachFileUrls - 첨부파일 URL 배열 (선택)
 * @returns {Promise<Object>} API 응답 결과
 */
async function submitBoardToMOS(formData) {
  try {
    console.log('📝 MOS 게시물 등록 요청:', formData)
    
    // 필수 필드 검증
    if (!formData.writer || !formData.title || !formData.content) {
      throw new Error('필수 필드가 누락되었습니다. (작성자, 제목, 내용)')
    }

    // API 요청 데이터 구성
    const requestData = {
      boardNo: '5', // 5번 게시판 고정
      writer: formData.writer,
      title: formData.title,
      content: formData.content,
      category: formData.category || '1',
      writerEmail: formData.writerEmail || '',
      memberId: formData.memberId || '',
      nickName: formData.nickName || formData.writer,
      isSecret: formData.isSecret || false,
      isNotice: formData.isNotice || false,
      attachFileUrls: formData.attachFileUrls || []
    }

    // Fetch API로 POST 요청
    const response = await fetch(`${MOS_API_CONFIG.BASE_URL}${MOS_API_CONFIG.BOARD_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      signal: AbortSignal.timeout(MOS_API_CONFIG.TIMEOUT)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    console.log('✅ MOS 게시물 등록 성공:', result)
    return result

  } catch (error) {
    console.error('❌ MOS 게시물 등록 실패:', error)
    throw error
  }
}

/**
 * 카페24 폼에서 데이터를 추출하여 MOS API로 전송
 * @param {HTMLFormElement} form - 카페24 폼 엘리먼트
 * @param {Object} options - 추가 옵션
 */
async function handleCafe24FormSubmit(form, options = {}) {
  try {
    // 로딩 상태 표시
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]')
    const originalText = submitButton ? submitButton.textContent || submitButton.value : ''
    
    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = '등록 중...'
      submitButton.style.opacity = '0.6'
    }

    // 폼 데이터 추출
    const formData = new FormData(form)
    const boardData = {
      writer: formData.get('writer') || formData.get('name') || '',
      title: formData.get('title') || formData.get('subject') || '',
      content: formData.get('content') || formData.get('message') || '',
      category: formData.get('category') || options.defaultCategory || '1',
      writerEmail: formData.get('email') || '',
      memberId: formData.get('member_id') || '',
      nickName: formData.get('nickname') || '',
      isSecret: formData.get('secret') === 'on' || formData.get('secret') === '1',
      isNotice: formData.get('notice') === 'on' || formData.get('notice') === '1',
      attachFileUrls: options.attachFileUrls || []
    }

    // MOS API 호출
    const result = await submitBoardToMOS(boardData)

    // 성공 처리
    if (options.onSuccess) {
      options.onSuccess(result)
    } else {
      alert('게시물이 성공적으로 등록되었습니다!')
      if (options.redirectUrl) {
        window.location.href = options.redirectUrl
      } else {
        form.reset()
      }
    }

  } catch (error) {
    // 에러 처리
    console.error('게시물 등록 실패:', error)
    
    if (options.onError) {
      options.onError(error)
    } else {
      alert(`게시물 등록에 실패했습니다.\n오류: ${error.message}`)
    }

  } finally {
    // 로딩 상태 해제
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]')
    if (submitButton) {
      submitButton.disabled = false
      submitButton.textContent = originalText
      submitButton.style.opacity = '1'
    }
  }
}

/**
 * 카페24 폼에 이벤트 리스너 자동 등록
 * 사용 예시: 
 * <form id="inquiry-form" onsubmit="return false;">
 *   <!-- 폼 필드들 -->
 * </form>
 * <script>
 *   initMOSBoardIntegration('#inquiry-form', {
 *     defaultCategory: '1',
 *     redirectUrl: '/board/list'
 *   });
 * </script>
 */
function initMOSBoardIntegration(formSelector, options = {}) {
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector(formSelector)
    
    if (!form) {
      console.error(`폼을 찾을 수 없습니다: ${formSelector}`)
      return
    }

    // 폼 제출 이벤트 처리
    form.addEventListener('submit', function(e) {
      e.preventDefault() // 기본 제출 방지
      handleCafe24FormSubmit(form, options)
    })

    console.log(`✅ MOS 게시물 등록 연동이 초기화되었습니다: ${formSelector}`)
  })
}

// 전역 함수로 노출
window.MOS = {
  submitBoardToMOS,
  handleCafe24FormSubmit,
  initMOSBoardIntegration,
  CONFIG: MOS_API_CONFIG
} 