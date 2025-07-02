import cron from 'node-cron';
import Cafe24Client from './cafe24Client';
import { getStoredAccessToken } from './tokenStore';

class TokenScheduler {
  private client: Cafe24Client;
  private isRunning: boolean = false;
  private tasks: any[] = [];

  constructor() {
    this.client = new Cafe24Client();
  }

  // 토큰 자동 갱신 스케줄러 시작
  start() {
    if (this.isRunning) {
      console.log('⚠️ 토큰 스케줄러가 이미 실행 중입니다.');
      return;
    }

    // 매 6시간마다 토큰 상태 확인 및 갱신 (API 사용량 최소화)
    const task1 = cron.schedule('0 */6 * * *', async () => {
      await this.checkAndRefreshToken();
    });

    // 매일 자정에 토큰 상태 로그 출력
    const task2 = cron.schedule('0 0 * * *', async () => {
      await this.logTokenStatus();
    });

    this.tasks = [task1, task2];
    this.isRunning = true;
    console.log('🚀 토큰 자동 갱신 스케줄러 시작됨');
    console.log('📅 스케줄: 매 6시간마다 토큰 확인, 매일 자정 상태 로그');
  }

  // 토큰 상태 확인 및 갱신
  private async checkAndRefreshToken() {
    try {
      const token = await getStoredAccessToken();
      
      if (!token) {
        console.log('ℹ️ 저장된 Access Token이 없습니다.');
        return;
      }

      const timeLeft = token.expires_at - Date.now();
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));

      // 토큰이 30분 이내에 만료되는 경우만 갱신 (스케줄러에서는 여유있게)
      if (minutesLeft <= 30) {
        console.log(`🔄 토큰이 ${minutesLeft}분 후 만료됩니다. 갱신을 시도합니다...`);
        
        try {
          await this.client.refreshAccessToken();
          console.log('✅ 토큰 자동 갱신 완료');
        } catch (error) {
          console.error('❌ 토큰 자동 갱신 실패:', error);
        }
      } else {
        console.log(`✅ 토큰 상태 양호 (${minutesLeft}분 남음)`);
      }
    } catch (error) {
      console.error('❌ 토큰 상태 확인 중 오류:', error);
    }
  }

  // 토큰 상태 로그 출력
  private async logTokenStatus() {
    try {
      const token = await getStoredAccessToken();
      
      if (!token) {
        console.log('📊 일일 토큰 상태: 토큰 없음');
        return;
      }

      const timeLeft = token.expires_at - Date.now();
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      console.log(`📊 일일 토큰 상태: ${hoursLeft}시간 ${minutesLeft}분 남음`);
      console.log(`📅 만료 예정 시간: ${new Date(token.expires_at).toLocaleString('ko-KR')}`);
    } catch (error) {
      console.error('❌ 토큰 상태 로그 출력 중 오류:', error);
    }
  }

  // 스케줄러 중지
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ 토큰 스케줄러가 실행되고 있지 않습니다.');
      return;
    }

    // 모든 스케줄된 작업 중지
    this.tasks.forEach(task => {
      if (task && typeof task.stop === 'function') {
        task.stop();
      }
    });
    
    this.tasks = [];
    this.isRunning = false;
    console.log('🛑 토큰 자동 갱신 스케줄러 중지됨');
  }

  // 수동 토큰 갱신
  async manualRefresh(): Promise<boolean> {
    try {
      console.log('🔄 수동 토큰 갱신 시작...');
      await this.client.refreshAccessToken();
      console.log('✅ 수동 토큰 갱신 완료');
      return true;
    } catch (error) {
      console.error('❌ 수동 토큰 갱신 실패:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
const tokenScheduler = new TokenScheduler();

export default tokenScheduler; 