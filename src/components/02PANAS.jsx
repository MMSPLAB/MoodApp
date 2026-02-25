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

    if (!type || (type !== "iniziale" && type !== "finale")) {
        navigate("/panas-introduzione");
    }

    const currentQuestionIndex = parseInt(questionNumber, 10) - 1;

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
                        navigate("/fine-seconda-parte-registrazione");
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
    const handleSliderChange = (event, newValue) => {
        setValue(newValue);
        const key = `panas-${type}-${currentQuestionIndex + 1}`;
        safeStorage.setItem(key, newValue);
        //crea un nuovo oggetto con tutte le proprietà di prev e aggiorna la proprietà chiave con il nuovo valore
        setAnswer(prev => ({
            ...prev, //copia tutte le coppie chiave-valore di prev
            [key]: newValue, //aggiunge una nuova coppia chiave-valore, le parentesi quadre permettono di usare il valore della chiave come nome della proprietà
        }));
    };

    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={handleBack}>  <WestSharpIcon /></Button>
            </div>
            <h3 className="header-questionari">Quanto questo aggettivo descrive ciò che hai provato nelle ultime settimane?</h3>
            <p>Usa la seguente scala:</p>
            <ol className="custom-list">
                <li>Per nulla</li>
                <li>Poco</li>
                <li>Moderatamente</li>
                <li>Abbastanza</li>
                <li>Molto</li>
            </ol>
            <h3 className="blue header-questionari">{panas.pages[currentQuestionIndex].question}</h3>
            <Box className="slider">
                <Slider
                    value={value !== null ? value : 3}
                    onChange={handleSliderChange}
                    onClick={() => {
                        if (value === null) {
                            handleSliderChange(null, 3); // forza la selezione iniziale di 3
                        }
                    }}
                    valueLabelDisplay="on"
                    shiftStep={1}
                    step={1}
                    marks
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
                        '& .MuiSlider-valueLabel': {
                            backgroundColor: value === null ? '#bdbdbd' : '#1976d2',
                            color: '#fff',
                        },
                        '& .MuiSlider-mark': {
                            backgroundColor: value === null ? '#1976d2' : undefined, // blu se inattivo, default se attivo
                        },
                    }}
                />
            </Box>
            <div className="numero-domanda">
                <span className="active-question-number">{currentQuestionIndex + 1}</span>
                <span className="total-question"> su {panas.pages.length}</span>
            </div>
            <div className="red">
                <p>*completa tutti i campi prima di procedere.</p>
            </div>
            <div className="arrow-right">
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
                open={!!submitError}
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
        </div>
    )
}

export default PANAS