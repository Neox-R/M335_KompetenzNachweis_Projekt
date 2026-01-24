import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/services/auth-state";
import { createCowriteProject, listMyCowriteProjects } from "@/services/cowrite";

export default function CowriteHome() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function refresh() {
        if (!user) return;
        const list = await listMyCowriteProjects(user.uid);
        setProjects(list);
    }

    useEffect(() => {
        refresh();
    }, [user]);

    async function onCreate() {
        if (!user) return;
        if (!title.trim()) return;

        setLoading(true);
        try {
            const id = await createCowriteProject(user.uid, title.trim());
            setTitle("");
            await refresh();
            router.push(`/cowrite/${id}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "700" }}>Co-Write Projekte</Text>

            <Pressable
                onPress={() => router.push("/cowrite/invites")}
                style={{ padding: 12, backgroundColor: "#222", borderRadius: 8 }}
            >
                <Text style={{ color: "white", fontWeight: "600" }}>Einladungen ansehen</Text>
            </Pressable>

            <View style={{ gap: 8 }}>
                <Text style={{ fontWeight: "600" }}>Neues Projekt</Text>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Projekt-Titel"
                    style={{ borderWidth: 1, borderColor: "#666", padding: 10, borderRadius: 8 }}
                />
                <Pressable
                    onPress={onCreate}
                    style={{ padding: 12, backgroundColor: "#0A84FF", borderRadius: 8, opacity: loading ? 0.6 : 1 }}
                    disabled={loading}
                >
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                        Projekt erstellen
                    </Text>
                </Pressable>
            </View>

            <Text style={{ fontWeight: "600", marginTop: 8 }}>Meine Projekte</Text>
            <FlatList
                data={projects}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 8 }}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => router.push(`/cowrite/${item.id}`)}
                        style={{ padding: 12, borderWidth: 1, borderColor: "#444", borderRadius: 8 }}
                    >
                        <Text style={{ fontWeight: "700" }}>{item.title}</Text>
                        <Text style={{ opacity: 0.8 }}>ID: {item.id}</Text>
                    </Pressable>
                )}
            />
        </View>
    );
}
