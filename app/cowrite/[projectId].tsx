import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/services/auth-state";
import { createCowriteChapter, findUserByEmail, sendCowriteInvite, InviteRole } from "@/services/cowrite";

export default function CowriteProject() {
    const { projectId } = useLocalSearchParams<{ projectId: string }>();
    const { user } = useAuth();

    const [project, setProject] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<InviteRole>("EDITOR");

    // Projekt live laden
    useEffect(() => {
        if (!projectId) return;
        return onSnapshot(doc(db, "cowriteProjects", projectId), (snap) => {
            setProject(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        });
    }, [projectId]);

    // Kapitel live laden
    useEffect(() => {
        if (!projectId) return;
        const q = query(collection(db, "cowriteProjects", projectId, "chapters"), orderBy("updatedAt", "desc"));
        return onSnapshot(q, (snap) => {
            setChapters(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
    }, [projectId]);

    const myRole = user && project?.members?.[user.uid];

    async function onInvite() {
        if (!user) return;
        if (!projectId) return;
        if (!inviteEmail.trim()) return;

        // Nur OWNER darf einladen (fürs Projekt sauber)
        if (myRole !== "OWNER") {
            alert("Nur der OWNER darf Einladungen senden.");
            return;
        }

        const found = await findUserByEmail(inviteEmail);
        if (!found) {
            alert("User mit dieser Email nicht gefunden. (users collection prüfen)");
            return;
        }

        await sendCowriteInvite(projectId, user.uid, found.uid, inviteRole);
        setInviteEmail("");
        alert("Invite gesendet!");
    }

    async function onNewChapter() {
        if (!projectId) return;
        const id = await createCowriteChapter(projectId, "Neues Kapitel");
        router.push(`/cowrite/${projectId}/chapter/${id}`);
    }

    if (!project) {
        return (
            <View style={{ flex: 1, padding: 16 }}>
                <Text>Projekt lädt / nicht gefunden…</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "700" }}>{project.title}</Text>
            <Text style={{ opacity: 0.8 }}>Meine Rolle: {String(myRole ?? "—")}</Text>

            {/* Invite Bereich (nur Owner) */}
            <View style={{ padding: 12, borderWidth: 1, borderColor: "#444", borderRadius: 8, gap: 8 }}>
                <Text style={{ fontWeight: "700" }}>User einladen (T12)</Text>
                <TextInput
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    placeholder="Email des Users"
                    autoCapitalize="none"
                    style={{ borderWidth: 1, borderColor: "#666", padding: 10, borderRadius: 8 }}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                    <Pressable
                        onPress={() => setInviteRole("EDITOR")}
                        style={{ padding: 10, borderRadius: 8, flex: 1, backgroundColor: inviteRole === "EDITOR" ? "#0A84FF" : "#333" }}
                    >
                        <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>EDITOR</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setInviteRole("VIEWER")}
                        style={{ padding: 10, borderRadius: 8, flex: 1, backgroundColor: inviteRole === "VIEWER" ? "#0A84FF" : "#333" }}
                    >
                        <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>VIEWER</Text>
                    </Pressable>
                </View>

                <Pressable onPress={onInvite} style={{ padding: 12, backgroundColor: "#222", borderRadius: 8 }}>
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Invite senden</Text>
                </Pressable>
            </View>

            {/* Kapitel */}
            <Pressable onPress={onNewChapter} style={{ padding: 12, backgroundColor: "#0A84FF", borderRadius: 8 }}>
                <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Kapitel erstellen</Text>
            </Pressable>

            <Text style={{ fontWeight: "700" }}>Kapitel</Text>
            <FlatList
                data={chapters}
                keyExtractor={(c) => c.id}
                contentContainerStyle={{ gap: 8 }}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => router.push(`/cowrite/${projectId}/chapter/${item.id}`)}
                        style={{ padding: 12, borderWidth: 1, borderColor: "#444", borderRadius: 8 }}
                    >
                        <Text style={{ fontWeight: "700" }}>{item.title}</Text>
                        <Text style={{ opacity: 0.8 }} numberOfLines={1}>
                            {item.content || "(leer)"}
                        </Text>
                    </Pressable>
                )}
            />
        </View>
    );
}
