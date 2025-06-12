import React, { useEffect, useState } from "react";
import { Button, Slider, Box } from "@mui/material";
import { useNavigate, useParams } from 'react-router';
import panas from "../assets/PANASQuestions.json";
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';

function PANAS() {
    const { questionNumber, type } = useParams();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!type || (type !== "iniziale" && type !== "finale")) {
        return <div>❌ Tipo di PANAS non valido. Assicurati che l'URL sia corretto.</div>;
    }

    const currentQuestionIndex = parseInt(questionNumber, 10) - 1;

    const [value, setValue] = useState(null);
    const [answer, setAnswer] = useState(() => { //questo stato viene aggiornato ogni volta
        const savedAnswers = {};
        for (let i = 1; i <= panas.pages.length; i++) {
            const stored = localStorage.getItem(`panas-${type}-${i}`);
            if (stored !== null) {
                savedAnswers[`panas-${type}-${i}`] = parseInt(stored, 10)
            }
        }
        return savedAnswers;
    });

    useEffect(() => {
        localStorage.setItem(`panas-${type}-answers`, JSON.stringify(answer));
    }, [answer, type]);

    //se il nome della route non è corretto viene mostrato un messaggio di errore
    if (
        isNaN(currentQuestionIndex) ||
        currentQuestionIndex < 0 ||
        currentQuestionIndex >= panas.pages.length
    ) {
        return <div>Domanda non valida</div>;
    }

    useEffect(() => {
        const key = `panas-${type}-${currentQuestionIndex + 1}`;
        const savedValue = localStorage.getItem(key);
        if (savedValue !== null) {
            setValue(parseInt(savedValue, 10));
        } else {
            setValue(null);
        }
    }, [questionNumber, type]);

    //logica per passare alla pagina successiva e salvare coppie chiave-valore
    const handleNext = async () => {
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex < panas.pages.length) {
            navigate(`/panas/${type}/${nextIndex + 1}`);
        } else {
            const allAnswers = {};
            for (let i = 1; i <= panas.pages.length; i++) {
                const key = `panas-${type}-${i}`;
                const val = localStorage.getItem(key);
                if (val !== null) {
                    allAnswers[key] = parseInt(val, 10);
                }
            }

            if (type === "iniziale") {
                const dataPanasIniziale = {
                    type: "iniziale",
                    answers: allAnswers,
                };
                localStorage.setItem("dataPanas-iniziale", JSON.stringify(dataPanasIniziale));
                navigate("/fine-questionario");
            } else if (type === "finale") {
                setIsSubmitting(true);

            }

            if (type === "finale") {

                const dataPanasFinale = {
                    type: "finale",
                    answers: allAnswers,
                    userID: localStorage.getItem("userID"),
                    date: new Date().toLocaleDateString("it-IT")
                };

                localStorage.setItem("dataPanas-finale", JSON.stringify(dataPanasFinale));

                try {
                    const response = await fetch("https://script.google.com/macros/s/AKfycbyIP4suaMlpuktzTXz2kLNkjRN-lAKu9R6qpi66WUy7W4-jSHz9wI08uUPevvKgnNhzpw/exec", {
                        method: "POST",
                        headers: {
                            "Content-Type": "text/plain",
                        },
                        body: JSON.stringify(dataPanasFinale),
                    });

                    const result = await response.text();
                    console.log("Invio PANAS finale:", result);

                    /*   // Pulisce i dati salvati
                      for (let i = 1; i <= panas.pages.length; i++) {
                          localStorage.removeItem(`panas-${type}-${i}`);
                      }
                      localStorage.removeItem(`panas-${type}-answers`); */
                    navigate("/");
                } catch (error) {
                    console.error("Errore invio PANAS finale:", error);
                    alert("❌ Errore durante l'invio del questionario. Riprova.");
                }
            } else {
                // Solo salvataggio locale per type === "iniziale"
                navigate("/hexaco-introduzione");
            }
        }
    };

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
        localStorage.setItem(key, newValue);
        //crea un nuovo oggetto con tutte le proprietà di prev e aggiorna la proprietà chiave con il nuovo valore
        setAnswer(prev => ({
            ...prev, //copia tutte le coppie chiave-valore di prev
            [key]: newValue, //aggiunge una nuova coppia chiave-valore, le parentesi quadre permettono di usare il valore della chiave come nome della proprietà
        }));
        console.log(`Domanda ${currentQuestionIndex + 1} (${type}) → Valore selezionato: ${newValue}`)
    };

    if (isSubmitting) {
        return (
            <div>
                <p>⏳ <strong>Stiamo inviando le tue risposte al questionario, non chiudere l&apos;applicazione...</strong></p>
            </div>
        );
    }

    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={handleBack}>{/* ← */}<WestSharpIcon /></Button>
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
            <div className="arrow-right">
                <Button variant="contained" disabled={value === null} onClick={handleNext}>{/* → */}<EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default PANAS