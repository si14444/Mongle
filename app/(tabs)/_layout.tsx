import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdBanner } from "@/components/ads/ad-banner";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BannerAdSize } from "react-native-google-mobile-ads";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: "absolute",
            bottom: Platform.OS === "android" ? 0 : insets.bottom,
            left: 0,
            right: 0,
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderTopWidth: 1,
            borderTopColor: Colors[colorScheme ?? "light"].border,
            height: Platform.OS === "android" ? 65 + insets.bottom : 65,
            paddingTop: 8,
            paddingBottom: Platform.OS === "android" ? insets.bottom : 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "홈",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            title: "기록",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="pencil" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="interpret"
          options={{
            title: "해석",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="lightbulb" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="timeline"
          options={{
            title: "타임라인",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="clock" color={color} />
            ),
          }}
        />
      </Tabs>

      {/* 광고 배너 - 탭 바 바로 위에 고정 */}
      <View style={[styles.adContainer, { bottom: 65 + insets.bottom }]}>
        <AdBanner size={BannerAdSize.BANNER} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
  },
});
