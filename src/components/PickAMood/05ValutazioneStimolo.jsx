import React, { useState, useEffect } from "react"
import { Button } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import EastSharpIcon from '@mui/icons-material/EastSharp';
import useQuestionarioTimer from "../../TimerQuestionario";
import IstruzioniStimoli from "../Condivisi/IstruzioniStimoli";
import { addDebugLog, addLog } from "../../logs";

// Per finestra info scala valence arousal
import { IconButton, Tooltip, } from "@mui/material";
import safeStorage from "../../../safeStorage";
import { fetchSingleImage } from "../../Stimoli";
import { getImageFromDB } from "../../imageDB";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import config from "../../../environment";


//per reload immagine
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { resetQuestionario } from "../../ResetQuestionario";
import dayjs from "dayjs";

function ValutazioneStimolo() {
    const { stimulusOrder } = useParams();
    const navigate = useNavigate();

    useQuestionarioTimer();

    const savedUserID = safeStorage.getItem("userID");
    const savedAvatar = safeStorage.getItem("selectedAvatar");
    const imageUrl = safeStorage.getItem(`stimulusURL${stimulusOrder}`);
    const stimulusFile = safeStorage.getItem(`stimulusFile${stimulusOrder}`);

    const [errore, setErrore] = useState(null);
    const [retryCount, setRetryCount] = useState(-1); // Conta tentativi di ricaricamento automatico
    const [image, setImage] = useState(null); //URL per visualizzazione

    const [valence, setValence] = useState("");
    const [arousal, setArousal] = useState("");

    const [current, setCurrent] = useState("valence")
    const [valutazione, setValutazione] = useState(""); //serve per la comparsa ritardata della valutazione dello stimolo

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [startingTime, setStartingTime] = useState(null);
    const [hasTriedProceed, setHasTriedProceed] = useState(false);

    //Check everything is saved in cache
    if (!savedUserID || !savedAvatar) {
        addLog(`Avatar o ID non trovati in valenza ${stimulusOrder} `, "error")
        navigate("/")
    }

    if (!(stimulusFile && imageUrl)) {
        setErrore("Immagine non trovata nella memoria locale")
        addLog(`Immagine ${stimulusOrder} non caricata in cache`, "error")
    }

    const resetState = () => {
        setErrore(null);
        setRetryCount(-1); // Conta tentativi di ricaricamento automatico
        setImage(null); //URL per visualizzazione
        setValence("");
        setArousal("");
        setCurrent("valence")
        setValutazione("")
    }

    //Load image from cache (id possible) or try to reload it
    useEffect(() => {
        async function loadImage() {
            const blob = await getImageFromDB(stimulusOrder);

            if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                setImage(blobUrl)
                addDebugLog(`Immagine ${stimulusOrder} caricata dalla cache`)
            }
            else {
                addLog(`Immagine ${stimulusOrder} non salvata in cache`, "warn")
                setErrore("Immagine non precaricata, caricamento in corso")
                handleReloadImage()
            }
        }
        resetState()

        loadImage();

    }, [stimulusOrder])


    // Set start time, wait 1.5 seconds before allowing the evaluation 
    useEffect(() => {
        if (image) {
            const timer = setTimeout(() => {
                const now = new Date();
                if (!startingTime)
                    setStartingTime(now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
                setValutazione(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [stimulusOrder, image])

    const onValenceSelection = (selected) => {
        const valence = selected.currentTarget.value;
        setValence(valence);
        setHasTriedProceed(false);
    }

    const onArousalSelection = (selected) => {
        const arousal = selected.currentTarget.value;
        setArousal(arousal);
        setHasTriedProceed(false);
    }

    const handleProceedAttempt = () => {
        const isIncomplete = (current === "valence" && !valence) || (current === "arousal" && !arousal);
        if (isIncomplete) {
            setHasTriedProceed(true);
        }
    }

    const handleNext = async (e) => {
        if (e) {
            if (current === "valence") {
                setCurrent("arousal")
                return;
            }

            const now = new Date();
            const endingTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
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
            // In caso di errore nell'invio dei dati si rischia di duplicare la valutazione dello
            // stimolo 10. Questo controllo serve ad impedirlo
            if (valutazioniParse.length + 1 <= stimulusOrder) {
                const valutazioniFinali = [...valutazioniParse, nuovaValutazione];
                safeStorage.setItem("valutazioni", JSON.stringify(valutazioniFinali));
            }
        }

        const nextStimolo = Number(stimulusOrder) + 1;
        if (nextStimolo <= 10) {
            resetState()
            navigate(`/stimolo/${nextStimolo}`);
            return;
        }

        //se gli stimoli sono finiti
        await saveData()
    };

    const saveData = async (retry = false) => {
        let dataToSave = null;
        setIsSubmitting(true);
        setSubmitError(null);

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

        if (retry) {
            dataToSave = JSON.parse(safeStorage.getItem("dataPickAMood-finale"))
            addLog("Retry salvataggio Pick a Mood: " + JSON.stringify(dataToSave), "warn")
        }
        else {
            const valutazioniFinali = JSON.parse(safeStorage.getItem("valutazioni"));

            //segno la fascia corrente come completata
            const fasciaCorrenteIndex = safeStorage.getItem("fasciaCorrenteIndex") || "3";
            if (fasciaCorrenteIndex !== null) {
                completate[parseInt(fasciaCorrenteIndex, 10)] = true;
            }

            const sessione = parseInt(fasciaCorrenteIndex, 10) + 1;

            let intensity = -1
            const storageKey = safeStorage.getItem("storageKey");
            if (storageKey) {
                const savedValue = safeStorage.getItem(storageKey);
                if (savedValue !== null) {
                    intensity = Number(savedValue);
                }
            }

            if (intensity < 0)
                navigate("/")

            dataToSave = {
                UserID: savedUserID,
                Data: {
                    day: today,
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
        }


        function fakeSaveDataRequest() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        ok: false,
                        text: async () => JSON.stringify({
                            status: "ERROR",
                            message: "Simulated server failure"
                        })
                    });
                }, 5000);
            });
        }

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
                setSubmitError("⏱️ Il salvataggio sta richiedendo più tempo del previsto. Riprova tra qualche secondo.");
            } else {
                setSubmitError("❌ Errore di connessione. Verifica la connessione e riprova.");
            }
            setIsSubmitting(false);
        }

    }


    const handleReloadImage = async () => {
        setErrore("Immagine non precaricata, caricamento in corso");

        for (let attempt = 0; attempt < 2; attempt++) {
            setRetryCount(attempt);

            const separator = imageUrl.includes('?') ? '&' : '?';
            const urlWithCacheBusting =
                `${imageUrl}${separator}t=${Date.now()}&retry=${attempt}`;


            // Versione mock per simulare il fallimento della fetch
            function fakeFetchSingleImage() {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            success: false,
                            errore: "Simulated network failure"
                        });
                    }, 5000);
                });
            }

            const res = await fetchSingleImage(urlWithCacheBusting, stimulusOrder);

            if (res?.success) {
                setImage(res.image);
                setErrore(null);
                setRetryCount(0);
                return;
            }
        }

        // se tutti i tentativi falliscono
        setRetryCount(2);
        setErrore("Immagine non trovata");
    };

    return (<>
        {submitError ? (
            <div>
                <p>{submitError}</p>
                <Button onClick={() => saveData(true)} variant="contained" className="error-button">Invia Dati</Button>
            </div>
        ) : (

            <div className="stimolo-valutazione" key={stimulusOrder}>

                <IstruzioniStimoli />

                {/*Corpo principale*/}
                < div className="stimolo-titolo-immagine" >
                    <div className="stimolo-titolo">
                        <h3>Immagine {stimulusOrder}/10</h3>
                        {errore && <p style={{ color: "red" }}>⚠️ Attenzione: {errore}</p>}
                    </div>
                    <div className="image-container">
                        <img
                            src={
                                image ||
                                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjN5MjF5OHB5ejRxOWs4dG5oc3hkYzV5NDBwNzdxenpsNzlmaWNiNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hWZBZjMMuMl7sWe0x8/giphy.gif"
                            }
                            alt={stimulusFile || "Stimolo"}
                            className="image"
                            onLoad={() => {
                                if (image) {   // solo se è l'immagine reale
                                    setErrore(null);
                                    setRetryCount(0);
                                }
                            }}
                            onError={() => {
                                addLog(`Errore caricamento immagine nella schermata valenza: ${image}`, "error");
                                setErrore(`Errore caricamento immagine`)
                            }}
                        />
                    </div>
                </div>
                {errore === "Immagine non trovata nella cache" ? (
                    <div style={{ textAlign: "center", marginTop: 12 }}>
                        <p style={{ color: "red", marginBottom: 8 }}>
                            Le immagini non sono state caricate correttamente.
                        </p>
                        <Button variant="contained" size="small" onClick={() => {
                            resetQuestionario(true)
                            navigate('/')
                        }
                        }>
                            Ripeti il questionario
                        </Button>
                    </div>
                ) : (<>
                    {errore &&
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <p style={{ color: "red" }}>
                                {retryCount < 2
                                    ? `Ricaricamento in corso... (tentativo ${retryCount + 1}/2)`
                                    : "Non è stato possibile caricare questa immagine. " +
                                    "Controlla la tua connessione e prova a ricaricare l'immagine premendo il pulsante qui sotto."}
                            </p>
                            {retryCount >= 2 && (
                                <div style={{ justifyContent: 'center' }}>
                                    <Button variant="contained" size="small" onClick={async () => {
                                        handleReloadImage()
                                    }}>
                                        Riprova
                                    </Button><br />
                                    <p style={{ color: "red" }}>
                                        In alternativa, puoi passare all’immagine successiva.
                                    </p>
                                    <Button variant="contained" size="small" onClick={() => { handleNext(null) }}>
                                        Immagine successiva
                                    </Button>

                                </div>
                            )}
                        </div >}
                </>
                )}
                {valutazione && (
                    <div className="valutazione-blocco">
                        <div className="valutazione-titolo">
                            <h3 className="blue">Come valuti questa immagine?</h3>
                            <h4 className="blue">L'immagine è</h4>
                        </div>

                        {current === "valence" &&
                            <div className="valenza">
                                <h4 className="blue valutazione-h4">Valenza</h4>
                                <div className="valutazione">
                                    {["Molto negativa", "Negativa", "Neutrale", "Positiva", "Molto positiva"].map((v) => (
                                        <Button
                                            key={v}
                                            variant={valence === v ? "contained" : "outlined"}
                                            value={v}
                                            onClick={onValenceSelection}
                                            className="valutazione-buttons"
                                        >
                                            {v}
                                        </Button>
                                    ))}
                                </div>
                            </div>}
                        {current === "arousal" &&
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
                        }


                        {hasTriedProceed && (
                            <div className="red bg-solid-color arrow-right-content-aligned">
                                <p className="warning-text">Seleziona una risposta prima di continuare.</p>
                            </div>
                        )}
                        <div className="arrow-right arrow-right-content-aligned">
                            <Button variant="contained"
                                disabled={(current === "valence" && !valence) || (current === "arousal" && !arousal)}
                                onMouseDown={handleProceedAttempt}
                                onTouchStart={handleProceedAttempt}
                                onClick={handleNext}>
                                <EastSharpIcon />
                            </Button>
                        </div>
                    </div>
                )
                }
            </div >

        )}

        {/*Invio dati in corso*/}
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
                    p: "16px",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .MuiAlert-message': {
                        width: '100%',
                        padding: 0,
                    },
                }}
            >
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                    }}
                >
                    <CircularProgress size={30} style={{ marginBottom: "0px" }} />
                    <span>
                        Stiamo inviando le tue risposte. Non chiudere l’applicazione.
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
            <Alert
                icon={false}
                severity="error"
                sx={{
                    width: '100%',
                    textAlign: 'center',
                    p: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .MuiAlert-message': {
                        width: '100%',
                        padding: 0,
                    },
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                    <span><b>{submitError}</b></span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => { saveData(true) }}
                        >
                            Riprova
                        </Button>
                        <Button variant="outlined" size="small" onClick={() => setSubmitError(null)}>Chiudi</Button>
                    </div>
                </div>
            </Alert>
        </Snackbar>
    </>)
}


export default ValutazioneStimolo