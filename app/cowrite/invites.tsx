import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/services/auth-state";
import { acceptInvite, declineInvite, listMyInvites } from "@/services/cowrite";

export default function CowriteInvites() {
    const { user } = useAuth();
    const [invites, setInvites] = useState<any[]>([]);

    async function refresh() {
        if (!user) return;
        const list = await listMyInvites(user.uid);
        setInvites(list);
    }

    useEffect(() => {
        refresh();
    }, [user]);

    async function onAccept(item: any) {
        if (!user) return;
        await acceptInvite(item.projectId, item.inviteId, user.uid, item.role);
        await refresh();
        router.replace(`/cowrite/${item.projectId}`);
    }

    async function onDecline(item: any) {
        await declineInvite(item.projectId, item.inviteId);
        await refresh();
    }

    return (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "700" }}>Einladungen</Text>

            <FlatList
                data={invites}
                keyExtractor={(i) => i.inviteId}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => (
                    <View style={{ padding: 12, borderWidth: 1, borderColor: "#444", borderRadius: 8, gap: 8 }}>
                        <Text style={{ fontWeight: "700" }}>Projekt: {item.projectId}</Text>
                        <Text>Rolle: {item.role}</Text>

                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <Pressable
                                onPress={() => onAccept(item)}
                                style={{ padding: 10, backgroundColor: "#0A84FF", borderRadius: 8, flex: 1 }}
                            >
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Annehmen</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => onDecline(item)}
                                style={{ padding: 10, backgroundColor: "#333", borderRadius: 8, flex: 1 }}
                            >
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Ablehnen</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={{ opacity: 0.8 }}>Keine offenen Einladungen.</Text>}
            />
        </View>
    );
}
