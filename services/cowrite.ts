import {
    addDoc,
    arrayUnion,
    collection,
    collectionGroup,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebase";

/** Rollen für Co-Write */
export type CowriteRole = "OWNER" | "EDITOR" | "VIEWER";
export type InviteRole = "EDITOR" | "VIEWER";

function canEdit(role: CowriteRole | null | undefined) {
    return role === "OWNER" || role === "EDITOR";
}

/** 1) Projekt erstellen (Owner wird automatisch Mitglied) */
export async function createCowriteProject(ownerId: string, title: string) {
    const ref = await addDoc(collection(db, "cowriteProjects"), {
        title,
        ownerId,
        memberIds: [ownerId],
        members: { [ownerId]: "OWNER" as CowriteRole },
        createdAt: serverTimestamp(),
    });
    return ref.id;
}

/** 2) Meine Projekte (über memberIds array-contains) */
export async function listMyCowriteProjects(myUid: string) {
    const q = query(
        collection(db, "cowriteProjects"),
        where("memberIds", "array-contains", myUid),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
}

/** 3) Rolle eines Users in einem Projekt lesen */
export async function getMyRole(projectId: string, myUid: string): Promise<CowriteRole | null> {
    const snap = await getDoc(doc(db, "cowriteProjects", projectId));
    if (!snap.exists()) return null;
    const data: any = snap.data();
    return (data?.members?.[myUid] as CowriteRole) ?? null;
}

/** 4) User per Email finden (users collection muss existieren!) */
export async function findUserByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    const q = query(collection(db, "users"), where("email", "==", normalized));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { uid: d.id, ...(d.data() as any) };
}

/** 5) Invite senden (Owner lädt ein) */
export async function sendCowriteInvite(
    projectId: string,
    fromUid: string,
    toUid: string,
    role: InviteRole
) {
    await addDoc(collection(db, "cowriteProjects", projectId, "invites"), {
        fromUid,
        toUid,
        role,
        status: "PENDING",
        createdAt: serverTimestamp(),
    });
}

/** 6) Meine offenen Einladungen (collectionGroup) */
export async function listMyInvites(myUid: string) {
    const q = query(
        collectionGroup(db, "invites"),
        where("toUid", "==", myUid),
        where("status", "==", "PENDING")
    );
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
        // Path sieht so aus: cowriteProjects/{projectId}/invites/{inviteId}
        const parts = d.ref.path.split("/");
        const projectId = parts[1];
        return {
            inviteId: d.id,
            projectId,
            ...(d.data() as any),
        };
    }) as any[];
}

/** 7) Invite akzeptieren: members + memberIds + Invite status */
export async function acceptInvite(projectId: string, inviteId: string, toUid: string, role: InviteRole) {
    // Mitglied eintragen
    await updateDoc(doc(db, "cowriteProjects", projectId), {
        [`members.${toUid}`]: role,
        memberIds: arrayUnion(toUid),
    });

    // Invite auf ACCEPTED
    await updateDoc(doc(db, "cowriteProjects", projectId, "invites", inviteId), {
        status: "ACCEPTED",
    });
}

/** 8) Invite ablehnen */
export async function declineInvite(projectId: string, inviteId: string) {
    await updateDoc(doc(db, "cowriteProjects", projectId, "invites", inviteId), {
        status: "DECLINED",
    });
}

/** 9) Kapitel erstellen */
export async function createCowriteChapter(projectId: string, title: string) {
    const ref = await addDoc(collection(db, "cowriteProjects", projectId, "chapters"), {
        title,
        content: "",
        updatedAt: serverTimestamp(),
        updatedBy: null,
    });
    return ref.id;
}

/** 10) Kapitel speichern (mit Rechtecheck für T13!) */
export async function saveCowriteChapter(
    projectId: string,
    chapterId: string,
    myUid: string,
    role: CowriteRole | null,
    data: { title?: string; content?: string }
) {
    // Das ist die “Logik-Sicherung” für T13:
    if (!canEdit(role)) {
        throw new Error("Keine Berechtigung: Viewer darf nicht speichern.");
    }

    await updateDoc(doc(db, "cowriteProjects", projectId, "chapters", chapterId), {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: myUid,
    });
}
