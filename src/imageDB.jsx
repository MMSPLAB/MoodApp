import { openDB } from "idb";

const dbPromise = openDB("image-db", 1, {
    upgrade(db) {
        db.createObjectStore("images");
    },
});

export async function saveImage(id, dataURL) {
    const blob = base64ToBlob(dataURL)
    const db = await dbPromise;
    await db.put("images", blob, id);
}

export async function getImageFromDB(id) {
    const db = await dbPromise;
    const img = await db.get("images", id);
    return img
}

export async function clearDB() {
    const db = await dbPromise;
    db.clear("images")
}

function base64ToBlob(dataUrl) {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}