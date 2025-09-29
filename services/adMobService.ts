import { Platform } from 'react-native';
import mobileAds, { MaxAdContentRating, AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';

export class AdMobService {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await mobileAds().initialize();

      // 광고 설정
      await mobileAds().setRequestConfiguration({
        // 최대 광고 등급 설정 (일반 관람가)
        maxAdContentRating: MaxAdContentRating.G,

        // 아동 대상 여부 설정 (아동 대상 아님)
        tagForChildDirectedTreatment: false,

        // 연령 미상 아동 대상 여부
        tagForUnderAgeOfConsent: false,

        // 테스트 기기 설정 (개발 시에만)
        testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
      });

      // GDPR 동의 처리 (유럽 사용자용)
      const consentInfo = await AdsConsent.requestInfoUpdate();

      if (consentInfo.status === AdsConsentStatus.REQUIRED) {
        // 동의 폼 표시가 필요한 경우
        await AdsConsent.showForm();
      }

      this.initialized = true;
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
      throw error;
    }
  }

  static isInitialized(): boolean {
    return this.initialized;
  }

  static getAdUnitId(adType: 'banner' | 'reward'): string {
    if (__DEV__) {
      // 개발 모드에서는 테스트 광고 ID 사용
      return adType === 'banner'
        ? 'ca-app-pub-3940256099942544/6300978111' // 테스트 배너 ID
        : 'ca-app-pub-3940256099942544/5224354917'; // 테스트 보상형 광고 ID
    }

    // 프로덕션에서는 실제 광고 ID 사용
    if (Platform.OS === 'ios') {
      return adType === 'banner'
        ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID || ''
        : process.env.EXPO_PUBLIC_ADMOB_IOS_REWARD_ID || '';
    } else {
      return adType === 'banner'
        ? process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || ''
        : process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARD_ID || '';
    }
  }
}