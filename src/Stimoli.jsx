import safeStorage from "../safeStorage";
import { addDebugLog, addLog } from "./logs";
import { saveImage } from "./imageDB";


// Preload data URL: fetch text response, validate, and cache
const fetchSingleImage = async (src, index, timeout = 15000) => {
    if (!src) return { success: false, reason: 'missing_url' };
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const cacheBuster = `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`;
        const res = await fetch(cacheBuster, { signal: controller.signal, mode: 'cors', credentials: 'omit' });
        clearTimeout(timer);
        if (!res.ok) return { success: false, error: `HTTP ${res.status}` };


        const dataUrl = await res.text();
        saveImage(index.toString(), dataUrl)
        return { success: dataUrl, image: dataUrl };

    } catch (e) {
        addLog(`Preload immagine ${index} non riuscito: ` + e.message, "error")
        return { success: false, error: e?.message || e };
    }
};
// util: retry fetch con timeout
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const fetchWithRetry = async (u, retries = 3) => {
    for (let i = 1; i <= retries; i++) {
        try {
            const controller = new AbortController();
            const t = setTimeout(() => controller.abort(), 15000);
            const res = await fetch(u, { signal: controller.signal, mode: 'cors', credentials: 'omit' });
            clearTimeout(t);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return { success: true, data };
        } catch (e) {
            addDebugLog(`fetch attempt ${i} failed: ${e?.message || e}`, 'warn');
            if (i === retries) return { success: false, error: e };
            await wait(1000 * i);
        }
    }
};

// JSONP fallback (Safari/CORS)
const jsonpRequest = (u) => new Promise((resolve) => {
    const cb = `jsonp_${Date.now()}`;
    const script = document.createElement('script');
    let timer = setTimeout(() => { cleanup(); resolve({ success: false, error: new Error('JSONP timeout') }); }, 20000);
    function cleanup() {
        try { document.body.removeChild(script); } catch { }
        try { delete window[cb]; } catch { }
        clearTimeout(timer);
    }
    window[cb] = (json) => { cleanup(); resolve({ success: true, data: json }); };
    script.onerror = () => { cleanup(); resolve({ success: false, error: new Error('JSONP error') }); };
    script.src = `${u}&callback=${cb}`;
    document.body.appendChild(script);
});

export { fetchWithRetry, fetchSingleImage, jsonpRequest }