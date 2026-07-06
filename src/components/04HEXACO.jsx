import React, { useState, useEffect } from "react";
import { Button, Box, Slider } from "@mui/material";
import { useNavigate, useParams } from 'react-router';
import hexaco from "../assets/HEXACOQuestions.json";
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import config from "../../environment";
import { addDebugLog, addLog } from "../logs";
import safeStorage from "../../safeStorage";

function HEXACO() {
    const { questionNumber } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [dataRegistrazione, setDataRegistrazione] = useState("");
    const [hasTriedProceed, setHasTriedProceed] = useState(false);

    const currentQuestionIndex = parseInt(questionNumber, 10) - 1;
    const sliderMarks = [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
        { value: 5, label: '5' },
    ];

    const [value, setValue] = useState(null);
    const [answer, setAnswer] = useState(() => { //questo stato viene aggiornato ogni volta
        const savedAnswers = {};
        for (let i = 1; i <= hexaco.pages.length; i++) {
            const stored = safeStorage.getItem(`hexaco${i}`);
            if (stored !== null) {
                savedAnswers[`hexaco${i}`] = parseInt(stored, 10)
            }
        }
        return savedAnswers;
    });

    useEffect(() => {
        safeStorage.setItem("hexacoAnswers", JSON.stringify(answer));
    }, [answer]);

    if (
        isNaN(currentQuestionIndex) ||
        currentQuestionIndex < 0 ||
        currentQuestionIndex >= hexaco.pages.length
    ) {
        return <div>Domanda non valida</div>;
    }

    useEffect(() => {
        const key = `hexaco${currentQuestionIndex + 1}`;
        const savedValue = safeStorage.getItem(key);
        setHasTriedProceed(false);
        if (savedValue !== null) {
            setValue(parseInt(savedValue, 10));
        } else {
            setValue(null);
        }
    }, [questionNumber]);

    useEffect(() => {
        const saveDataRegistrazione = safeStorage.getItem("dataRegistrazione");
        if (!saveDataRegistrazione) {
            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0);
            const year = oggi.getFullYear();
            const month = String(oggi.getMonth() + 1).padStart(2, '0');
            const day = String(oggi.getDate()).padStart(2, '0');
            const data = `${year}-${month}-${day}`;
            safeStorage.setItem("dataRegistrazione", data);
            setDataRegistrazione(data);
        } else {
            setDataRegistrazione(saveDataRegistrazione);
        }
    }, [])

    const handleNext = async () => {
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex < hexaco.pages.length) {
            navigate(`/hexaco/${nextIndex + 1}`);
        } else {
            setIsSubmitting(true);

            // Recupera HEXACO
            const hexacoAnswers = JSON.parse(safeStorage.getItem("hexacoAnswers") || "{}");
            const dataHexaco = {
                answers: hexacoAnswers,
            };

            // Recupera solo PANAS iniziale
            const panasIniziale = JSON.parse(safeStorage.getItem("dataPanas-iniziale") || "{}");

            // Unione dei dati da inviare
            const combinedData = {
                userID: safeStorage.getItem("userID"),
                setup: {
                    avatar: safeStorage.getItem("selectedAvatar"),
                    date: safeStorage.getItem("dataRegistrazione"),
                    gender: safeStorage.getItem("Genere"),
                    age: safeStorage.getItem("Età"),
                    education: safeStorage.getItem("Istruzione"),
                    os: safeStorage.getItem("os"),
                    device: safeStorage.getItem("Dispositivo"),
                },
                panas: panasIniziale,
                hexaco: dataHexaco.answers,
            };

            // Salva per retry
            safeStorage.setItem("dataHexaco-setup", JSON.stringify(combinedData));

            try {
                setSubmitError(null);
                addDebugLog("Body richiesta setup: " + JSON.stringify(combinedData))
                // Timeout di 25 secondi per dare tempo ad Apps Script
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 25000);

                const response = await fetch(config.salvataggio_setup, {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain",
                    },
                    body: JSON.stringify(combinedData),
                    signal: controller.signal,
                    redirect: "follow" // Necessario per Apps Script redirect
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
                if (error.name === 'AbortError') {
                    addLog("Timeout durante il setup", "error")
                    setSubmitError("⏱️ Il server sta impiegando troppo tempo. Riprova o controlla se i dati sono stati salvati.");
                } else {
                    addLog("Errore durante il salvataggio del setup:" + error.message, "error")
                    setSubmitError("❌ Errore durante l'invio. Verifica la connessione e riprova.");
                }
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex === 0) {
            navigate("/hexaco-introduzione");
        } else {
            navigate(`/hexaco/${currentQuestionIndex}`);
        }
    };

    const applySliderValue = (newValue) => {
        setValue(newValue);
        setHasTriedProceed(false);
        const key = `hexaco${currentQuestionIndex + 1}`;
        safeStorage.setItem(key, newValue);
        setAnswer(prev => ({
            ...prev,
            [key]: newValue,
        }));
    };

    const handleSliderChange = (event, newValue) => {
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

            const numericValue = map[event.code];
            if (numericValue) {
                event.preventDefault();
                applySliderValue(numericValue);
            }
        };

        window.addEventListener("keydown", handlePageKeyDown);
        return () => window.removeEventListener("keydown", handlePageKeyDown);
    }, [currentQuestionIndex, value, isSubmitting]);

    return (
        <>
            <div className="content-box hexaco-questionnaire">
                <div className="arrow-left arrow-left-content-aligned">
                    <Button variant="outlined" onClick={handleBack}>  <WestSharpIcon /></Button>
                </div>
                <div className="contenitore-testo questionario-lungo">
                    <h2 className="less-lineheight">Quanto sei d'accordo con l'affermazione seguente?</h2>
                </div>
                <div className="hexaco-container">
                    <h3 className="blue-text header-questionari less-lineheight">{hexaco.pages[currentQuestionIndex].question}</h3>
                    <Box className="slider hexaco-slider-fixed">
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
                                    backgroundColor: value === null ? '#1976d2' : undefined,
                                },
                                '& .MuiSlider-markLabel': {
                                    color: '#8ab4f8',
                                    fontWeight: 600,
                                },
                            }}
                        />
                    </Box>
                </div>
                <div className="hexaco-scale-fixed questionario-lungo">
                        <p>Usa la seguente scala:</p>
                        <ol className="custom-list">
                            <li>Completamente in disaccordo</li>
                            <li>Molto in disaccordo</li>
                            <li>Né d'accordo né in disaccordo</li>
                            <li>Molto d'accordo</li>
                            <li>Completamente d'accordo</li>
                        </ol>
                </div>
                
                
                <div className="numero-domanda">
                    <span>Affermazione </span>
                    <span className="active-question-number">{currentQuestionIndex + 1}</span>
                    <span className="total-question"> su {hexaco.pages.length}</span><br /><br />
                </div>
                {hasTriedProceed && value === null && (
                    <div className="red bg-solid-color arrow-right-content-aligned">
                        <p className="warning-text">*Seleziona un valore dalla scala prima di procedere.</p>
                    </div>
                )}
                <div className="arrow-right arrow-right-content-aligned" onMouseDown={handleProceedAttempt} onTouchStart={handleProceedAttempt}>
                    <Button variant="contained" disabled={value === null || isSubmitting} onClick={handleNext}> <EastSharpIcon /></Button>
                </div>
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
                                    const payload = JSON.parse(safeStorage.getItem('dataHexaco-setup') || '{}');
                                    try {
                                        const controller = new AbortController();
                                        const t = setTimeout(() => controller.abort(), 25000);
                                        const res = await fetch(config.salvataggio_setup, {
                                            method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload), signal: controller.signal, redirect: 'follow'
                                        });
                                        clearTimeout(t);
                                        if (res.ok) {
                                            console.log("✅ HEXACO salvato (retry)");
                                            navigate('/fine-seconda-parte-registrazione');
                                        } else {
                                            throw new Error(`Status ${res.message}`);
                                        }
                                    } catch (e) {
                                        console.error('Retry HEXACO:', e);
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
    );
}

export default HEXACO