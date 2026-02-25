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

    const currentQuestionIndex = parseInt(questionNumber, 10) - 1;

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
    })

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

    const handleSliderChange = (event, newValue) => {
        setValue(newValue);
        const key = `hexaco${currentQuestionIndex + 1}`;
        safeStorage.setItem(key, newValue);
        setAnswer(prev => ({
            ...prev,
            [key]: newValue,
        }));
    };

    return (
        <>
            <div>
                <div className="arrow-left">
                    <Button variant="outlined" onClick={handleBack}>  <WestSharpIcon /></Button>
                </div>
                <div className="contenitore-hexaco">
                    <h3 className="header-questionari">Quanto sei d'accordo con l'affermazione seguente?</h3>
                    <div className="lista-hexaco">
                        <p>Usa la seguente scala:</p>
                        <ol className="custom-list">
                            <li>Completamente in disaccordo</li>
                            <li>Molto in disaccordo</li>
                            <li>Nè d'accordo nè in disaccordo</li>
                            <li>Molto d'accordo</li>
                            <li>Completamente d'accordo</li>
                        </ol>
                    </div>
                </div>
                <div className="hexaco">
                    <h4 className="blue header-questionari">{hexaco.pages[currentQuestionIndex].question}</h4>
                </div>
                <Box className="slider-hexaco">
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
                        }}
                    />
                </Box>
                <div className="numero-domanda conteggio-hexaco">
                    <span className="active-question-number">{currentQuestionIndex + 1}</span>
                    <span className="total-question"> su {hexaco.pages.length}</span><br /><br />
                </div>
                <div className="red">
                    <p>*completa tutti i campi prima di procedere.</p>
                </div>
                <div className="arrow-right">
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