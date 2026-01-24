import { db } from "./firebase";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

export type ChatRoom = {
    id?: string;
    name: string;
    type: "public" | "private";
    createdAt?: any;
};

export type ChatMessage = {
    id?: string;
    text: string;
    userId: string;
    displayName: string;
    createdAt?: any;
};

// 1) (Optional) "General" Raum sicherstellen (fixe ID)
export async function ensureGeneralRoom() {
    const ref = doc(db, "chatrooms", "general");
    await setDoc(
        ref,
        {
            name: "General",
            type: "public",
            createdAt: serverTimestamp(),
        },
        { merge: true }
    );
}

// 2) Chatrooms listen (einfachste Variante)
export async function listChatRooms(max: number = 30) {
    const q = query(collection(db, "chatrooms"), orderBy("createdAt", "desc"), limit(max));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...(d.data() as ChatRoom) }));
}

// 3) Raum erstellen (random ID)
export async function createChatRoom(name: string) {
    const ref = await addDoc(collection(db, "chatrooms"), {
        name,
        type: "public",
        createdAt: serverTimestamp(),
    });
    return ref.id;
}

// 4) Message senden
export async function sendMessage(roomId: string, msg: Omit<ChatMessage, "createdAt">) {
    const ref = collection(db, "chatrooms", roomId, "messages");
    await addDoc(ref, { ...msg, createdAt: serverTimestamp() });
}

// 5) Realtime: Messages abonnieren (Man bekommt reminder wenn neue messages da sind)
export function subscribeMessages(
    roomId: string,
    onData: (messages: ChatMessage[]) => void
) {
    const q = query(
        collection(db, "chatrooms", roomId, "messages"),
        orderBy("createdAt", "asc"),
        limit(200)
    );

    return onSnapshot(q, (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as ChatMessage) }));
        onData(items);
    });
}