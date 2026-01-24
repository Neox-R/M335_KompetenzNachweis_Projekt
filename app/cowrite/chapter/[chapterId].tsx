import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useAuth } from "@/services/auth-state";
import { getMyRole, saveCowriteChapter } from "@/services/cowrite";

export default function CowriteChapterEditor() {
    const { projectId, chapterId } = useLocalSearchParams<{ projectId: string; chapterId: string }>();
    const { user } = useAuth();

    const [role, setRole] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState<string>("");

    const canEdit = role === "OWNER" || role === "EDITOR";

    // Rolle laden
    useEffect(() => {
        async function loadRole() {
            if (!user || !projectId) return;
            const r = await getMyRole(projectId, user.uid);
            setRole(r);
        }
        loadRole();
    }, [user, projectId]);

    // Kapitel live laden
    useEffect(() => {
        if (!projectId || !chapterId) return;
        return onSnapshot(doc(db, "cowriteProjects", projectId, "chapters", chapterId), (snap) => {
            if (!snap.exists()) return;
            const d: any = snap.data();
            setTitle(d.title ?? "");
            setContent(d.content ?? "");
        });
    }, [projectId, chapterId]);

    async function onSave() {
        if (!user || !projectId || !chapterId) return;
        try {
            setStatus("");
            await saveCowriteChapter(projectId, chapterId, user.uid, role, { title, content });
            setStatus("✅ Gespeichert");
        } catch (e: any) {
            // Das ist T13: Viewer darf nicht speichern
            setStatus(`❌ ${e.message}`);
        }
    }

    return (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: "700" }}>Kapitel Editor</Text>
            <Text style={{ opacity: 0.8 }}>Rolle: {String(role ?? "—")}</Text>

            <TextInput
                value={title}
                onChangeText={setTitle}
                editable={canEdit}
                placeholder="Titel"
                style={{ borderWidth: 1, borderColor: "#666", padding: 10, borderRadius: 8 }}
            />

            <TextInput
                value={content}
                onChangeText={setContent}
                editable={canEdit}
                placeholder="Kapiteltext"
                multiline
                style={{ borderWidth: 1, borderColor: "#666", padding: 10, borderRadius: 8, minHeight: 200, textAlignVertical: "top" }}
            />

            <Pressable
                onPress={onSave}
                disabled={!canEdit}
                style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: canEdit ? "#0A84FF" : "#333",
                    opacity: canEdit ? 1 : 0.6,
                }}
            >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
                    Speichern
                </Text>
            </Pressable>

            {!canEdit && (
                <Text style={{ color: "#ffcc00" }}>
                    Viewer darf nicht speichern (T13).
                </Text>
            )}

            {!!status && <Text style={{ fontWeight: "600" }}>{status}</Text>}
        </View>
    );
}
