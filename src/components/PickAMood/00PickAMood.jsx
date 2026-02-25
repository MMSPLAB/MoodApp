import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import singoliMood from "../../assets/singoliMood.json";
import WestSharpIcon from '@mui/icons-material/WestSharp';
import useQuestionarioTimer from "../../TimerQuestionario";
import { addLog } from "../../logs"
import safeStorage from "../../../safeStorage";

function PickAMood() {
    const [savedAvatar, setSavedAvatar] = useState("");
    const [moods, setMoods] = useState({});
    const navigate = useNavigate();

    useQuestionarioTimer();

    const now = new Date();
    const orario = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    safeStorage.setItem('orarioInizioMood', orario);

    useEffect(() => {
        if (!safeStorage.getItem("userID")) {
            addLog("userID non trovato in PickAMood", "error");
            safeStorage.clear()
            navigate("/user-ID")
        }

        const savedAvatar = safeStorage.getItem("selectedAvatar");
        if (savedAvatar && singoliMood[savedAvatar]) {
            setSavedAvatar(savedAvatar);
            setMoods(singoliMood[savedAvatar]);
        } else {
            addLog("Avatar non valido in PickAMood", "error");
            safeStorage.clear()
            navigate("/user-ID")
        }
    }, []);

    if (!savedAvatar) {
        return <div>Avatar non trovato. Assicurati di averlo selezionato prima.</div>;
    }

    const moodAngles = {
        n1: 112, // in basso a sinistra
        p1: 292, // in alto a dx
        n2: 155, // in mezzo basso sx
        p2: 335, // in mezzo alto dx
        n3: 202, // in mezzo alto sx
        p3: 23,  // in mezzo basso dx
        n4: 247, // in alto a sx  
        p4: 67,  // in basso dx
    };

    /* const radius = 150; // raggio del cerchio */

    const radius = 110; // raggio più piccolo
    const centerX = 145;
    const centerY = 145;
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/")}>
                    <WestSharpIcon sx={{ color: '#005DD3' }} />
                </Button>
            </div>
            <div className="pick-a-mood">
                <h2 className="blu-maiuscolo titolo-mood">Come ti senti in questo momento?</h2>
                <div className="mood-circle-container">
                    {Object.entries(moods).map(([moodId, mood]) => {
                        const angle = moodAngles[moodId];

                        if (angle === undefined) return null; // ignora se moodId non in moodAngles

                        // calcolo coordinate
                        const angleRad = (angle * Math.PI) / 180;
                        const x = centerX + radius * Math.cos(angleRad) - 40;
                        const y = centerY + radius * Math.sin(angleRad) - 40;

                        return (
                            <Button
                                key={moodId}
                                variant="text"
                                className="mood-button"
                                onClick={() => {
                                    safeStorage.setItem("selectedMood", mood.alt);
                                    navigate(`/mood/${savedAvatar}/${moodId}`);
                                }}
                                style={{
                                    position: "absolute",
                                    left: x,
                                    top: y,
                                    width: 110,
                                    height: 110,
                                    padding: 0,
                                    borderRadius: "50%",
                                    transform: `rotate(-${angle}deg)`, // ruota immagine per mantenerla dritta
                                    transformOrigin: "center"
                                }}
                            >
                                <img
                                    src={`MoodApp${mood.image}`}
                                    alt={mood.alt}
                                    style={{
                                        width: "90%",
                                        height: "90%",
                                        objectFit: "contain",
                                        transform: `rotate(${angle}deg)`, // cancella la rotazione del bottone
                                    }}
                                />
                            </Button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

}

export default PickAMood;