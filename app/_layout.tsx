import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import * as Updates from 'expo-updates';
import { Platform, Alert } from 'react-native';

import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryProvider } from "@/providers/QueryProvider";
import { AdMobService } from "@/services/adMobService";

export default function RootLayout() {
  // 항상 light 모드 사용
  const colorScheme = useColorScheme();
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    // AdMob 초기화 (에러는 내부적으로 처리됨)
    AdMobService.initialize();

    // EAS Update 강제 확인 및 다운로드
    async function checkForUpdates() {
      if (Platform.OS === 'web') return; // 웹에서는 업데이트 불필요
      if (!Updates.isEnabled) {
        setUpdateStatus('Updates disabled - dev mode');
        return;
      }

      try {
        console.log('Checking for updates...');
        setUpdateStatus('Checking for updates...');

        const update = await Updates.checkForUpdateAsync();
        console.log('Update check result:', update);

        if (update.isAvailable) {
          console.log('Update available! Downloading...');
          setUpdateStatus('Downloading update...');
          await Updates.fetchUpdateAsync();

          console.log('Update downloaded! Reloading...');
          setUpdateStatus('Reloading...');
          await Updates.reloadAsync();
        } else {
          console.log('No updates available');
          setUpdateStatus('No updates - already on latest');
          // Alert.alert('업데이트', '이미 최신 버전입니다.');
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
        setUpdateStatus('Update check failed: ' + error);
        // Alert.alert('업데이트 오류', String(error));
      }
    }

    // 2초 후에 업데이트 확인 (앱 로딩 후)
    const timer = setTimeout(checkForUpdates, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryProvider>
      {/* 항상 DefaultTheme(light mode) 사용 */}
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="dream/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        {/* 항상 light mode의 status bar 사용 */}
        <StatusBar style="dark" />
      </ThemeProvider>
    </QueryProvider>
  );
}
