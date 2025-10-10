import { Platform } from 'react-native';
import Constants from 'expo-constants';
import mobileAds, {
  MaxAdContentRating,
  AdsConsent,
  AdsConsentStatus,
  RewardedAd,
  RewardedAdEventType,
  AdEventType
} from 'react-native-google-mobile-ads';

export class AdMobService {
  private static initialized = false;
  private static rewardedAd: RewardedAd | null = null;

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
      try {
        const consentInfo = await AdsConsent.requestInfoUpdate();

        if (consentInfo.status === AdsConsentStatus.REQUIRED) {
          // 동의 폼 표시가 필요한 경우
          await AdsConsent.showForm();
        }
      } catch (consentError) {
        // GDPR 동의 폼이 설정되지 않았거나 사용할 수 없는 경우 무시
        // 광고는 여전히 작동할 수 있음
        console.log('AdMob consent form not configured, continuing without GDPR consent');
      }

      this.initialized = true;
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
      // 에러를 throw하지 않고 무시하여 앱 실행 계속
      this.initialized = false;
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
        ? Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID || 'ca-app-pub-4535163023491412/8716780882'
        : Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMOB_IOS_REWARD_ID || 'ca-app-pub-4535163023491412/8720101579';
    } else {
      return adType === 'banner'
        ? Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || 'ca-app-pub-4535163023491412/3744205510'
        : Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMOB_ANDROID_REWARD_ID || 'ca-app-pub-4535163023491412/6331389147';
    }
  }

  /**
   * 보상형 광고 로드
   */
  static async loadRewardedAd(): Promise<void> {
    const adUnitId = this.getAdUnitId('reward');

    if (!adUnitId) {
      throw new Error('Rewarded ad unit ID not configured');
    }

    this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    return new Promise((resolve, reject) => {
      if (!this.rewardedAd) {
        reject(new Error('Failed to create rewarded ad'));
        return;
      }

      const loadedListener = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          console.log('Rewarded ad loaded');
          loadedListener();
          resolve();
        }
      );

      const errorListener = this.rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          console.error('Rewarded ad failed to load:', error);
          errorListener();
          reject(error);
        }
      );

      this.rewardedAd.load();
    });
  }

  /**
   * 보상형 광고 표시
   * @returns Promise<boolean> - 광고를 끝까지 시청했는지 여부
   */
  static async showRewardedAd(): Promise<boolean> {
    if (!this.rewardedAd) {
      throw new Error('Rewarded ad not loaded. Call loadRewardedAd() first.');
    }

    return new Promise((resolve, reject) => {
      if (!this.rewardedAd) {
        reject(new Error('Rewarded ad not available'));
        return;
      }

      let earned = false;

      const earnedListener = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('User earned reward:', reward);
          earned = true;
        }
      );

      const closedListener = this.rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          console.log('Rewarded ad closed, earned:', earned);
          earnedListener();
          closedListener();
          this.rewardedAd = null; // 광고 인스턴스 초기화
          resolve(earned);
        }
      );

      this.rewardedAd.show();
    });
  }

  /**
   * 보상형 광고가 로드되어 있는지 확인
   */
  static isRewardedAdLoaded(): boolean {
    return this.rewardedAd !== null;
  }
}