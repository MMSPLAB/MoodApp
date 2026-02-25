import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import singoliMood from "../../assets/singoliMood.json";
import WestSharpIcon from '@mui/icons-material/WestSharp';

function PickAMood() {
    const [savedAvatar, setSavedAvatar] = useState("");
    const [moods, setMoods] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const savedAvatar = localStorage.getItem("selectedAvatar");
        console.log("Avatar salvato:", savedAvatar);
        if (savedAvatar && singoliMood[savedAvatar]) {
            setSavedAvatar(savedAvatar);
            setMoods(singoliMood[savedAvatar]);
        } else {
            console.warn("Avatar non valido o non trovato.");
        }
    }, []);

    if (!savedAvatar) {
        return <div>Avatar non trovato. Assicurati di averlo selezionato prima.</div>;
    }

    const moodAngles = {
        n1: 247, // in alto a sx
        p1: 292, // in alto a dx
        n2: 112, // in basso a sinistra
        p2: 340, // in mezzo alto dx
        n3: 155, // in mezzo basso sx
        p3: 20,  // in mezzo basso dx
        n4: 202, // in mezzo alto sx
        p4: 67,  // in basso dx
    };

    /* const radius = 150; // raggio del cerchio */

    const radius = 110; // raggio più piccolo
    const centerX = 150;
    const centerY = 150;
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
                                    localStorage.setItem("selectedMood", mood.alt);
                                    navigate(`/mood/${savedAvatar}/${moodId}`);
                                }}
                                style={{
                                    position: "absolute",
                                    left: x,
                                    top: y,
                                    width: 100,
                                    height: 100,
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