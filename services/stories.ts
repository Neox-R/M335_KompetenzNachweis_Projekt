import { db } from "./firebase";
import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
    limit,
    doc,
    runTransaction,
    serverTimestamp,
    getDoc,
} from "firebase/firestore";

export type StoryDoc = {
    id?: string;
    title: string;
    description: string;
    tags: string[];
    authorId: string;
    published: boolean;
    coverUrl?: string | null;
    createdAt?: any;
    updatedAt?: any;
    likesCount?: number;
};

export type ChapterDoc = {
    id?: string;
    title: string;
    content: string;
    updatedAt?: any;
};

// 1) Story als Entwurf erstellen (T04)
export async function createStoryDraft(
    input: Omit<StoryDoc, "published" | "createdAt" | "updatedAt" | "likesCount">
) {
    const ref = await addDoc(collection(db, "stories"), {
        ...input,
        published: false,
        likesCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id; // storyId
}

// 2) Story veröffentlichen (T06)
export async function publishStory(storyId: string) {
    const ref = doc(db, "stories", storyId);
    await updateDoc(ref, {
        published: true,
        updatedAt: serverTimestamp(),
    });
}

// 3) Eine Story laden (für Detailseite)
export async function getStory(storyId: string) {
    const ref = doc(db, "stories", storyId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as StoryDoc) };
}

// 4) Feed laden (nur published)
export async function listPublishedStories(max: number = 20) {
    const q = query(
        collection(db, "stories"),
        where("published", "==", true),
        orderBy("updatedAt", "desc"),
        limit(max)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...(d.data() as StoryDoc) }));
}

// 5) “Meine Stories” (alle vom User)
export async function listMyStories(authorId: string, max: number = 20) {
    const q = query(
        collection(db, "stories"),
        where("authorId", "==", authorId),
        orderBy("updatedAt", "desc"),
        limit(max)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...(d.data() as StoryDoc) }));
}

// 6) Kapitel hinzufügen (T05)
export async function addChapter(
    storyId: string,
    input: Omit<ChapterDoc, "updatedAt">
) {
    const chaptersRef = collection(db, "stories", storyId, "chapters");
    const ref = await addDoc(chaptersRef, {
        ...input,
        updatedAt: serverTimestamp(),
    });

    // optional: Story "updatedAt" mitziehen (Feed wird “frischer”)
    await updateDoc(doc(db, "stories", storyId), {
        updatedAt: serverTimestamp(),
    });

    return ref.id;
}

// 7) Kapitel einer Story listen
export async function listChapters(storyId: string) {
    const q = query(
        collection(db, "stories", storyId, "chapters"),
        orderBy("updatedAt", "desc")
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...(d.data() as ChapterDoc) }));
}

// Likes: toggle + prüfen
export async function toggleLike(storyId: string, userId: string) {
    const storyRef = doc(db, "stories", storyId);
    const likeRef = doc(db, "stories", storyId, "likes", userId);

    await runTransaction(db, async (tx) => {
        const storySnap = await tx.get(storyRef);
        if (!storySnap.exists()) return;

        const likeSnap = await tx.get(likeRef);
        const current = (storySnap.data().likesCount as number) ?? 0;

        if (likeSnap.exists()) {
            tx.delete(likeRef);
            tx.update(storyRef, { likesCount: Math.max(0, current - 1) });
        } else {
            tx.set(likeRef, { createdAt: serverTimestamp() });
            tx.update(storyRef, { likesCount: current + 1 });
        }
    });
}

export async function hasLiked(storyId: string, userId: string) {
    const likeRef = doc(db, "stories", storyId, "likes", userId);
    const snap = await getDoc(likeRef);
    return snap.exists();
}