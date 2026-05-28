import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { parseDateKey } from "./date";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export async function requestNotificationPermission() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("hersaathi-default", {
      name: "HerSaathi",
      importance: Notifications.AndroidImportance.DEFAULT
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleHerSaathiNotifications(settings, cycleInfo) {
  if (Platform.OS === "web") return false;

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings?.enabled) return false;

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  if (settings.dailyCheckIn) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "HerSaathi",
        body: "How are you today? 💜"
      },
      trigger: { hour: 9, minute: 0, repeats: true }
    });
  }

  if (settings.wellnessTip) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Wellness tip",
        body: "Remember to hydrate today 🌸"
      },
      trigger: { hour: 15, minute: 0, repeats: true }
    });
  }

  if (settings.periodReminder && cycleInfo?.nextPeriodDate && cycleInfo.nextPeriodCountdown <= 2) {
    const nextPeriod = parseDateKey(cycleInfo.nextPeriodDate);
    if (nextPeriod) {
      nextPeriod.setDate(nextPeriod.getDate() - 1);
      nextPeriod.setHours(18, 0, 0, 0);
      if (nextPeriod > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Period reminder",
            body: "Your period may start tomorrow."
          },
          trigger: nextPeriod
        });
      }
    }
  }

  return true;
}
