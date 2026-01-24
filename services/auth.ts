import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
}   from "firebase/auth";
import { auth } from "./firebase";
// Registrierung eines neuen Benutzers mit E-Mail und Passwort
export async function register(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, {displayName});
    return cred.user;
}

export async function login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
}

export async function logout() {
    await signOut(auth);
}