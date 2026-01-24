import { Button, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/services/auth-state";
import { logout } from "@/services/auth";

export default function ProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();

    async function handleLogout() {
        await logout();
        router.replace("/(auth)/login");
    }

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: "700" }}>Profil</Text>
            <Text>Angemeldet als: {user?.displayName || user?.email}</Text>
            <Button title="Abmelden" onPress={handleLogout} />
        </View>
    );
}