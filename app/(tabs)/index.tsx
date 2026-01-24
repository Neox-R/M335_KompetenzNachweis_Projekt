import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from "react-native";
import { listPublishedStories as listStories, StoryDoc } from "@/services/stories";
import { useRouter } from "expo-router";

export default function HomeScreen() {
    const router = useRouter();
    const [stories, setStories] = useState<StoryDoc[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadStories = async (refresh = false) => {
        try {
            setError(null);
            if (refresh) setRefreshing(true);

            // listPublishedStories liefert ein Array von StoryDoc
            const res = await listStories(20);

            if (refresh) {
                setStories(res);
            } else {
                setStories((prev) => [...prev, ...res]);
            }
        } catch (e: any) {
            setError("Keine Verbindung");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadStories(true);
    }, []);

    const filteredStories = stories.filter((s) =>
        (s.title ?? "").toLowerCase().includes(query.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Feed</Text>

            {error && (
                <Text style={{ padding: 12, color: "red" }}>
                    {error}
                </Text>
            )}

            <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Suche nach Titel..."
                style={{ margin: 12, padding: 10, borderWidth: 1, borderRadius: 8 }}
            />

            <FlatList
                data={filteredStories}
                keyExtractor={(item) => item.id!}
                onRefresh={() => loadStories(true)}
                refreshing={refreshing}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.card}
                        onPress={() => router.push(`/story/${item.id}` as unknown as any)}
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        <Text numberOfLines={2}>{item.description}</Text>
                        <Text style={styles.meta}>Tags: {item.tags?.join(", ")}</Text>
                    </Pressable>
                )}
                ListEmptyComponent={<Text>Noch keine veröffentlichten Stories.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    h1: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
    card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
    title: { fontWeight: "700", fontSize: 16 },
    meta: { marginTop: 6, fontSize: 12, opacity: 0.7 },
});