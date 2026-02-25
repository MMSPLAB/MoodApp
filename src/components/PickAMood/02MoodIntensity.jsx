import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import singoliMood from "../../assets/singoliMood.json";
import CircleRating from "./01CircleRating";
import CloseIcon from '@mui/icons-material/Close';
import EastSharpIcon from '@mui/icons-material/EastSharp';


function MoodIntensity() {
    const { avatar, moodId } = useParams();
    const mood = singoliMood[avatar]?.[moodId];
    const navigate = useNavigate();
    const [selectedRating, setSelectedRating] = useState("");

    if (!mood) {
        return <div>Umore non trovato</div>;
    }

    return (
        <div className="mood-intensity">
            <div className="close-icon">
                <Button variant="text" onClick={() => navigate("/pick-a-mood")} > <CloseIcon /> </Button>
            </div>
            <h3 className="maiuscolo">{mood.title}</h3>
            <div className="mood-intensity-img">
                <img src={`MoodApp${mood.image}`} alt={mood.alt} className="mood-image" />
                <div className="mood-intensity-h3">
                    <h3 className="blu-maiuscolo">Quanto reputi intenso l'umore selezionato?</h3>
                </div>
            </div>
            <h3 className="blu-maiuscolo">
                Quanto reputi intenso l'umore selezionato?
            </h3>
            <CircleRating storageKey={mood.alt} onChange={setSelectedRating} />
            <div className="arrow-right">
                <Button variant="contained" disabled={selectedRating === 0} onClick={() => navigate("/intro-stimoli")}>{/* → */}<EastSharpIcon /> </Button>
            </div>
        </div>
    );
}

export default MoodIntensity;
