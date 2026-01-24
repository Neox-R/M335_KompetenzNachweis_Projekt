import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/services/auth-state";

export default function Index() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    return user ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
