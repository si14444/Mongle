import { AdBanner } from "@/components/ads/ad-banner";
import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface TabLayoutWithAdProps {
  children: ReactNode;
}

export function TabLayoutWithAd({ children }: TabLayoutWithAdProps) {
  return (
    <View style={styles.container}>
      {/* 메인 콘텐츠 */}
      <View style={styles.content}>{children}</View>

      {/* 광고 배너 - 탭 바로 위에 배치 */}
      <AdBanner />
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
});
