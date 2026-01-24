import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/services/auth-state";
import { logout } from "@/services/auth";
import { uploadImageAsync } from "@/services/storage";
import { upsertUserProfile } from "@/services/users";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { registerForPushNotificationsAsync } from "@/services/notifications";
import { saveUserPushToken } from "@/services/users";
import { router } from "expo-router";
export default function ProfileScreen() {
    const { user } = useAuth();

    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function loadProfile() {
        if (!user) return;
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const data = snap.data() as any;
            setPhotoUrl(data.photoUrl ?? null);
        } else {
            setPhotoUrl(null);
        }
    }

    useEffect(() => {
        loadProfile();
    }, [user]);

    async function onChangePhoto() {
        if (!user) return;

        // 1) Permission anfragen
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Keine Berechtigung", "Bitte erlaube Zugriff auf deine Fotos.");
            return;
        }

        // 2) Bild auswählen
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.9,
        });

        if (result.canceled) return;

        const uri = result.assets[0].uri;

        try {
            setLoading(true);

            // 3) Upload nach Storage
            const path = `users/${user.uid}/profile.jpg`;
            const url = await uploadImageAsync(uri, path);

            // 4) URL in Firestore speichern
            await upsertUserProfile(user.uid, {
                displayName: user.displayName ?? user.email ?? "User",
                photoUrl: url,
            });

            // 5) UI aktualisieren
            setPhotoUrl(url);
            Alert.alert("Gespeichert", "Profilbild wurde aktualisiert.");
        } catch (e: any) {
            Alert.alert("Fehler", e?.message ?? "Unbekannter Fehler");
        } finally {
            setLoading(false);
        }
    }

    // Neue Funktion: Kamera aufnehmen, hochladen und Profil aktualisieren
    async function takePhoto() {
        if (!user) return;

        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Berechtigung fehlt", "Kamera-Berechtigung wird benötigt.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (result.canceled) return;

        const uri = result.assets[0].uri;

        try {
            setLoading(true);
            const path = `users/${user.uid}/profile.jpg`;
            const url = await uploadImageAsync(uri, path);

            await upsertUserProfile(user.uid, {
                displayName: user.displayName ?? user.email ?? "User",
                photoUrl: url,
            });

            setPhotoUrl(url);
            Alert.alert("Gespeichert", "Profilbild wurde aktualisiert.");
        } catch (e: any) {
            Alert.alert("Fehler", e?.message ?? "Unbekannter Fehler");
        } finally {
            setLoading(false);
        }
    }

    async function onLogout() {
        await logout();
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>Nicht eingeloggt.</Text>
            </View>
        );
    }

    async function onEnablePush() {
        if (!user) return;

        const token = await registerForPushNotificationsAsync();
        if (!token) return;

        await saveUserPushToken(user.uid, token);
        Alert.alert("Push Token gespeichert", token);
    }


    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Profil</Text>

            <View style={styles.card}>
                <View style={styles.avatarWrap}>
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={{ fontWeight: "700" }}>No Photo</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.name}>{user.displayName ?? "Kein Displayname"}</Text>
                <Text style={styles.email}>{user.email}</Text>

                <Pressable style={styles.btn} onPress={onEnablePush}>
                    <Text style={styles.btnText}>Push aktivieren</Text>
                </Pressable>

                {/* Galerie + Kamera Buttons */}
                <Pressable
                    style={[styles.btn, styles.btnOutline]}
                    onPress={onChangePhoto}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator /> : <Text style={styles.btnOutlineText}>Galerie</Text>}
                </Pressable>

                <Pressable
                    style={[styles.btn, styles.btnOutline]}
                    onPress={takePhoto}
                    disabled={loading}
                >
                    <Text style={styles.btnOutlineText}>Kamera</Text>
                </Pressable>
                <Pressable
                    onPress={() => router.push("/cowrite")}
                    style={{ padding: 12, backgroundColor: "#0A84FF", borderRadius: 8, marginTop: 12 }}
                >
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                        Co-Write öffnen
                    </Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnOutline]} onPress={onLogout}>
                    <Text style={styles.btnOutlineText}>Logout</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 12 },
    h1: { fontSize: 22, fontWeight: "700" },

    card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 10 },
    avatarWrap: { alignItems: "center" },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    avatarPlaceholder: { borderWidth: 1, alignItems: "center", justifyContent: "center" },

    name: { fontSize: 18, fontWeight: "700", textAlign: "center" },
    email: { fontSize: 12, opacity: 0.7, textAlign: "center" },

    btn: { backgroundColor: "#111", padding: 12, borderRadius: 10, alignItems: "center" },
    btnText: { color: "white", fontWeight: "700" },

    btnOutline: { backgroundColor: "transparent", borderWidth: 1 },
    btnOutlineText: { fontWeight: "700" },
});