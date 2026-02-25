import { data } from "react-router";
import safeStorage from "../safeStorage";
import config from "../environment";

// Bounded logger in safeStorage (keeps last 10 entries, cleared on tab close)
const addLog = (msg, level = 'info') => {
    try {
        const arr = JSON.parse(safeStorage.getItem('preloadDebugLog') || '[]');

        const entry = `[${new Date().toISOString()}] [${level}] ${msg}`;
        arr.push(entry);
        // cap to last 10
        const trimmed = arr.length > 10 ? arr.slice(arr.length - 10) : arr;
        safeStorage.setItem('preloadDebugLog', JSON.stringify(trimmed));
        // also mirror in console
        // eslint-disable-next-line no-console
        console.log(entry);
        if (msg != "Invio dei log non riuscito")
            sendLogs()
    } catch (e) {}
};

const debug = true;
const addDebugLog = (msg, level = 'info') => {
    if (!debug)
        return;
    try {
        const arr = JSON.parse(safeStorage.getItem('preloadDebugLog') || '[]');
        const entry = `[${new Date().toISOString()}] [${level}(debug)] ${msg}`;
        arr.push(entry);
        const trimmed = arr.length > 10 ? arr.slice(arr.length - 10) : arr;
        safeStorage.setItem('preloadDebugLog', JSON.stringify(trimmed));
        console.log(entry);
    } catch (e) {}
}

const sendLogs = async () => {
    const logs = JSON.parse(safeStorage.getItem('preloadDebugLog') || '[]');
    safeStorage.removeItem("preloadDebugLog")
    const arr = [];
    logs.forEach(line => {
        const attributes = line.split("]")
        const data = new Date(attributes[0].substring(1));
        arr.push({
            "Data": data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear(),
            "Ora": data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds(),
            "Livello": attributes[1].substring(2),
            "Messaggio": attributes[2].substring(1),
        })
    });
    let payload = {};
    payload["User"] = safeStorage.getItem("userID") || "Non loggato"
    payload["Logs"] = arr;

    fetch(config.invio_logs, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain",
        },
        body: JSON.stringify(payload),
        redirect: "follow", //solo per web app
    }).catch(() => {
        safeStorage.setItem('preloadDebugLog', JSON.stringify(logs));
        addLog("Invio dei log non riuscito", "warn");
    });


}

export { addLog, addDebugLog, sendLogs };