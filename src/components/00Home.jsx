import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router';
import { Capacitor } from '@capacitor/core';
import config from '../../environment';
import { resetQuestionario } from '../ResetQuestionario';
import safeStorage from '../../safeStorage';
import { addDebugLog, addLog } from '../logs';
import { Browser } from "@capacitor/browser";

function Home() {
    const [completatiOggi, setCompletatiOggi] = useState(0);
    const [completatiTotali, setCompletatiTotali] = useState(0);
    const [minutesToNext, setMinutesToNext] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [nextStartTime, setNextStartTime] = useState('');
    const [fasciaCorrenteIndex, setFasciaCorrenteIndex] = useState(null);
    const [faseQuestionario, setFaseQuestionario] = useState('attesa');
    const [dataInizio, setDataInizio] = useState(null);
    const [countdown, setCountdown] = useState('');

    const navigate = useNavigate();

    // Promise.allSettled polyfill (older Safari)
    if (typeof Promise.allSettled !== 'function') {
        Promise.allSettled = function (promises) {
            return Promise.all(promises.map(p => Promise.resolve(p)
                .then(value => ({ status: 'fulfilled', value }))
                .catch(reason => ({ status: 'rejected', reason }))));
        };
    }

    const userID = safeStorage.getItem("userID");
    const avatar = safeStorage.getItem("selectedAvatar");

    if(!userID || !avatar)
        navigate("/user-ID")

    // --- DEBUG: forzare abilitazione del pulsante temporaneamente ---
    const FORCE_ENABLE_QUESTIONARIO = true; // impostalo a false per tornare al comportamento normale
    // il pulsante per avviare il questionario sarà sempre abilitato indipendentemente dallo stato

    // --- DEBUG: saltare periodo di attesa iniziale ---
    const SKIP_WAIT_PERIOD = true; // impostalo a false per ripristinare i 7 giorni di attesa iniziale


    const getToday = () => new Date().toLocaleDateString('it-IT').slice(0, 10);

    const fasceAttive = [
        [7, 10.5],
        [12.5, 16],
        [19, 23]
    ];

    useEffect(() => {
        const dataRegistrazione = safeStorage.getItem('dataRegistrazione');
        if (!dataRegistrazione) return;

        //trasformo la data in oggetto Date
        const [year, month, day] = dataRegistrazione.split('-').map(Number);
        const registrazioneDate = new Date(year, month - 1, day); //mesi partono da 0 in JS per cui month-1

        const inizioCiclo = new Date(registrazioneDate);
        inizioCiclo.setDate(inizioCiclo.getDate() + 1); // il ciclo inizia il giorno dopo la registrazione

        //calcolo giorni passati
        const oggi = new Date();

        // Rimuovo gli orari per confrontare solo le date
        const soloDataOggi = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate());
        const soloDataInizio = new Date(inizioCiclo.getFullYear(), inizioCiclo.getMonth(), inizioCiclo.getDate());

        //calcolo la differenza in millisecondi
        const diffInMs = soloDataOggi - soloDataInizio;

        //converto la differenza in giorni
        const diffInGiorni = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        // Gestione date e fasi questionario
        if (diffInGiorni < 7 && !SKIP_WAIT_PERIOD) {
            setFaseQuestionario('attesa');
            const attivazione = new Date(inizioCiclo);
            attivazione.setDate(attivazione.getDate() + 7);
        } else if ((SKIP_WAIT_PERIOD || diffInGiorni >= 7) && diffInGiorni <= 13) {
            // Giorni 7-13 normali
            setFaseQuestionario('attivo');
        } else if (diffInGiorni === 14) {
            const now = new Date();
            const hour = now.getHours();
            const minutes = now.getMinutes();
            const time = hour + minutes / 60;

            const [start3, end3] = fasceAttive[2];
            const endWithBuffer = end3 + 10 / 60; // fine terza fascia + 10 minuti

            // Recupera lo stato delle fasce completate
            const fasceCompletate = JSON.parse(safeStorage.getItem("fasceCompletate") || "[false,false,false]");
            const terzaFasciaCompletata = fasceCompletate[2] === true;

            // Controlla se il Panas è già stato completato
            const panasFinaleCompletato = safeStorage.getItem("panasFinaleCompletato") === "true";

            if (panasFinaleCompletato) {
                setFaseQuestionario("terminato");
            } else if (terzaFasciaCompletata || time >= endWithBuffer) {
                // Se l'utente ha completato la terza fascia o l'orario è oltre le 22:10 → PANAS
                safeStorage.setItem("panasFinaleCompletato", "false");
                setFaseQuestionario("panas");
            } else {
                // Altrimenti è ancora attivo
                setFaseQuestionario("attivo");
            }
        } else {
            // Dopo il giorno 14 blocca tutto e vai al PANAS se non già fatto
            const panasFinaleCompletato = safeStorage.getItem("panasFinaleCompletato");
            if (panasFinaleCompletato === "true") {
                setFaseQuestionario('terminato');
            } else {
                safeStorage.setItem("panasFinaleCompletato", "false");
                setFaseQuestionario('panas');
            }
        }

        if (dataRegistrazione) {
            const [year, month, day] = dataRegistrazione.split('-').map(Number);
            const registrazioneDate = new Date(year, month - 1, day);

            const inizio = new Date(registrazioneDate);
            inizio.setDate(inizio.getDate() + 8); // calcolo data di inizio questionario

            setDataInizio(inizio);

            // aggiorno il countdown
            const aggiornaCountdown = () => {
                const now = new Date();
                const diff = inizio.getTime() - now.getTime();

                if (diff <= 0) {
                    setCountdown("meno di un minuto");
                    return;
                }

                const giorni = Math.floor(diff / (1000 * 60 * 60 * 24));
                const ore = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minuti = Math.floor((diff / (1000 * 60)) % 60);

                let parts = [];
                if (giorni > 0) parts.push(`${giorni} ${giorni === 1 ? "giorno" : "giorni"}`);
                if (ore > 0) parts.push(`${ore} ${ore === 1 ? "ora" : "ore"}`);
                if (minuti > 0) parts.push(`${minuti} ${minuti === 1 ? "minuto" : "minuti"}`);

                setCountdown(parts.join(", "));
            };

            aggiornaCountdown();
            const interval = setInterval(aggiornaCountdown, 60000); // aggiorna ogni minuto
            return () => clearInterval(interval);
        }
    }, []);

    const prossimoOrario = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        let result = '';

        if (hours > 0) {
            result += `${hours} ${hours > 1 ? 'ore' : 'ora'}`;
            if (minutes > 0) result += ` e ${minutes} min`;
        } else if (minutes > 0) {
            result += `${minutes} ${minutes === 1 ? 'minuto' : 'minuti'}`;
        } else {
            result = '0 minuti';
        }
        return result;
    };

    //reset contatore giornaliero
    useEffect(() => {
        function resetDailyCounters() {
            const savedDate = safeStorage.getItem('dataQuestionariCompletati');
            const today = getToday();

            resetQuestionario(false); // reset questionario senza cancellare preload

            if (savedDate !== today && faseQuestionario !== "terminato") {
                // Reset giornaliero
                safeStorage.setItem('dataQuestionariCompletati', today);
                safeStorage.setItem('completati', '0');
                safeStorage.setItem('fasceCompletate', JSON.stringify([false, false, false]));
                setCompletatiOggi(0);

                // Reset anche dei flag di preload per evitare stati "appesi" tra un giorno e l'altro
                safeStorage.removeItem('preloadAlreadyLaunched');
                safeStorage.removeItem('preloadDone');
                safeStorage.removeItem('preloadSessionKey');
                safeStorage.removeItem('preloadStartedAt');
            } else {
                const savedCount = parseInt(safeStorage.getItem('completati') || '0', 10);
                setCompletatiOggi(savedCount);
            }

            // Totale sempre aggiornato
            const totalCount = parseInt(safeStorage.getItem('questionariCompletatiTotali') || '0', 10);
            setCompletatiTotali(totalCount);
        }

        // Primo controllo subito
        resetDailyCounters();

        // Controllo ogni dieci minuti (in caso di cambio giorno mentre l’app resta aperta)
        const interval = setInterval(resetDailyCounters, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, [faseQuestionario]);

    useEffect(() => {
        function checkTime() {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const completate = JSON.parse(safeStorage.getItem("fasceCompletate") || "[false,false,false]");

            let activeNow = false;
            let currentFasciaIndex = null;

            for (let i = 0; i < fasceAttive.length; i++) {
                const [start, end] = fasceAttive[i];
                const startMinutes = start * 60 - 5; //apertura fascia 5 minuti prima
                const endMinutes = end * 60 + 10; //chiusura fascia 10 minuti dopo

                if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                    currentFasciaIndex = i;
                    if (!completate[i]) {
                        activeNow = true;
                    }
                    break;
                }
            }

            if (activeNow && currentFasciaIndex !== null ) {
                setIsActive(true);
                setFasciaCorrenteIndex(currentFasciaIndex);
                safeStorage.setItem("fasciaCorrenteIndex", currentFasciaIndex.toString());
                setMinutesToNext(null);
                setNextStartTime('');
            } else{
                setIsActive(false);
                setFasciaCorrenteIndex(null);
                safeStorage.removeItem("fasciaCorrenteIndex");

                let nextStart = null;
                for (let i = 0; i < fasceAttive.length; i++) {
                    const [start] = fasceAttive[i];
                    if (start * 60 > currentMinutes) {
                        nextStart = start * 60;
                        break;
                    }
                }

                if (nextStart === null) {
                    nextStart = fasceAttive[0][0] * 60 + 1440;
                }

                const diffMinutes = nextStart - currentMinutes;
                setMinutesToNext(diffMinutes);

                const hour = Math.floor((nextStart % 1440) / 60);
                const minute = nextStart % 60;
                const formatted = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                setNextStartTime(formatted);
            }
        }

        checkTime();
        const interval = setInterval(checkTime, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const updateCounters = () => {
            const completati = parseInt(safeStorage.getItem("completati") || "0", 10);
            const totali = parseInt(safeStorage.getItem("questionariCompletatiTotali") || "0", 10);

            setCompletatiOggi(completati);
            setCompletatiTotali(totali);
        };

        updateCounters();
    }, []);

    const handleQuestionarioClick = () => {
        if (faseQuestionario === 'panas') {
            navigate('/panas-introduzione');
            return;
        }

        if((!isActive || fasciaCorrenteIndex === null) && FORCE_ENABLE_QUESTIONARIO){
            console.log("questionario forzato")
            setFasciaCorrenteIndex(3);
            setIsActive(true);
        }

        if (isActive && fasciaCorrenteIndex !== null) {
            addLog("Inizio pick a Mood")

            //salvataggio indice fascia corrente
            safeStorage.setItem("fasciaCorrenteIndex", fasciaCorrenteIndex.toString());

            //controllo se il preload è già stato fatto
            const preloadLaunched = safeStorage.getItem("preloadAlreadyLaunched");
            const preloadDoneFlag = safeStorage.getItem("preloadDone");

            // costruisco chiave di sessione (giorno|fascia|user|avatar) per invalidare stati vecchi
            const sessionKey = `${getToday()}|fascia:${fasciaCorrenteIndex}|user:${userID}|avatar:${avatar}`;
            const prevSessionKey = safeStorage.getItem('preloadSessionKey');
            if (!prevSessionKey || prevSessionKey !== sessionKey) {
                addLog(`Sessione cambiata, reset preload`);
                resetQuestionario(true)
                safeStorage.setItem('preloadSessionKey', sessionKey);
            }

            if (preloadLaunched !== "true" || preloadDoneFlag !== "true") {
                addLog(`Inizio preload immagini`);
                resetQuestionario(true)
                // Preload immagini in background quando si avvia il questionario
                safeStorage.setItem('preloadSessionKey', sessionKey);
                safeStorage.setItem("preloadAlreadyLaunched", "true");
                safeStorage.setItem("preloadDone", "false");
                safeStorage.setItem("preloadStartedAt", new Date().toISOString());
                // Pulisce la cache immagini prima di iniziare un nuovo preload

                const baseUrl = config.somministrazione_stimoli;
                // userID e avatar già letti sopra
                if (userID && avatar) {
                    const url = `${baseUrl}?UserID=${encodeURIComponent(userID)}&Avatar=${encodeURIComponent(avatar)}`;
                    addDebugLog(`URL richiesta stimoli: ${url}`);

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

                    // Preload data URL: fetch text response, validate, and cache
                    const preloadImage = async (src, index, timeout = 15000) => {
                        addLog(src);
                        if (!src) return { success: false, reason: 'missing_url' };
                        try {
                            addLog(`Preload immagine ${index + 1}: ${src}`);
                            const controller = new AbortController();
                            const timer = setTimeout(() => controller.abort(), timeout);
                            const cacheBuster = `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`;
                            addLog(`URL con cache buster: ${cacheBuster}`);
                            const res = await fetch(cacheBuster, { signal: controller.signal, mode: 'cors', credentials: 'omit' });
                            addLog(`Risposta fetch: ${res.status}`);
                            clearTimeout(timer);
                            if (!res.ok) return { success: false, error: `HTTP ${res.status}` };

                            const contentType = res.headers.get('content-type') || '';
                            addLog(`Content-Type: ${contentType}`);
                            if (contentType.includes('text/plain')) {
                                // Data URL as text
                                const dataUrl = await res.text();
                                if (dataUrl && dataUrl.startsWith('data:')) {
                                    // Save data URL in cache for instant loading later
                                    addLog(`Data URL ricevuto per immagine ${index + 1}, lunghezza: ${dataUrl.length}`);
                                    safeStorage.setItem(`stimulusDataURL${index + 1}`, dataUrl);
                                    return { success: true };
                                }
                                addLog(`Risposta text/plain non valida per immagine ${index + 1}: ${dataUrl?.slice(0, 100)}`, 'error');
                                return { success: false, error: 'Invalid data URL' };
                            } else {
                                // Regular image blob
                                addLog(`Risposta non è text/plain, trattando come blob per immagine ${index + 1}`);
                                const blob = await res.blob();
                                return { success: blob && blob.size > 0 };
                            }
                        } catch (e) {
                            return { success: false, error: e?.message || e };
                        }
                    };

                    (async () => {
                        try {
                            const fres = await fetchWithRetry(url);
                            let json;
                            if (!fres?.success) {
                                addLog('Fetch fallito, provo JSONP...', 'warn');
                                const j = await jsonpRequest(url);
                                if (!j.success) throw new Error('Fetch e JSONP falliti');
                                json = j.data;
                            } else {
                                json = fres.data;
                                addLog(JSON.stringify(json)); 
                            }

                            if (
                                json?.message === 'OK' &&
                                Array.isArray(json?.immagini) &&
                                json.immagini.every(s => s?.url && s?.name)
                            ) {
                                if (json.immagini.length != 10)
                                    addLog(`Attenzione: numero stimoli ricevuti diverso da 10 (${json.immagini.length})`, 'error');

                                const images = json.immagini.map((s, i) => ({
                                    url: s.url,
                                    name: s.name,
                                    index: i
                                }));
                                // salva metadati solo se validi
                                addLog(JSON.stringify(images));
                                images.forEach(item => {
                                    safeStorage.setItem(`stimulusFile${item.index + 1}`, item.name);
                                    safeStorage.setItem(`stimulusURL${item.index + 1}`, item.url);
                                });
                                addLog("test");
                                // precarica e salva data URL
                                /*const results = await Promise.allSettled(images.map(it => preloadImage(it.url, it.index)));
                                addLog("test2");
                                const ok = results.filter(r => r.status === 'fulfilled' && r.value.success).length;*/
                                addLog(`Preload immagini completato: ${ok}/${json.immagini.length}`);
                                safeStorage.setItem('preloadDone', 'true');
                            } else {
                                addLog('Stimoli errati dal server: '+ JSON.stringify(json), 'error');
                            }
                        } catch (e) {
                            addLog(`Errore critico preload: ${e?.message || e}`, 'error');
                        }
                    })();
                }
                else { 
                    addLog("Dati utente mancanti, impossibile avviare preload", "error");
                    safeStorage.clear(); // pulisce tutto per evitare stati incoerenti e forzare nuovo inserimento dati
                    navigate("/user-ID")
                }
            } else {
                addLog("Preload già avviato in questa fascia")
            }

            const questionario = new Date();
            const questionarioStartTime = questionario.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            safeStorage.setItem("questionarioStartTime", questionarioStartTime);
            navigate('/pick-a-mood');
        }
    };

    const completate = JSON.parse(safeStorage.getItem("fasceCompletate") || "[false,false,false]");

    const sessioneAttivaGiaCompletata = fasciaCorrenteIndex !== null && completate[fasciaCorrenteIndex];
    //const bottoneDisabilitato = (faseQuestionario !== 'attivo' && faseQuestionario !== 'panas') || (!isActive && faseQuestionario !== 'panas') || sessioneAttivaGiaCompletata;

    // --- DEBUG: forzare abilitazione del pulsante per test temporaneo ---
    const originalBottoneDisabilitato = (faseQuestionario !== 'attivo' && faseQuestionario !== 'panas') ||
        (!isActive && faseQuestionario !== 'panas') ||
        sessioneAttivaGiaCompletata;
    // se FORCE_ENABLE_QUESTIONARIO è true il bottone sarà sempre abilitato per i test
    const bottoneDisabilitato = FORCE_ENABLE_QUESTIONARIO ? false : originalBottoneDisabilitato;

    //apertura link drive per visionare istruzioni utente su drive
    const openExternal = async (url) => {
        if (Capacitor.isNativePlatform()) {
            // Import dinamico solo su device nativi
            // Usa require per evitare che Vite faccia bundle
            const { Browser } = require("@capacitor/browser");
            await Browser.open({ url });
        } else {
            // Su web apre una nuova scheda
            window.open(url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div>
            {faseQuestionario === 'attesa' ? (
                <div>
                    {dataInizio && (
                        <div className='countdown'>
                            <div>
                                <span className='sottotitolo'>Inizio questionari:</span>
                                <span className='box'>{dataInizio.toLocaleDateString("it-IT")}</span>
                            </div>
                            <div>
                                <span className='sottotitolo'>Mancano:</span>
                                <span className='box'>{countdown}</span>
                            </div>
                        </div>
                    )}
                    <h2 className="testo-home">L’esperimento partirà a breve</h2>
                </div>
            ) : (
                <>
                    <div className='contenitore-home'>
                        <div className='barra-info'>
                            <div className='session'>
                                <span className='sottotitolo'>Oggi</span>
                                {completatiOggi}/3
                            </div>
                            <div className='completed'>
                                <span className='sottotitolo'>Completati</span>
                                {completatiTotali}
                            </div>
                        </div>
                    </div>
                    {faseQuestionario === 'terminato' ? (
                        <div>
                            <h2 className="testo-home">Grazie per aver completato l'esperimento </h2>
                        </div>
                    ) : (
                        <div className='bottone-home'>
                            <Button variant='contained' disabled={bottoneDisabilitato} onClick={handleQuestionarioClick}>
                                {faseQuestionario === 'panas'
                                    ? 'Sessione conclusa: vai al PANAS'
                                    : isActive
                                        ? 'VAI ORA!'
                                        : FORCE_ENABLE_QUESTIONARIO
                                            ? 'Forza questionario'
                                             : <>Prossimo questionario tra {prossimoOrario(minutesToNext)} ({nextStartTime})</>
                                }
                            </Button>
                        </div>
                    )}
                </>
            )
            }
            <div className='links'>
                <div className='internal-link'>
                    <Button variant="text" onClick={() => navigate("/introduzione-esperimento", { state: { fromHome: true } })}>Introduzione esperimento</Button>
                </div>
                <div className='external-link'>
                    <Button variant="text" onClick={() => openExternal(config.istruzioni)}>
                        Istruzioni esperimento su Google Drive
                    </Button>
                </div>
            </div>
        </div >
    );
}

export default Home;
