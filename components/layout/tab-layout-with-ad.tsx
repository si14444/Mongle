import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdBanner } from '@/components/ads/ad-banner';
import { BannerAdSize } from 'react-native-google-mobile-ads';

interface TabLayoutWithAdProps {
  children: ReactNode;
}

export function TabLayoutWithAd({ children }: TabLayoutWithAdProps) {
  const insets = useSafeAreaInsets();

  // 배너 광고 높이 (일반적으로 50px) + 여백 + 탭바 높이
  const bottomPadding = 50 + 8 + 85 + insets.bottom;

  return (
    <View style={styles.container}>
      {/* 메인 콘텐츠 */}
      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        {children}
      </View>

      {/* 광고 배너 - 탭 바로 위에 고정 */}
      <View style={[styles.adContainer, { bottom: 85 + insets.bottom }]}>
        <AdBanner size={BannerAdSize.BANNER} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  adContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000, // Android에서 다른 요소 위에 표시
  },
});