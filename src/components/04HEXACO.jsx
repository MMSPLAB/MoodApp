import React, { useState, useEffect } from "react";
import { Button, Box, Slider } from "@mui/material";
import { useNavigate, useParams } from 'react-router';
import hexaco from "../assets/HEXACOQuestions.json";
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';

function HEXACO() {
    const { questionNumber } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);


    const currentQuestionIndex = parseInt(questionNumber, 10) - 1;

    const [value, setValue] = useState(null);
    const [answer, setAnswer] = useState(() => { //questo stato viene aggiornato ogni volta
        const savedAnswers = {};
        for (let i = 1; i <= hexaco.pages.length; i++) {
            const stored = localStorage.getItem(`hexaco${i}`);
            if (stored !== null) {
                savedAnswers[`hexaco${i}`] = parseInt(stored, 10)
            }
        }
        return savedAnswers;
    });

    useEffect(() => {
        localStorage.setItem("hexacoAnswers", JSON.stringify(answer));
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
        const savedValue = localStorage.getItem(key);
        if (savedValue !== null) {
            setValue(parseInt(savedValue, 10));
        } else {
            setValue(null);
        }
    }, [questionNumber]);

    const handleNext = async () => {
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex < hexaco.pages.length) {
            navigate(`/hexaco/${nextIndex + 1}`);
        } else {
            setIsSubmitting(true);

            // Recupera HEXACO
            const hexacoAnswers = JSON.parse(localStorage.getItem("hexacoAnswers") || "{}");
            const dataHexaco = {
                answers: hexacoAnswers,
            };

            // Recupera solo PANAS iniziale
            const panasIniziale = JSON.parse(localStorage.getItem("dataPanas-iniziale") || "{}");

            // Unione dei dati da inviare
            const combinedData = {
                userID: localStorage.getItem("userID"),
                setup: {
                    avatar: localStorage.getItem("selectedAvatar"),
                    date: localStorage.getItem("dataRegistrazione"),
                    gender: localStorage.getItem("Genere"),
                    age: localStorage.getItem("Età"),
                    education: localStorage.getItem("Istruzione"),
                    device: localStorage.getItem("Dispositivo"),
                },
                panas: panasIniziale,
                hexaco: dataHexaco.answers,
            };

            try {
                const response = await fetch("https://script.google.com/macros/s/AKfycbzW2-743GUW-FS0UEi58oBJJWwLzBkQ6J651pufU8Hd2BPvsRB9uhwKQzG3398iKSl56A/exec", {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain",
                    },
                    body: JSON.stringify(combinedData),
                });

                const responseBody = await response.text();

                if (!response.ok) {
                    console.error("Risposta server:", response.status, response.statusText, responseBody);
                    throw new Error("Errore invio dati");
                }

                console.log("Dati inviati correttamente:", combinedData);
                navigate("/fine-seconda-parte-registrazione");
            } catch (error) {
                console.error("Errore invio dati:", error);
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
        localStorage.setItem(key, newValue);
        setAnswer(prev => ({
            ...prev,
            [key]: newValue,
        }));
        console.log(`Domanda ${currentQuestionIndex + 1} → Valore selezionato: ${newValue}`)
    };

    return (
        <>
            {isSubmitting ? (
                <div>
                    <p>⏳ <strong>Stiamo inviando le tue risposte al questionario, non chiudere l&apos;applicazione...</strong></p>
                </div>
            ) : (
                <div>
                    <div className="arrow-left">
                        <Button variant="outlined" onClick={handleBack}>{/* ← */}<WestSharpIcon /></Button>
                    </div>
                    <h3 className="header-questionari">Quanto sei d'accordo con l'affermazione seguente?</h3>
                    <p>Usa la seguente scala:</p>
                    <ol className="custom-list">
                        <li>Completamente in disaccordo</li>
                        <li>Molto in disaccordo</li>
                        <li>Nè d'accordo nè in disaccordo</li>
                        <li>Molto d'accordo</li>
                        <li>Completamente d'accordo</li>
                    </ol>
                    <h4 className="blue header-questionari">{hexaco.pages[currentQuestionIndex].question}</h4>
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
                            }}
                        />
                    </Box>
                    <div className="numero-domanda">
                        <span className="active-question-number">{currentQuestionIndex + 1}</span>
                        <span className="total-question"> su {hexaco.pages.length}</span><br /><br />
                    </div>
                    <div className="arrow-right">
                        <Button variant="contained" disabled={value === null} onClick={handleNext}>{/* → */}<EastSharpIcon /></Button>
                    </div>
                </div>
            )}
        </>
    );
}

export default HEXACO