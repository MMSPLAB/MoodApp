import React, { useState, useEffect } from "react"
import { Button } from "@mui/material"
import { useNavigate, useParams } from "react-router"
import EastSharpIcon from '@mui/icons-material/EastSharp';
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import useQuestionarioTimer from "../../TimerQuestionario";
import config from "../../../environment";
import IstruzioniStimoli from "../Condivisi/IstruzioniStimoli";
import { addDebugLog, addLog } from "../../logs";
import safeStorage from "../../../safeStorage";
import dayjs from "dayjs";

function StimoloAttivazione() {
    const { stimulusOrder } = useParams();
    const navigate = useNavigate();
    const savedUrl = safeStorage.getItem(`stimulusURL${stimulusOrder}`);
    const savedFile = safeStorage.getItem(`stimulusFile${stimulusOrder}`);

    useQuestionarioTimer();

    const [imageUrl, setImageUrl] = useState(null);
    const [stimulusFile, setStimulusFile] = useState(null);
    const [errore, setErrore] = useState(null);
    const [arousal, setArousal] = useState("");
    const [valence, setValence] = useState("");
    const [valutazione, setValutazione] = useState(false);
    const [startingTime, setStartingTime] = useState(null);
    const [key, setKey] = useState(null);
    const [intensity, setIntensity] = useState(null);
    const [valutazioni, setValutazioni] = useState(() => {
        const saved = safeStorage.getItem("valutazioni");
        return saved ? JSON.parse(saved) : [];
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const [finalImageUrl, setFinalImageUrl] = useState(null); // URL con cache-busting per visualizzazione
    const [blobObjectUrl, setBlobObjectUrl] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    //calcolo la sessione in base alle fasce attive
    const fasceAttive = [
        [7, 10.5],   // sessione 1
        [12.5, 16],  // sessione 2
        [19, 23]   // sessione 3
    ];

    useEffect(() => {
        const storageKey = safeStorage.getItem("storageKey");
        if (storageKey) {
            setKey(storageKey);
            const savedValue = safeStorage.getItem(storageKey);
            if (savedValue !== null) {
                setIntensity(Number(savedValue));
            }
        }
    }, []);

    useEffect(() => {
        if (!finalImageUrl) {
          const timer = setTimeout(() => {
            if (!imageFound) {
              addLog(`L'immagine ${stimulusOrder} non è stata trovata dopo 30s`, "error");
              setErrore("Non è stato possibile caricare l'immagine");
              setImageError(true);
            }
          }, 30 * 1000);
          return () => clearTimeout(timer);
        }
      }, [finalImageUrl])
    

    //recuperare dal locale attivazione e valenza salvati
    useEffect(() => {
        const savedArousal = safeStorage.getItem(`arousal${stimulusOrder}`);
        if (savedArousal) {
            setArousal(savedArousal);
        };

        const savedValence = safeStorage.getItem(`valence${stimulusOrder}`);
        if (savedValence) {
            setValence(savedValence);
        };

        const savedStartingTime = safeStorage.getItem(`startingTime${stimulusOrder}`);
        if (savedStartingTime) {
            setStartingTime(savedStartingTime);
        }

        if (savedUrl && savedFile) {
            // Check if we have cached data URL from preload
            const cachedDataURL = safeStorage.getItem(`stimulusDataURL${stimulusOrder}`);

            if (cachedDataURL && cachedDataURL.startsWith('data:')) {
                // Use cached data URL directly - instant loading!
                setImageUrl(savedUrl);
                setFinalImageUrl(cachedDataURL);
                setStimulusFile(savedFile);
                setValutazione(true); // Skip directly to evaluation since image is ready
            } else {
                // No cached data URL, fetch it now with cache-busting
                const separator = savedUrl.includes('?') ? '&' : '?';
                const urlWithCacheBusting = `${savedUrl}${separator}t=${Date.now()}`;

                setImageUrl(savedUrl);
                //setFinalImageUrl(urlWithCacheBusting);
                // try blob fallback in background
                fetchImageAsBlob(urlWithCacheBusting);
                setStimulusFile(savedFile);
            }
        }

    }, [stimulusOrder]);

    // Aspetta un secondo dalla comparsa dell'immagine prima di consentire la valutazione
    useEffect(() => {
        if (finalImageUrl) {
            setValutazione(true);
        }
    }, [finalImageUrl]);

    // Fetch image as blob to bypass WebView cache/MIME issues (Safari/iOS compatible)
    const fetchImageAsBlob = async (u) => {
        try {
            // revoke previous blob if any
            if (blobObjectUrl) {
                URL.revokeObjectURL(blobObjectUrl);
                setBlobObjectUrl(null);
            }

            const controller = new AbortController();
            const t = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(u, { signal: controller.signal, mode: 'cors', credentials: 'omit', redirect: 'follow' });
            clearTimeout(t);
            if (!res.ok) {
                addDebugLog(`Blob fetch HTTP ${res.status} ${u}`);
                return false;
            }

            // Check if response is a data URL (text) or blob
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('text/plain')) {
                // It's a data URL as text
                const dataUrl = await res.text();
                if (!dataUrl || !dataUrl.startsWith('data:')) {
                    addLog(`Data URL non valido per attivazione ${stimulusOrder}: ${dataUrl.substring(0, 50)}`, "error");
                    return false;
                }
                // Use data URL directly, no need for createObjectURL
                setFinalImageUrl(dataUrl);
                return true;
            } else {
                // It's a blob
                const blob = await res.blob();
                if (!blob || blob.size === 0) {
                    return false;
                }
                const obj = URL.createObjectURL(blob);
                setBlobObjectUrl(obj);
                setFinalImageUrl(obj);
                return true;
            }
        } catch (e) {
            addLog(`Blob fetch fallito per attivazione ${stimulusOrder}: ${e?.message || e}`, "error");
            return false;
        }
    };


    const handleReloadImage = () => {
        if (savedFile && savedUrl) {
            setImageError(false);
            setRetryCount(prev => prev + 1);

            const separator = savedUrl.includes('?') ? '&' : '?';
            const urlWithCacheBusting = `${savedUrl}${separator}t=${Date.now()}&retry=${retryCount}`;

            setImageUrl(savedUrl);
            setFinalImageUrl(urlWithCacheBusting);
            fetchImageAsBlob(urlWithCacheBusting);
            setStimulusFile(savedFile);
        } else {
            addLog(`Immagine non trovata nella cache per attivazione ${stimulusOrder}`, "errore")
            setErrore("Immagine non trovata nella cache, impossibile ricaricare.");
            handleNext()
        }
    };

    // Retry automatico fino a 2 tentativi quando immagine fallisce
    useEffect(() => {
        if (imageError && retryCount < 2) {
            addLog(`Immagine ${stimulusOrder} non trovata, retry automatico ${retryCount + 1}/2...`
                , "warn");
            const timer = setTimeout(() => {
                handleReloadImage();
            }, 1500); // Attendi 1.5s prima di ritentare
            return () => clearTimeout(timer);
        }
        else if (retryCount >= 2)
            addLog(`Immagine ${stimulusOrder} non trovata`, "error")
    }, [imageError, retryCount]);

    // No external browser for images: use internal retry & copy link instead
    // No external access or link copy for images

    //salvataggio temporaneo nello useState 
    const onArousalSelection = (selected) => {
        const arousal = selected.currentTarget.value;
        setArousal(arousal);
    }

    //salvare in locale
    useEffect(() => {
        safeStorage.setItem(`arousal${stimulusOrder}`, arousal);
    }, [arousal, stimulusOrder]);


    const handleNext = async () => {
        const now = new Date();
        const endingTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        safeStorage.setItem(`endingTime${stimulusOrder}`, endingTime);
        const stimulusID = safeStorage.getItem(`stimulusURL${stimulusOrder}`).split("=")[1]
        const url = "https://drive.google.com/thumbnail?id=" + stimulusID;

        const nuovaValutazione = {
            stimulusOrder,
            stimulusFile,
            startingTime,
            endingTime,
            valence,
            arousal,
            url
        };

        // Recupera le valutazioni aggiornate, incluso l'ultimo stimolo
        const valutazioniSalvate = safeStorage.getItem("valutazioni");
        const valutazioniParse = valutazioniSalvate ? JSON.parse(valutazioniSalvate) : [];
        const valutazioniFinali = [...valutazioniParse, nuovaValutazione];
        safeStorage.setItem("valutazioni", JSON.stringify(valutazioniFinali));

        const nextStimolo = Number(stimulusOrder) + 1;
        if (nextStimolo <= 10) {
            navigate(`/stimolo-valenza/${nextStimolo}`);
        } else {
            // ✅ Solo quando hai finito tutti gli stimoli

            //recupero lo stato
            let completati = parseInt(safeStorage.getItem("completati") || "0", 10);
            let totali = parseInt(safeStorage.getItem("questionariCompletatiTotali") || "0", 10);
            let completate = JSON.parse(safeStorage.getItem("fasceCompletate") || "[false,false,false]");

            const today = new Date().toLocaleDateString("it-IT").slice(0, 10);
            const savedDate = safeStorage.getItem("dataQuestionariCompletati");
            //resetto i contatori se è un nuovo giorno
            if (savedDate !== today) {
                safeStorage.setItem("dataQuestionariCompletati", today);
                completati = 0
                completate = "[false,false,false]"
            }
            //incremento i contatori
            completati += 1;
            totali += 1;

            //segno la fascia corrente come completata
            const fasciaCorrenteIndex = safeStorage.getItem("fasciaCorrenteIndex") || "3";
            if (fasciaCorrenteIndex !== null) {
                completate[parseInt(fasciaCorrenteIndex, 10)] = true;
            }

            //mostra il messaggio solo per l'ultimo stimolo visualizzato
            setSubmitError(null);
            setIsSubmitting(true);
            const globalEndingTime = now.toISOString();
            safeStorage.setItem("endingTimeGlobal", globalEndingTime);
            const sessione = parseInt(fasciaCorrenteIndex, 10) + 1; // -1 se fuori dalle fasce
            const dataToSave = {
                UserID: safeStorage.getItem("userID"),
                Data: {
                    day: safeStorage.getItem("dataQuestionariCompletati"),
                    time: safeStorage.getItem("orarioInizioMood"),
                    session: sessione,
                    fasce: JSON.stringify(completate),
                    mood: safeStorage.getItem("selectedMood"),
                    intensity: intensity,
                    datiStimoli: valutazioniFinali,
                    physicalActivity: safeStorage.getItem("attività"),
                    activityDetails: safeStorage.getItem("attività") === "true" ? {
                        start: dayjs(safeStorage.getItem("inizioAttività")).format("HH:mm"),
                        end: dayjs(safeStorage.getItem("fineAttività")).format("HH:mm"),
                        description: safeStorage.getItem("tipoAttività")
                    } : null
                }
            };

            // Salva per retry
            safeStorage.setItem("dataPickAMood-finale", JSON.stringify(dataToSave));
            addDebugLog("Dati inviati per Pick a Mood: " + JSON.stringify(dataToSave))

            try {
                // Timeout di 25 secondi per dare tempo ad Apps Script
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 25000);

                const response = await fetch(config.salvataggio_pick_a_mood, {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain",
                    },
                    body: JSON.stringify(dataToSave),
                    signal: controller.signal,
                    redirect: "follow" // Necessario per Safari con Apps Script
                });

                clearTimeout(timeoutId);
                const body = await response.text();

                // Se la richiesta ha avuto successo (200-299), consideriamo i dati salvati
                if (response.ok && !(body['status'] && body['status'].toUpperCase() === "ERROR")) {
                    addLog("PickAMood salvato. Risposta server:" + body);
                    //salvo in safeStorage contatori e fascia completata
                    safeStorage.setItem("completati", completati.toString());
                    safeStorage.setItem("questionariCompletatiTotali", totali.toString());
                    safeStorage.setItem("fasceCompletate", JSON.stringify(completate));
                    navigate("/fine-pick-a-mood");
                }
                else
                    throw new Error(body['message']);
            } catch (error) {
                addLog("Errore invio PickAMood: " + error.message, "error");
                if (error.name === 'AbortError') {
                    setSubmitError("⏱️ Il server sta impiegando troppo tempo. Riprova o controlla se i dati sono stati salvati.");
                } else {
                    setSubmitError("❌ Errore di connessione. Verifica la connessione e riprova.");
                }
                setIsSubmitting(false);
            }
        }
    };


    return (
        <>
            {submitError ? (
                <div>
                    <p>{submitError}</p>
                    <Button onClick={handleNext} variant="contained" className="error-button">Invia Dati</Button>
                </div>
            ) : (
                <div className="stimolo-valutazione">

                    <IstruzioniStimoli />

                    {/* Contenuto principale della pagina */}
                    <div className="stimolo-titolo-immagine">
                        <div className="stimolo-titolo">
                            <h3>Immagine {stimulusOrder}/10</h3>
                        </div>
                        <div className="image-container">
                            <img
                                src={finalImageUrl || "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjN5MjF5OHB5ejRxOWs4dG5oc3hkYzV5NDBwNzdxenpsNzlmaWNiNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hWZBZjMMuMl7sWe0x8/giphy.gif"}
                                alt="Stimolo"
                                style={{ maxWidth: "90%", maxHeight: "400px", margin: "20px 0" }}
                                onLoad={() => { setImageError(false); setRetryCount(0); }}
                                onError={(e) => { console.error("❌ Errore caricamento immagine attivazione:", e); setImageError(true); addDebugLog(`Errore caricamento immagine attivazione: ${finalImageUrl}`); }}
                            />
                            {imageError && (
                                <div style={{ textAlign: "center", padding: "10px" }}>
                                    <p style={{ color: 'red' }}>
                                        {retryCount < 2 ? `Ricaricamento automatico in corso... (tentativo ${retryCount + 1}/2)` : "Non riesco a caricare l'immagine. Puoi aprirla nel browser o saltarla."}
                                    </p>
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                        {retryCount >= 2 && (
                                            <Button variant="contained" size="small" onClick={() => { setArousal(-1); handleNext() }}>Prossimo step</Button>
                                        )}
                                        {/* non consentiamo apertura esterna o copia di link per le immagini */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {valutazione && (
                        <div className="valutazione-blocco">
                            <div className="valutazione-titolo">
                                <h3 className="blue">L'immagine è</h3>
                            </div>
                            <div className="attivazione">
                                <h4 className="blue valutazione-h4">Attivazione</h4>
                                <div className="valutazione">
                                    {["Molto calmante", "Calmante", "Neutrale", "Attivante", "Molto attivante"].map((a) => (
                                        <Button
                                            key={a}
                                            variant={arousal === a ? "contained" : "outlined"}
                                            value={a}
                                            onClick={onArousalSelection}
                                            className="valutazione-buttons"
                                        >
                                            {a}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="red">
                                <p>*completa tutti i campi prima di procedere.</p>
                            </div>
                            <div className="arrow-right">
                                <Button variant="contained" disabled={!arousal} onClick={handleNext}> <EastSharpIcon /></Button>
                            </div>
                        </div>)}
                </div>
            )}

            <Snackbar
                open={isSubmitting}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
                            Stiamo inviando le tue risposte al questionario, non chiudere l'applicazione...
                        </span>
                    </div>
                </Alert>
            </Snackbar>

            {/* Snackbar errore con bottone Riprova */}
            <Snackbar
                open={!!submitError && Number(stimulusOrder) === 10}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ width: '100%', left: 0, right: 0, bottom: 0, transform: 'none' }}
            >
                <Alert icon={false} severity="error" sx={{ width: '100%', textAlign: 'center', p: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                        <span><b>{submitError}</b></span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={async () => {
                                    setIsSubmitting(true);
                                    setSubmitError(null);
                                    const payload = JSON.parse(safeStorage.getItem('dataPickAMood-finale') || '{}');
                                    try {
                                        const controller = new AbortController();
                                        const t = setTimeout(() => controller.abort(), 25000);
                                        const res = await fetch(config.salvataggio_pick_a_mood, {
                                            method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload), signal: controller.signal, redirect: 'follow'
                                        });
                                        clearTimeout(t);
                                        if (res.ok) {
                                            console.log("✅ PickAMood salvato (retry)");
                                            navigate('/fine-pick-a-mood');
                                        } else {
                                            throw new Error(`Status ${res.status}`);
                                        }
                                    } catch (e) {
                                        console.error('Retry PickAMood:', e);
                                        setSubmitError(e.name === 'AbortError' ? '⏱️ Timeout. Riprova o controlla se salvato.' : '❌ Errore invio. Verifica connessione.');
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                            >
                                Riprova
                            </Button>
                            <Button variant="outlined" size="small" onClick={() => setSubmitError(null)}>Chiudi</Button>
                        </div>
                    </div>
                </Alert>
            </Snackbar>
        </>
    )
}

export default StimoloAttivazione