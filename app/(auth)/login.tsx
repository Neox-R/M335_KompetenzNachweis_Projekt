import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { login } from "@/services/auth";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        try {
            await login(email.trim(), password);
            router.replace("/(tabs)");
        } catch (e: any) {
            Alert.alert("Login fehlgeschlagen", e?.message ?? "Unbekannter Fehler");
        }
    }
    return (
        <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: "700" }}>StoryTellers – Login</Text>

            <TextInput
                placeholder="E-Mail"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
            />

            <TextInput
                placeholder="Passwort"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
            />

            <Button title="Login" onPress={handleLogin} />

            <Text>
                Noch kein Konto? <Link href="/(auth)/register">Registrieren</Link>
            </Text>
        </View>
    );
}