import { Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// Foreground-Verhalten (wenn App offen ist)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync() {
    // Push Tokens nur auf echten Geräten sinnvoll
    if (!Device.isDevice) {
        Alert.alert("Hinweis", "Push Notifications funktionieren nur auf einem echten Gerät (nicht Emulator).");
        return null;
    }

    // 1) Permission prüfen/anfragen
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        Alert.alert("Keine Berechtigung", "Du hast Push-Berechtigung abgelehnt.");
        return null;
    }

    // 2) Expo Push Token holen
    // projectId kommt je nach Setup aus Constants (Expo Doku nutzt das ebenfalls)
    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
    );

    const token = tokenResponse.data;

    // 3) Android: Notification Channel (empfohlen)
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
        });
    }

    return token;
}