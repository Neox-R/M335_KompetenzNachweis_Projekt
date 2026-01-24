import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import { login } from "@/services/auth";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function onLogin() {
        try {
            await login(email.trim(), password);
            // kein router.replace nötig – RootLayout schaltet automatisch auf (tabs)
        } catch (e: any) {
            Alert.alert("Login fehlgeschlagen", e?.message ?? "Unbekannter Fehler");
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="E-Mail"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
            />

            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Passwort"
                secureTextEntry
                style={styles.input}
            />

            <Pressable style={styles.btn} onPress={onLogin}>
                <Text style={styles.btnText}>Einloggen</Text>
            </Pressable>

            <Text style={styles.linkText}>
                Noch kein Konto? <Link href="/(auth)/register">Registrieren</Link>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center", gap: 12 },
    title: { fontSize: 26, fontWeight: "700", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#999", borderRadius: 10, padding: 12 },
    btn: { padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1 },
    btnText: { fontWeight: "700" },
    linkText: { marginTop: 10 },
});
