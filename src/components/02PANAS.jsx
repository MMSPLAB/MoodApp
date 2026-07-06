import React, { useEffect, useState } from "react";
import { Button, Slider, Box } from "@mui/material";
import { useNavigate, useParams } from 'react-router';
import panas from "../assets/PANASQuestions.json";
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import config from "../../environment";
import safeStorage from "../../safeStorage";
import { addDebugLog, addLog } from "../logs";

function PANAS() {
    const { questionNumber, type } = useParams();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [hasTriedProceed, setHasTriedProceed] = useState(false);

    if (!type || (type !== "iniziale" && type !== "finale")) {
        navigate("/panas-introduzione");
    }

    const currentQuestionIndex = parseInt(questionNumber, 10) - 1;
    const sliderMarks = [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
        { value: 5, label: '5' },
    ];

    const [value, setValue] = useState(null);
    const [answer, setAnswer] = useState(() => {
        const savedAnswers = {};
        for (let i = 1; i <= panas.pages.length; i++) {
            const stored = safeStorage.getItem(`panas-${type}-${i}`);
            if (stored !== null) {
                savedAnswers[`panas-${type}-${i}`] = parseInt(stored, 10);
            }
        }
        return savedAnswers;
    });
    const handleNext = async () => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < panas.pages.length) {
            navigate(`/panas/${type}/${nextIndex + 1}`);
        } else {
            const allAnswers = {};
            for (let i = 1; i <= panas.pages.length; i++) {
                const key = `panas-${type}-${i}`;
                const val = safeStorage.getItem(key);
                if (val !== null) {
                    allAnswers[key] = parseInt(val, 10);
                }
            }

            if (type === "iniziale") {
                const dataPanasIniziale = {
                    type: "iniziale",
                    answers: allAnswers,
                };
                safeStorage.setItem("dataPanas-iniziale", JSON.stringify(dataPanasIniziale));
                navigate("/hexaco-introduzione");
            } else if (type === "finale") {
                setIsSubmitting(true);
            }

            if (type === "finale") {

                const dataPanasFinale = {
                    type: "finale",
                    answers: allAnswers,
                    userID: safeStorage.getItem("userID"),
                    date: new Date().toLocaleDateString("it-IT")
                };

                safeStorage.setItem("dataPanas-finale", JSON.stringify(dataPanasFinale));
                safeStorage.setItem("panasFinaleCompletato", "true");

                try {
                    setSubmitError(null);
                    // Timeout di 25 secondi per dare tempo ad Apps Script
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 25000);
                    addDebugLog("Dati PANAS finale" + JSON.stringify(dataPanasFinale))

                    const response = await fetch(config.salvataggio_panas_finale, {
                        method: "POST",
                        headers: {
                            "Content-Type": "text/plain",
                        },
                        body: JSON.stringify(dataPanasFinale),
                        signal: controller.signal,
                        redirect: "follow" // Necessario per Safari con Apps Script
                    });

                    clearTimeout(timeoutId);
                    const body = await response.text();

                    // Se la richiesta ha avuto successo (200-299), consideriamo i dati salvati
                    if (response.ok && !(body['status'] && body['status'].toUpperCase() === "ERROR")) {
                        const responseBody = body;
                        addLog("Registrazione completata: " + responseBody);
                        navigate("/fine-esperimento");
                    }
                    else
                        throw new Error(body['message']);
                } catch (error) {
                    addLog("Errore invio PANAS finale:" + error.message, "error");
                    // Mostra errore con possibilità di riprovare
                    if (error.name === 'AbortError') {
                        setSubmitError("⏱️ Il server sta impiegando troppo tempo. Riprova o controlla se i dati sono stati salvati.");
                    } else {
                        setSubmitError("❌ Errore durante l'invio. Verifica la connessione e riprova.");
                    }
                    setIsSubmitting(false);
                }
            }
        }
    };

    useEffect(() => {
        const key = `panas-${type}-${currentQuestionIndex + 1}`;
        const savedValue = safeStorage.getItem(key);
        setHasTriedProceed(false);
        if (savedValue !== null) {
            setValue(parseInt(savedValue, 10));
        } else {
            setValue(null);
        }
    }, [questionNumber]);

    //funzione per tornare alla pagina precedente
    const handleBack = () => {
        if (currentQuestionIndex === 0) {
            navigate("/panas-introduzione");
        } else {
            navigate(`/panas/${type}/${currentQuestionIndex}`);
        }
    };

    //salvare il valore dello slider selezionato
    const applySliderValue = (newValue) => {
        setValue(newValue);
        setHasTriedProceed(false);
        const key = `panas-${type}-${currentQuestionIndex + 1}`;
        safeStorage.setItem(key, newValue);
        setAnswer(prev => ({
            ...prev,
            [key]: newValue,
        }));
    };

    const handleSliderChange = (event, newValue) => {
        //crea un nuovo oggetto con tutte le proprietà di prev e aggiorna la proprietà chiave con il nuovo valore
        applySliderValue(newValue);
    };

    const handleProceedAttempt = () => {
        if (value === null) {
            setHasTriedProceed(true);
        }
    };

    const handleSliderKeyDown = (event) => {
        const numericValue = Number(event.key);
        if (Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 5) {
            event.preventDefault();
            applySliderValue(numericValue);
        }
    };

    useEffect(() => {
        const handlePageKeyDown = (event) => {
            const tagName = document.activeElement?.tagName;
            const isTypingContext =
                tagName === "INPUT" ||
                tagName === "TEXTAREA" ||
                document.activeElement?.isContentEditable;

            if (isTypingContext) return;

            if (event.code === "Enter" || event.code === "NumpadEnter") {
                event.preventDefault();
                if (value === null || isSubmitting) {
                    setHasTriedProceed(true);
                } else {
                    handleNext();
                }
                return;
            }

            const code = event.code;
            const map = {
                Digit1: 1,
                Digit2: 2,
                Digit3: 3,
                Digit4: 4,
                Digit5: 5,
                Numpad1: 1,
                Numpad2: 2,
                Numpad3: 3,
                Numpad4: 4,
                Numpad5: 5,
            };

            const numericValue = map[code];
            if (numericValue) {
                event.preventDefault();
                applySliderValue(numericValue);
            }
        };

        window.addEventListener("keydown", handlePageKeyDown);
        return () => window.removeEventListener("keydown", handlePageKeyDown);
    }, [type, currentQuestionIndex, value, isSubmitting]);

    return (
        <div className="content-box">
            <div className="arrow-left arrow-left-content-aligned">
                <Button variant="outlined" onClick={handleBack}>  <WestSharpIcon /></Button>
            </div>
            <div className="contenitore-testo questionario-lungo">
                <i className="blue-text">Situazione generale del tuo umore</i>
                <h2 className="less-lineheight">Quanto questo aggettivo descrive ciò che hai provato nelle ultime settimane?</h2>
            </div>

            <h3 className="blue-text header-questionari">{panas.pages[currentQuestionIndex].question}</h3>
            <Box className="slider">
                <Slider
                    value={value !== null ? value : 3}
                    onChange={handleSliderChange}
                    onKeyDown={handleSliderKeyDown}
                    onClick={() => {
                        if (value === null) {
                            handleSliderChange(null, 3); // forza la selezione iniziale di 3
                        }
                    }}
                    shiftStep={1}
                    step={1}
                    marks={sliderMarks}
                    min={1}
                    max={5}
                    sx={{
                        '& .MuiSlider-thumb': {
                            backgroundColor: value === null ? '#bdbdbd' : '#1976d2',
                            border: `2px solid ${value === null ? '#bdbdbd' : '#1976d2'}`,
                        },
                        '& .MuiSlider-track': {
                            backgroundColor: value === null ? 'transparent' : '#1976d2',
                            display: value === null ? 'none' : 'block', // nasconde la traccia se inattivo
                        },
                        '& .MuiSlider-rail': {
                            backgroundColor: '#bdbdbd', // rail sempre visibile in grigio
                        },
                        
                        '& .MuiSlider-mark': {
                            backgroundColor: value === null ? '#1976d2' : undefined, // blu se inattivo, default se attivo
                        },
                        '& .MuiSlider-markLabel': {
                            color: '#8ab4f8',
                            fontWeight: 600,
                        },
                    }}
                />
            </Box>

            <div className="contenitore-testo questionario-lungo">
                <br></br>
                <p>Usa la seguente scala:</p>
                <ol className="custom-list">
                    <li>Per nulla</li>
                    <li>Poco</li>
                    <li>Moderatamente</li>
                    <li>Abbastanza</li>
                    <li>Molto</li>
                </ol>
            </div>
            <br></br>
            
            <div className="numero-domanda">
                <span>Aggettivo </span>
                <span className="active-question-number">{currentQuestionIndex + 1}</span>
                <span className="total-question"> su {panas.pages.length}</span>
            </div>
            {hasTriedProceed && value === null && (
                <div className="red bg-solid-color arrow-right-content-aligned">
                    <p className="warning-text">*Seleziona un valore dalla scala prima di procedere.</p>
                </div>
            )}
            <div className="arrow-right arrow-right-content-aligned" onMouseDown={handleProceedAttempt} onTouchStart={handleProceedAttempt}>
                <Button variant="contained" disabled={value === null || isSubmitting} onClick={handleNext}> <EastSharpIcon /></Button>
            </div>

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
                    severity="warning"
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
                            Stiamo salvando i tuoi dati, non chiudere l'applicazione.
                        </span>
                    </div>
                </Alert>
            </Snackbar>

            {/* Snackbar errore con bottone Riprova */}
            <Snackbar
                open={!!submitError}
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
                                onClick={async () => {
                                    setIsSubmitting(true);
                                    setSubmitError(null);
                                    const payload = JSON.parse(safeStorage.getItem('dataPanas-finale') || '{}');
                                    try {
                                        const controller = new AbortController();
                                        const t = setTimeout(() => controller.abort(), 25000);
                                        const res = await fetch(config.salvataggio_panas_finale, {
                                            method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload), signal: controller.signal, redirect: 'follow'
                                        });
                                        clearTimeout(t);
                                        if (res.ok) {
                                            addLog("✅ PANAS salvato (retry)");
                                            navigate('/fine-esperimento');
                                        } else {
                                            throw new Error(`Status ${res.status}`);
                                        }
                                    } catch (e) {
                                        console.error('Retry PANAS:', e);
                                        setSubmitError(e.name === 'AbortError' ? '⏱️ Il salvataggio sta impiegando più tempo del previsto. Riprova o controlla se i dati sono stati salvati (contattando i ricercatori del progetto).' : '❌ Errore di invio dei tuoi dati. Verifica connessione.');
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
        </div>
    )
}

export default PANAS