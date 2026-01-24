import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/services/auth-state";
import { View, ActivityIndicator } from "react-native";

export const unstable_settings = {
    anchor: "(tabs)",
};

function RootNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    // Nicht eingeloggt: nur Auth-Routen
    if (!user) {
        return (
            <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack>
        );
    }

    // Eingeloggt: Tabs + Modal
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
        </Stack>
    );
}

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <AuthProvider>
                <RootNavigator />
            </AuthProvider>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
