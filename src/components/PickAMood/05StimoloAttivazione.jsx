import React, { useState, useEffect } from "react"
import { Button } from "@mui/material"
import { useNavigate, useParams } from "react-router"
import EastSharpIcon from '@mui/icons-material/EastSharp';

function StimoloAttivazione() {
    const { stimulusOrder } = useParams();
    const navigate = useNavigate();

    const [imageUrl, setImageUrl] = useState(null);
    const [stimulusFile, setStimulusFile] = useState(null);
    const [errore, setErrore] = useState(null);
    const [arousal, setArousal] = useState("");
    const [valence, setValence] = useState("");
    const [valutazione, setValutazione] = useState("");
    const [startingTime, setStartingTime] = useState(null);
    const [endingTime, setEndingTime] = useState(null);
    const [key, setKey] = useState(null);
    const [intensity, setIntensity] = useState(null);
    const [valutazioni, setValutazioni] = useState(() => {
        const saved = localStorage.getItem("valutazioni");
        return saved ? JSON.parse(saved) : [];
    });
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        const storageKey = localStorage.getItem("storageKey");
        if (storageKey) {
            setKey(storageKey);
            const savedValue = localStorage.getItem(storageKey);
            if (savedValue !== null) {
                setIntensity(Number(savedValue));
            }
        }
    }, []);

    //recuperare dal locale attivazione e valenza salvati
    useEffect(() => {
        const savedArousal = localStorage.getItem(`arousal${stimulusOrder}`);
        if (savedArousal) {
            setArousal(savedArousal);
        };

        const savedValence = localStorage.getItem(`valence${stimulusOrder}`);
        if (savedValence) {
            setValence(savedValence);
        };

        const savedStartingTime = localStorage.getItem(`startingTime${stimulusOrder}`);
        if (savedStartingTime) {
            setStartingTime(savedStartingTime);
        }

        const savedUrl = localStorage.getItem(`stimulusURL${stimulusOrder}`);
        const savedFile = localStorage.getItem(`stimulusFile${stimulusOrder}`);
        if (savedUrl) setImageUrl(savedUrl);
        if (savedFile) setStimulusFile(savedFile);

    }, [stimulusOrder]);

    useEffect(() => {
        if (imageUrl) {
            setValutazione(false);
            const timer = setTimeout(() => {
                setValutazione(true);
            }, 1000);
        }
    }, [imageUrl]);

    //salvataggio temporaneo nello useState 
    const onArousalSelection = (selected) => {
        const arousal = selected.currentTarget.value;
        setArousal(arousal);
        console.log(arousal);
    }

    //salvare in locale
    useEffect(() => {
        localStorage.setItem(`arousal${stimulusOrder}`, arousal);
    }, [arousal, stimulusOrder]);

    const handleNext = async () => {
        const now = new Date();
        const endingTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(`endingTime${stimulusOrder}`, endingTime);
        console.log("Evaluation è finito alle:", endingTime);

        const nuovaValutazione = {
            stimulusOrder,
            stimulusFile,
            startingTime,
            endingTime,
            valence,
            arousal,
        };

        // Recupera le valutazioni aggiornate, incluso l’ultimo stimolo
        const valutazioniSalvate = localStorage.getItem("valutazioni");
        const valutazioniParse = valutazioniSalvate ? JSON.parse(valutazioniSalvate) : [];
        const valutazioniFinali = [...valutazioniParse, nuovaValutazione];
        localStorage.setItem("valutazioni", JSON.stringify(valutazioniFinali));

        const nextStimolo = Number(stimulusOrder) + 1;
        if (nextStimolo <= 10) {
            navigate(`/stimolo-valenza/${nextStimolo}`);
        } else {
            //mostra il messaggio solo per l'ultimo stimolo visualizzato
            setIsSubmitting(true);
            const dataToSave = {
                UserID: localStorage.getItem("userID"),
                Data: {
                    day: localStorage.getItem("dataQuestionariCompletati"),
                    time: localStorage.getItem("orarioInizioMood"),
                    session: localStorage.getItem("session"),
                    mood: localStorage.getItem("selectedMood"),
                    intensity: intensity,
                    datiStimoli: valutazioniFinali,
                }
            };

            try {
                await fetch("https://script.google.com/macros/s/AKfycbwbBm9tf8gs-4hjpp1CjphVQ1DxxMQblU4sExo_Uhb1APrZjmAwk9IDEXgriGqDK3gozQ/exec", {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain",
                    },
                    body: JSON.stringify(dataToSave),
                });
                console.log("Valutazioni inviate:", dataToSave);
                navigate("/fine-pick-a-mood");
            } catch (error) {
                console.error("Errore invio valutazioni:", error);
            }
        }
        setIsSubmitting(false);
    };


    return (
        <>
            {Number(stimulusOrder) === 10 && isSubmitting ? (
                <div>
                    <p>⏳ <strong>Stiamo inviando le tue risposte al questionario, non chiudere l'applicazione...</strong></p>
                </div>
            ) : (
                <div className="stimolo-valutazione">
                    <div className="stimolo-titolo-immagine">
                        <div className="stimolo-titolo">
                            <h3>Immagine {stimulusOrder}/10</h3>
                        </div>
                        <div className="image-container">
                            <img src={imageUrl} alt="Stimolo" style={{ maxWidth: "90%", maxHeight: "400px", margin: "20px 0" }} />
                        </div>
                    </div>
                    <div className="valutazione-blocco">
                        <div className="valutazione-titolo">
                            <h3 className="blue">L'immagine è</h3>
                        </div>
                        <div className="attivazione">
                            <h4 className="blue">Attivazione</h4>
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
                        <div className="arrow-right">
                            <Button variant="contained" disabled={!arousal} onClick={handleNext}>{/* → */}<EastSharpIcon /></Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default StimoloAttivazione
