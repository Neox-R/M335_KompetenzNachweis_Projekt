import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import { createStoryDraft, listMyStories, StoryDoc } from "@/services/stories";
import { useAuth } from "@/services/auth-state";

export default function WriteScreen() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tagsText, setTagsText] = useState("");
    const [myStories, setMyStories] = useState<StoryDoc[]>([]);

    async function refreshMyStories() {
        if (!user) return;
        const items = await listMyStories(user.uid, 30);
        setMyStories(items);
    }

    useEffect(() => {
        refreshMyStories();
    }, [user]);

    async function onSaveDraft() {
        if (!user) {
            Alert.alert("Nicht eingeloggt", "Bitte zuerst einloggen.");
            return;
        }
        if (!title.trim()) {
            Alert.alert("Fehlt", "Bitte gib einen Titel ein.");
            return;
        }

        const tags = tagsText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const storyId = await createStoryDraft({
            title: title.trim(),
            description: description.trim(),
            tags,
            authorId: user.uid,
            coverUrl: null,
        });

        Alert.alert("Gespeichert!", `Entwurf erstellt (ID: ${storyId})`);
        setTitle("");
        setDescription("");
        setTagsText("");
        refreshMyStories();
    }

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Neue Story (Entwurf)</Text>

            <TextInput style={styles.input} placeholder="Titel" value={title} onChangeText={setTitle} />
            <TextInput
                style={[styles.input, { height: 90 }]}
                placeholder="Beschreibung"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <TextInput
                style={styles.input}
                placeholder="Tags (z.B. fantasy, romance)"
                value={tagsText}
                onChangeText={setTagsText}
            />

            <Pressable style={styles.btn} onPress={onSaveDraft}>
                <Text style={styles.btnText}>Speichern als Entwurf</Text>
            </Pressable>

            <Text style={styles.h2}>Meine Stories</Text>
            <FlatList
                data={myStories}
                keyExtractor={(item) => item.id!}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text>{item.published ? "✅ published" : "📝 draft"}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 10 },
    h1: { fontSize: 22, fontWeight: "700" },
    h2: { marginTop: 12, fontSize: 18, fontWeight: "600" },
    input: { borderWidth: 1, borderRadius: 10, padding: 10 },
    btn: { backgroundColor: "#111", padding: 12, borderRadius: 10, alignItems: "center" },
    btnText: { color: "white", fontWeight: "700" },
    card: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 },
    cardTitle: { fontWeight: "700" },
});
