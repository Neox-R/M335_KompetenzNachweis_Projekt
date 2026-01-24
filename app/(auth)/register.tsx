import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { register } from "@/services/auth";

export default function RegisterScreen() {
    const router = useRouter();
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleRegister() {
        try {
            await register(email.trim(), password, displayName.trim());
            router.replace("/(tabs)");
        } catch (e: any) {
            Alert.alert("Registrierung fehlgeschlagen", e?.message ?? "Unbekannter Fehler");
        }
    }

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: "700" }}>Registrieren</Text>

            <TextInput
                placeholder="Anzeigename"
                value={displayName}
                onChangeText={setDisplayName}
                style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
            />

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

            <Button title="Konto erstellen" onPress={handleRegister} />

            <Text>
                Schon ein Konto? <Link href="/(auth)/login">Zum Login</Link>
            </Text>
        </View>
    );
}