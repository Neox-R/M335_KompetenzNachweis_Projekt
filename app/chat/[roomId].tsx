import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { subscribeMessages, sendMessage, ChatMessage } from "@/services/chat";
import { useAuth } from "@/services/auth-state";

export default function ChatRoomScreen() {
    const { roomId } = useLocalSearchParams<{ roomId: string }>();
    const { user } = useAuth();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState("");

    useEffect(() => {
        if (!roomId) return;
        const unsub = subscribeMessages(roomId, setMessages);
        return unsub;
    }, [roomId]);

    async function onSend() {
        const t = text.trim();
        if (!t || !roomId || !user) return;

        await sendMessage(roomId, {
            text: t,
            userId: user.uid,
            displayName: user.displayName ?? user.email ?? "User",
        });

        setText("");
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={80}
        >
            <View style={styles.container}>
                <Text style={styles.h1}>Room: {roomId}</Text>

                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id!}
                    renderItem={({ item }) => (
                        <View style={[styles.msg, item.userId === user?.uid ? styles.msgMe : styles.msgOther]}>
                            <Text style={styles.msgName}>{item.displayName}</Text>
                            <Text>{item.text}</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingVertical: 10 }}
                />

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nachricht..."
                        value={text}
                        onChangeText={setText}
                    />
                    <Pressable style={styles.sendBtn} onPress={onSend}>
                        <Text style={styles.sendText}>Send</Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 10 },
    h1: { fontSize: 16, fontWeight: "700" },

    msg: { borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 8, maxWidth: "85%" },
    msgMe: { alignSelf: "flex-end" },
    msgOther: { alignSelf: "flex-start" },
    msgName: { fontSize: 12, fontWeight: "700", opacity: 0.7, marginBottom: 2 },

    inputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
    input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10 },
    sendBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    sendText: { fontWeight: "700" },
});