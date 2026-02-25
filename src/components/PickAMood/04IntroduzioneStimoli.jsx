import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router";
import EastSharpIcon from '@mui/icons-material/EastSharp';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import CircularProgress from "@mui/material/CircularProgress";
import useQuestionarioTimer from "../../TimerQuestionario";
import config from "../../../environment";
import safeStorage from "../../../safeStorage";
import { addDebugLog, addLog } from "../../logs";
import { resetQuestionario } from "../../ResetQuestionario";

function IntroduzionePickAMood() {
    const navigate = useNavigate();

    useQuestionarioTimer();

    // Stati UI
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [timedOut, setTimedOut] = useState(false);
    const [retrying, setRetrying] = useState(false);
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    // Permette di forzare un tentativo di preload anche se navigator.onLine risulta false
    const [forceRetryIgnoreOffline, setForceRetryIgnoreOffline] = useState(false);

    const userID = safeStorage.getItem("userID");
    const avatar = safeStorage.getItem("selectedAvatar");

    if(!userID || !avatar)
    {
        addLog("UserID o avatar mancanti, impossibile caricare le immagini", "error")
        navigate("/user-ID")
    }

    const countCachedImages = (n = 10) => {
        let ok = 0;
        for (let i = 1; i <= n; i++) {
            const url = safeStorage.getItem(`stimulusURL${i}`);
            const name = safeStorage.getItem(`stimulusFile${i}`);
            if (url && name) ok++;
        }
        return ok;
    };

    const checkPreloadComplete = () => {
        const haveImages = countCachedImages(10) >= 10;
        const isOnline = forceRetryIgnoreOffline || (typeof navigator === 'undefined' ? true : navigator.onLine);
        return haveImages && isOnline
    };

    const retryPreload = async () => {
        setRetrying(true);
        setTimedOut(false);
        // Ignora temporaneamente lo stato offline per questo tentativo
        setOffline(false);
        setForceRetryIgnoreOffline(true);
        addLog('Preload fallito, nuovo tentativo avviato dall\'utente', "warn");

        safeStorage.setItem("preloadAlreadyLaunched", "true");
        safeStorage.setItem("preloadDone", "false");
        // Pulisce la cache immagini prima del nuovo tentativo
        resetQuestionario(true)

        const baseUrl = config.somministrazione_stimoli;
        const url = `${baseUrl}?UserID=${encodeURIComponent(userID)}&Avatar=${encodeURIComponent(avatar)}`;

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
                    addLog(`fetch attempt ${i} failed: ${e?.message || e}`, 'warn');
                    if (i === retries) return { success: false, error: e };
                    await wait(1000 * i);
                }
            }
        };

        const jsonpRequest = (u) => new Promise((resolve) => {
            const cb = `jsonp_${Date.now()}`;
            const script = document.createElement('script');
            let timer = setTimeout(() => { cleanup(); resolve({ success: false, error: new Error('JSONP timeout') }); }, 20000);
            function cleanup() {
                try { document.body.removeChild(script); } catch {}
                try { delete window[cb]; } catch {}
                clearTimeout(timer);
            }
            window[cb] = (json) => { cleanup(); resolve({ success: true, data: json }); };
            script.onerror = () => { cleanup(); resolve({ success: false, error: new Error('JSONP error') }); };
            script.src = `${u}&callback=${cb}`;
            document.body.appendChild(script);
        });

        const preloadImage = async (src, index, timeout = 15000) => {
            if (!src) return { success: false, reason: 'missing_url' };
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), timeout);
                const cacheBuster = `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`;
                const res = await fetch(cacheBuster, { signal: controller.signal, mode: 'cors', credentials: 'omit' });
                clearTimeout(timer);
                if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
                
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('text/plain')) {
                    // Data URL as text
                    const dataUrl = await res.text();
                    if (dataUrl && dataUrl.startsWith('data:')) {
                        // Save data URL in cache for instant loading later
                        safeStorage.setItem(`stimulusDataURL${index + 1}`, dataUrl);
                        return { success: true };
                    }
                    return { success: false, error: 'Invalid data URL' };
                } else {
                    // Regular image blob
                    const blob = await res.blob();
                    return { success: blob && blob.size > 0 };
                }
            } catch (e) {
                return { success: false, error: e?.message || e };
            }
        };

        try {
            const fres = await fetchWithRetry(url);
            let json;
            if (!fres?.success) {
                addLog('Fetch fallito, provo JSONP...', 'warn');
                const j = await jsonpRequest(url);
                if (!j.success)
                    throw new Error('Fetch e JSONP falliti');
                json = j.data;
            } else {
                json = fres.data;
            }

            if (
                json?.message === 'OK' &&
                Array.isArray(json?.immagini) &&
                json.immagini.length === 10 &&
                json.immagini.every(s => s?.url && s?.name)
            ) {
                const images = json.immagini.map((s, i) => ({
                    url: s.url,
                    name: s.name,
                    index: i
                }));
                images.forEach(item => {
                    safeStorage.setItem(`stimulusFile${item.index + 1}`, item.name);
                    safeStorage.setItem(`stimulusURL${item.index + 1}`, item.url);
                });
                const results = await Promise.allSettled(images.map(it => preloadImage(it.url, it.index)));
                const ok = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                addLog(`Caricamento immagini completato (retry): ${ok}/${results.length}`);
                safeStorage.setItem('preloadDone', 'true');
            } else {
                addLog('Formato dati non valido dal server (retry): ' + JSON.stringify(json), 'error');
            }
        } catch (e) {
            addLog(`Retry preload degli stimoli fallito: ${e?.message || e}`, 'error');
        } finally {
            setRetrying(false);
            checkPreloadComplete();
        }
    };

    useEffect(() => {
        let pollInterval;
        let timeoutTimer;

        const checkPreload = () => {
            if (!forceRetryIgnoreOffline) {
                if (typeof navigator !== 'undefined' && !navigator.onLine) {
                    setOffline(true);
                    setSnackbarOpen(true);
                    setLoading(true);
                    return;
                } else {
                    setOffline(false);
                }
            }

            if (checkPreloadComplete()) {
                setLoading(false);
                setSnackbarOpen(false);
                clearInterval(pollInterval);
                clearTimeout(timeoutTimer);
            } else {
                setSnackbarOpen(true);
            }
        };

        checkPreload();
        pollInterval = setInterval(checkPreload, 2000);
        timeoutTimer = setTimeout(() => {
            if (!checkPreloadComplete()) {
                addLog('Timeout preload (30s) in IntroduzioneStimoli', 'warn');
                setTimedOut(true);
                setSnackbarOpen(false);
                clearInterval(pollInterval);
            }
            else{
                setTimedOut(false);
                setLoading(false);
                setRetrying(false);
            }
        }, 30000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(timeoutTimer);
        };
    }, [retrying]);

    // Listener online/offline
    useEffect(() => {
        const onOnline = () => setOffline(false);
        const onOffline = () => setOffline(true);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/esercizio-fisico")}> <WestSharpIcon sx={{ color: '#005DD3' }} /> </Button>
            </div>
            <div className="intro-stimoli contenitore-testo">
                <h3 className="blu-maiuscolo">HAI COMPLETATO LA PRIMA PARTE DEL QUESTIONARIO</h3>
                <p className="testo">Adesso ti chiederemo di valutare&nbsp;<span className='blue'>dieci immagini</span>&nbsp;in base al loro contenuto e alle sensazioni che esse suscitano.</p>
                <p>Il tuo compito consiste nel guardare ogni immagine per indicare se per te l'immagine è: </p>
                <ul>
                    <li>
                        <b>spiacevole/negativa o piacevole/positiva</b>
                        , secondo le seguenti opzioni della scala di valenza (<span className='blue'>valence</span>)
                        <ol>
                            <li>molto negativa</li>
                            <li>negativa</li>
                            <li>neutrale</li>
                            <li>positiva</li>
                            <li>molto positiva</li>
                        </ol>
                    </li>
                    <br />
                    <li>
                        <b>rilassante/calmante o eccitante/emozionante</b>
                        , secondo le seguenti opzioni della scala di attivazione (<span className='blue'>arousal</span>)
                        <ol>
                            <li>molto calmante</li>
                            <li>calmante</li>
                            <li>neutrale</li>
                            <li>attivante</li>
                            <li>molto attivante</li>
                        </ol>
                    </li>
                </ul>
                <p>Non ti preoccupare, potrai accedere a queste informazioni da ogni schermata di valutazione.</p>
            </div>
            {/*
            <div className="arrow-right">
                {!preloadDone && (
                    <p style={{ color: 'red', marginBottom: '8px' }}>
                        *Preload in completamento, attendere qualche secondo
                    </p>
                )}
                <Button variant="contained" disabled={!preloadDone} onClick={() => navigate("/stimolo-valenza/1")}><EastSharpIcon /></Button>
            </div>
            */}


            <div className="arrow-right">
                <Button variant="contained" disabled={loading || retrying || timedOut || offline} onClick={() => navigate("/stimolo-valenza/1")}>
                    <EastSharpIcon />
                </Button>
            </div>

            {/* Snackbar caricamento normale */}
            <Snackbar
                open={snackbarOpen && !timedOut && !offline}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{
                    width: "100%",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: "none",
                }}
            >
                <Alert
                    icon={false}
                    severity="info"
                    sx={{
                        width: "100%",
                        textAlign: "center",
                        p: "0 2px 38px 2px",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CircularProgress size={30} style={{ marginBottom: "4px" }} />
                        <span>
                            Caricamento immagini in corso, attendi qualche secondo...
                        </span>
                    </div>
                </Alert>
            </Snackbar>

            {/* Snackbar offline */}
            <Snackbar
                open={offline}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ width: "100%", left: 0, right: 0, bottom: 0, transform: "none" }}
            >
                <Alert icon={false} severity="warning" sx={{ width: '100%', textAlign: 'center', p: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                        <span><b>Connessione assente.</b></span>
                        <span style={{ fontSize: '0.9em' }}>Verifica la connessione internet, poi riprova a caricare le immagini.</span>
                        <Button variant="contained" size="small" onClick={retryPreload}>
                            Riprova
                        </Button>
                    </div>
                </Alert>
            </Snackbar>

            {/* Snackbar timeout con retry */}
            <Snackbar
                open={timedOut && !retrying}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{
                    width: "100%",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: "none",
                }}
            >
                <Alert
                    severity="warning"
                    icon={false}
                    sx={{
                        width: "100%",
                        textAlign: "center",
                        p: "16px",
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                        <span><b>Caricamento immagini non riuscito.</b></span>
                        <span style={{ fontSize: '0.9em' }}>Verifica la connessione e riprova, oppure procedi comunque (le immagini si caricheranno una alla volta).</span>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Button variant="contained" size="small" onClick={retryPreload}>
                                Riprova
                            </Button>
                            <Button variant="contained" size="small" color="success" onClick={() => navigate("/stimolo-valenza/1")}>
                                Procedi comunque
                            </Button>
                            <Button variant="outlined" size="small" onClick={() => setShowLogDialog(true)}>
                                Dettagli errore
                            </Button>
                        </div>
                    </div>
                </Alert>
            </Snackbar>

            {/* Snackbar retry in corso */}
            <Snackbar
                open={retrying}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{
                    width: "100%",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: "none",
                }}
            >
                <Alert
                    severity="info"
                    icon={false}
                    sx={{
                        width: "100%",
                        textAlign: "center",
                        p: "0 2px 38px 2px",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CircularProgress size={30} style={{ marginBottom: "4px" }} />
                        <span>Nuovo tentativo di caricamento...</span>
                    </div>
                </Alert>
            </Snackbar>

            {/* Dialog log debug */}
            <Dialog open={showLogDialog} onClose={() => setShowLogDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Log caricamento immagini</DialogTitle>
                <DialogContent>
                    <p style={{ marginBottom: '12px', fontSize: '0.9em', color: 'var(--muted)' }}>
                        <b>Copia il messaggio di errore che vedi qui e invialo a claudia.rabaioli@unimib.it</b>
                    </p>
                    <pre style={{
                        fontSize: '0.75em',
                        maxHeight: '400px',
                        overflow: 'auto',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--input-fg)',
                        padding: '8px',
                        borderRadius: '4px'
                    }}>
                        {JSON.parse(safeStorage.getItem('preloadDebugLog') || '[]').join('\n')}
                    </pre>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        try {
                            navigator.clipboard.writeText(JSON.parse(safeStorage.getItem('preloadDebugLog') || '[]').join('\n'));
                            alert('Log copiato negli appunti');
                        } catch {
                            alert('Impossibile copiare (permessi clipboard)');
                        }
                    }}>
                        Copia
                    </Button>
                    <Button onClick={() => setShowLogDialog(false)}>Chiudi</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default IntroduzionePickAMood;