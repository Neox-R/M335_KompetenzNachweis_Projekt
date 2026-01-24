import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

//Lädt ein lokales Bild (uri) nach Firebase Storage hoch und gibt die Download-URL zurück.

export async function uploadImageAsync(localUri: string, path: string) {
    // 1) lokale Datei als Blob lesen
    const response = await fetch(localUri);
    const blob = await response.blob();

    // 2) Storage-Referenz (Ordner/Pfad in Firebase)
    const storageRef = ref(storage, path);

    // 3) Upload
    await uploadBytes(storageRef, blob);

    // 4) Download URL holen
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
}