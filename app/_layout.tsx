import { Stack } from "expo-router";
import { AuthProvider } from "@/services/auth-state";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
        </AuthProvider>
    );
}
