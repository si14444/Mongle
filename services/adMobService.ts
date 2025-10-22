import Constants from "expo-constants";
import { Platform } from "react-native";

// Web에서는 광고 라이브러리 import 안 함
let mobileAds: any;
let MaxAdContentRating: any;
let AdsConsent: any;
let AdsConsentStatus: any;
let RewardedAd: any;
let RewardedAdEventType: any;
let AdEventType: any;

if (Platform.OS !== "web") {
  const googleMobileAds = require("react-native-google-mobile-ads");
  mobileAds = googleMobileAds.default;
  MaxAdContentRating = googleMobileAds.MaxAdContentRating;
  AdsConsent = googleMobileAds.AdsConsent;
  AdsConsentStatus = googleMobileAds.AdsConsentStatus;
  RewardedAd = googleMobileAds.RewardedAd;
  RewardedAdEventType = googleMobileAds.RewardedAdEventType;
  AdEventType = googleMobileAds.AdEventType;
}

export class AdMobService {
  private static initialized = false;
  private static rewardedAd: any = null;

  static async initialize(): Promise<void> {
    // Web에서는 광고 초기화 안 함
    if (Platform.OS === "web") {
      this.initialized = true;
      return;
    }

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
        testDeviceIdentifiers: __DEV__ ? ["EMULATOR"] : [],
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
        console.log(
          "AdMob consent form not configured, continuing without GDPR consent"
        );
      }

      this.initialized = true;
      console.log("AdMob initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AdMob:", error);
      // 에러를 throw하지 않고 무시하여 앱 실행 계속
      this.initialized = false;
    }
  }

  static isInitialized(): boolean {
    return this.initialized;
  }

  static getAdUnitId(adType: "banner" | "reward"): string {
    // 개발 모드나 Expo Go에서만 테스트 광고 사용
    // TestFlight와 프로덕션에서는 실제 광고 ID 사용
    const useTestAds = __DEV__ || Constants.appOwnership === "expo";

    if (useTestAds) {
      const testAdUnitId =
        adType === "banner"
          ? "ca-app-pub-3940256099942544/6300978111" // Google 테스트 배너 ID
          : "ca-app-pub-3940256099942544/5224354917"; // Google 테스트 보상형 광고 ID

      console.log(`[AdMob] Using TEST ad unit ID for ${adType}:`, testAdUnitId);
      return testAdUnitId;
    }

    // 프로덕션 광고 ID (TestFlight 포함)
    const adUnitId =
      Platform.OS === "ios"
        ? adType === "banner"
          ? Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID ||
            "ca-app-pub-4535163023491412/8716780882"
          : Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMOB_IOS_REWARD_ID ||
            "ca-app-pub-4535163023491412/8720101579"
        : adType === "banner"
          ? Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID ||
            "ca-app-pub-4535163023491412/3744205510"
          : Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMOB_ANDROID_REWARD_ID ||
            "ca-app-pub-4535163023491412/6331389147";

    return adUnitId;
  }

  /**
   * 보상형 광고 로드
   */
  static async loadRewardedAd(): Promise<void> {
    // Web에서는 광고 로드 안 함
    if (Platform.OS === "web") {
      console.log("[AdMob] Skipping ad load on web platform");
      return Promise.resolve();
    }

    const adUnitId = this.getAdUnitId("reward");

    if (!adUnitId) {
      const error = new Error("Rewarded ad unit ID not configured");
      console.error("[AdMob]", error.message);
      throw error;
    }

    this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    return new Promise((resolve, reject) => {
      if (!this.rewardedAd) {
        const error = new Error("Failed to create rewarded ad");
        console.error("[AdMob]", error.message);
        reject(error);
        return;
      }

      const loadedListener = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          console.log("[AdMob] ✅ Rewarded ad loaded successfully");
          loadedListener();
          resolve();
        }
      );

      const errorListener = this.rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.error(
            "[AdMob] ❌ Rewarded ad failed to load:",
            JSON.stringify(error, null, 2)
          );
          errorListener();
          reject(error);
        }
      );

      console.log("[AdMob] Starting ad load request...");
      this.rewardedAd.load();
    });
  }

  /**
   * 보상형 광고 표시
   * @returns Promise<boolean> - 광고를 끝까지 시청했는지 여부
   */
  static async showRewardedAd(): Promise<boolean> {
    // Web에서는 광고 표시 안 함
    if (Platform.OS === "web") {
      console.log("[AdMob] Skipping ad show on web platform");
      return Promise.resolve(false);
    }

    if (!this.rewardedAd) {
      const error = new Error(
        "Rewarded ad not loaded. Call loadRewardedAd() first."
      );
      console.error("[AdMob]", error.message);
      throw error;
    }

    console.log("[AdMob] Showing rewarded ad");

    return new Promise((resolve, reject) => {
      if (!this.rewardedAd) {
        const error = new Error("Rewarded ad not available");
        console.error("[AdMob]", error.message);
        reject(error);
        return;
      }

      let earned = false;

      const earnedListener = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward: any) => {
          console.log(
            "[AdMob] 🎁 User earned reward:",
            JSON.stringify(reward, null, 2)
          );
          earned = true;
        }
      );

      const closedListener = this.rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          console.log("[AdMob] Rewarded ad closed, earned:", earned);
          earnedListener();
          closedListener();
          this.rewardedAd = null; // 광고 인스턴스 초기화
          resolve(earned);
        }
      );

      console.log("[AdMob] Calling show() on rewarded ad");
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
