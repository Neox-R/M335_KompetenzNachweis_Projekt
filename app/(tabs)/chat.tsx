import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ChatRoom, createChatRoom, ensureGeneralRoom, listChatRooms } from "@/services/chat";

export default function ChatTab() {
    const router = useRouter();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [newRoomName, setNewRoomName] = useState("");

    async function loadRooms() {
        const items = await listChatRooms(50);
        setRooms(items);
    }

    useEffect(() => {
        (async () => {
            await ensureGeneralRoom();
            await loadRooms();
        })();
    }, []);

    async function onCreateRoom() {
        const name = newRoomName.trim();
        if (!name) {
            Alert.alert("Fehlt", "Bitte gib einen Raum-Namen ein.");
            return;
        }
        const id = await createChatRoom(name);
        setNewRoomName("");
        await loadRooms();
        // korrekt: object form mit pathname + params
        router.push({ pathname: "/chat/[chatId]", params: { chatId: id } });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Chatrooms</Text>

            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    placeholder="Neuer Raum (z.B. Writers)"
                    value={newRoomName}
                    onChangeText={setNewRoomName}
                />
                <Pressable style={styles.btn} onPress={onCreateRoom}>
                    <Text style={styles.btnText}>+</Text>
                </Pressable>
            </View>

            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id!}
                onRefresh={loadRooms}
                refreshing={false}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.card}
                        onPress={() => router.push({ pathname: "/chat/[chatId]", params: { chatId: item.id } })}
                    >
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.meta}>{item.type}</Text>
                    </Pressable>
                )}
                ListEmptyComponent={<Text>Keine Chatrooms gefunden.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 10 },
    h1: { fontSize: 22, fontWeight: "700" },
    row: { flexDirection: "row", gap: 10 },
    input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10 },
    btn: { width: 44, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    btnText: { fontSize: 22, fontWeight: "700" },
    card: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 8 },
    title: { fontWeight: "700", fontSize: 16 },
    meta: { fontSize: 12, opacity: 0.7, marginTop: 2 },
});