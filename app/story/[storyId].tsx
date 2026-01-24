import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { addChapter, getStory, listChapters, ChapterDoc, StoryDoc, publishStory } from "@/services/stories";
import { useAuth } from "@/services/auth-state";

export default function StoryDetail() {
    const { user } = useAuth();
    const { storyId } = useLocalSearchParams<{ storyId: string }>();

    const [story, setStory] = useState<StoryDoc | null>(null);
    const [chapters, setChapters] = useState<ChapterDoc[]>([]);
    const [chapterTitle, setChapterTitle] = useState("");
    const [chapterContent, setChapterContent] = useState("");

    async function load() {
        if (!storyId) return;
        const s = await getStory(storyId);
        setStory(s);
        const ch = await listChapters(storyId);
        setChapters(ch);
    }

    useEffect(() => {
        load();
    }, [storyId]);

    async function onAddChapter() {
        if (!storyId) return;
        if (!user) {
            Alert.alert("Nicht eingeloggt", "Bitte zuerst einloggen.");
            return;
        }
        if (!chapterTitle.trim() || !chapterContent.trim()) {
            Alert.alert("Fehlt", "Titel und Inhalt fürs Kapitel ausfüllen.");
            return;
        }

        await addChapter(storyId, { title: chapterTitle.trim(), content: chapterContent.trim() });
        setChapterTitle("");
        setChapterContent("");
        load();
    }

    async function onPublish() {
        if (!storyId || !story) return;

        // Minimal: nur Author darf publishen
        if (!user || user.uid !== story.authorId) {
            Alert.alert("Nicht erlaubt", "Nur der Autor kann veröffentlichen.");
            return;
        }

        await publishStory(storyId);
        Alert.alert("Veröffentlicht!", "Story ist jetzt im Feed sichtbar.");
        load();
    }

    if (!story) return <View style={styles.container}><Text>Lade Story...</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>{story.title}</Text>
            <Text style={styles.desc}>{story.description}</Text>
            <Text style={styles.meta}>Status: {story.published ? "✅ published" : "📝 draft"}</Text>

            {!story.published && (
                <Pressable style={styles.btn} onPress={onPublish}>
                    <Text style={styles.btnText}>Story veröffentlichen</Text>
                </Pressable>
            )}

            <Text style={styles.h2}>Kapitel hinzufügen</Text>
            <TextInput style={styles.input} placeholder="Kapitel Titel" value={chapterTitle} onChangeText={setChapterTitle} />
            <TextInput
                style={[styles.input, { height: 120 }]}
                placeholder="Kapitel Inhalt"
                value={chapterContent}
                onChangeText={setChapterContent}
                multiline
            />
            <Pressable style={styles.btn} onPress={onAddChapter}>
                <Text style={styles.btnText}>Kapitel speichern</Text>
            </Pressable>

            <Text style={styles.h2}>Kapitel</Text>
            <FlatList
                data={chapters}
                keyExtractor={(item) => item.id!}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={{ fontWeight: "700" }}>{item.title}</Text>
                        <Text numberOfLines={2}>{item.content}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text>Noch keine Kapitel.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 10 },
    h1: { fontSize: 22, fontWeight: "700" },
    h2: { marginTop: 10, fontSize: 18, fontWeight: "700" },
    desc: { opacity: 0.85 },
    meta: { fontSize: 12, opacity: 0.7 },
    input: { borderWidth: 1, borderRadius: 10, padding: 10 },
    btn: { backgroundColor: "#111", padding: 12, borderRadius: 10, alignItems: "center" },
    btnText: { color: "white", fontWeight: "700" },
    card: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 },
});