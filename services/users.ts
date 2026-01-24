import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export type UserProfile = {
    displayName: string;
    photoUrl?: string | null;
};

export async function upsertUserProfile(uid: string, profile: UserProfile) {
    // merge:true = ergänzt/überschreibt nur Felder, löscht aber nicht das Dokument
    await setDoc(doc(db, "users", uid), profile, { merge: true });
}

export async function saveUserPushToken(uid: string, expoPushToken: string) {
    await setDoc(
        doc(db, "users", uid),
        { expoPushToken },
        { merge: true }
    );
}