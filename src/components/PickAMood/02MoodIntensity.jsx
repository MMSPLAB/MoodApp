import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import singoliMood from "../../assets/singoliMood.json";
import CircleRating from "./01CircleRating";
import CloseIcon from '@mui/icons-material/Close';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import useQuestionarioTimer from "../../TimerQuestionario";
import { addLog } from "../../logs";
import safeStorage from "../../../safeStorage";

function MoodIntensity() {
    const { avatar, moodId } = useParams();
    const mood = singoliMood[avatar]?.[moodId];
    const navigate = useNavigate();
    const [selectedRating, setSelectedRating] = useState("");

    useQuestionarioTimer();

    function deleteMood() {
        safeStorage.removeItem("selectedMood");
        const storageKey = safeStorage.getItem("storageKey");
        if (storageKey) {
            safeStorage.removeItem(storageKey);
        }
        safeStorage.removeItem("storageKey");

        navigate("/pick-a-mood")
    }

    if (!mood) {
        addLog("Mood selezionato non valido in MoodIntensity", "error")
        deleteMood()
    }

    function deleteMood() {
        safeStorage.removeItem("selectedMood");
        const storageKey = safeStorage.getItem("storageKey");
        if (storageKey) {
            safeStorage.removeItem(storageKey);
        }
        safeStorage.removeItem("storageKey");

        navigate("/pick-a-mood")
    }

    return (
        <div className="mood-intensity">
            <div className="close-icon">
                <Button variant="text" onClick={deleteMood} > <CloseIcon /> </Button>
            </div>
            <div className="mood-intensity-testo">
                <h3 className="maiuscolo">{mood.title}</h3>
            </div>
            <div className="mood-intensity-img">
                <img src={`MoodApp${mood.image}`} alt={mood.alt} className="mood-image" />
                <div className="mood-intensity-h3">
                    <h3 className="blu-maiuscolo">Quanto reputi intenso l'umore selezionato?</h3>
                </div>
            </div>
            <CircleRating storageKey={mood.alt} onChange={setSelectedRating} />
            <div className="red">
                <p>*completa tutti i campi prima di procedere.</p>
            </div>
            <div className="arrow-right">
                <Button variant="contained" disabled={selectedRating === 0} onClick={() => navigate("/esercizio-fisico")}> <EastSharpIcon /> </Button>
            </div>
        </div>
    );
}

export default MoodIntensity;
