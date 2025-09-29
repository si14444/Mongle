import React, { useEffect, useState } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';
import Constants from 'expo-constants';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AdBannerProps {
  size?: BannerAdSize;
  style?: any;
}

export function AdBanner({ size = BannerAdSize.BANNER, style }: AdBannerProps) {
  const [adUnitId, setAdUnitId] = useState<string>('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // 앱이 포그라운드로 돌아올 때 광고 새로고침
  useForeground(() => {
    // 광고가 다시 로드되도록 처리
  });

  useEffect(() => {
    // 환경 변수에서 AdMob ID 가져오기
    const getAdUnitId = () => {
      if (__DEV__) {
        // 개발 모드에서는 테스트 광고 사용
        return TestIds.BANNER;
      }

      // 프로덕션에서는 실제 광고 ID 사용
      if (Platform.OS === 'ios') {
        return Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID || 'ca-app-pub-4535163023491412/8716780882';
      } else {
        return Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || 'ca-app-pub-4535163023491412/3744205510';
      }
    };

    setAdUnitId(getAdUnitId());
  }, []);

  const onAdLoaded = () => {
    console.log('Ad loaded successfully');
  };

  const onAdFailedToLoad = (error: any) => {
    console.log('Ad failed to load:', error);
  };

  if (!adUnitId) {
    return null;
  }

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
    }, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={onAdLoaded}
        onAdFailedToLoad={onAdFailedToLoad}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    minHeight: 50,
    paddingVertical: 4,
  },
});