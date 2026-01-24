import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import { register } from "@/services/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

export default function RegisterScreen() {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function onRegister() {
        try {
            if (!displayName.trim()) {
                Alert.alert("Fehlt", "Bitte Displayname eingeben.");
                return;
            }

            // register() sollte ein UserCredential zurückgeben
            const cred = await register(email.trim(), password, displayName.trim());

            const uid = cred?.user?.uid;
            if (!uid) {
                Alert.alert("Fehler", "User UID nicht verfügbar.");
                return;
            }

            // Nutzer-Profil in Firestore sichern (merge=true, überschreibt nicht komplett)
            await setDoc(
                doc(db, "users", uid),
                {
                    email: email.trim(),
                    displayName: displayName.trim(),
                    createdAt: new Date(),
                },
                { merge: true }
            );

            // RootLayout schaltet automatisch auf (tabs)
        } catch (e: any) {
            Alert.alert("Registrierung fehlgeschlagen", e?.message ?? "Unbekannter Fehler");
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registrieren</Text>

            <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Displayname"
                style={styles.input}
            />

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

            <Pressable style={styles.btn} onPress={onRegister}>
                <Text style={styles.btnText}>Konto erstellen</Text>
            </Pressable>

            <Text style={styles.linkText}>
                Schon ein Konto? <Link href="/(auth)/login">Login</Link>
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