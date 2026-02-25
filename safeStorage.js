// Safari-safe storage helpers (avoid crashes in Private Mode / quota)
const safeStorage = {
    getItem(key) {
        try { return localStorage.getItem(key); } catch { return null; }
    },
    setItem(key, value) {
        try { localStorage.setItem(key, value); } catch { /* ignore */ }
    },
    removeItem(key) {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
    },
    clear() {
        try { localStorage.clear(); } catch { /* ignore */ }
    }
};

export default safeStorage;