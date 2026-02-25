import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';

function IdDimenticato() {
    const navigate = useNavigate();

    const handleMailClick = () => {
        window.location.href = "mailto:claudia.rabaioli@unimib.it";
    };
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/user-ID")}>   <WestSharpIcon /> </Button>
            </div>
            <h1>Non ricordi il tuo ID univoco?</h1>
            <p>Il tuo ID univoco era l'unione di:</p>
            <ul>
                <li>Iniziale dell’università con cui stai facendo l’esperimento (P Politecnico, B Bicocca)</li>
                <li>La tua data di nascita, solo i numeri del giorno e del mese (GGMM)</li>
                <li>Le iniziali del primo nome e cognome di tua madre</li>
                <li>Le ultime due cifre dell’anno di nascita di tua madre (AA)</li>
            </ul>
            <p>
                Per esempio, se stai facendo l’esperimento con l’università Bicocca, il tuo compleanno è il 7 febbraio, tua madre si chiama Carla Rossi ed è nata nel 1971; il codice ID sarà B0702CR71.
                <br /><br />
                Se non riesci a ricordarlo, non preoccuparti! Siamo a tua disposizione.<br />
                <br />
                Mandaci una mail e saremo pronti ad aiutarti:
            </p>
            <Button variant="contained" className="bottone-userID-dimenticato" onClick={handleMailClick}>Contattaci</Button>
        </div>
    )
}

export default IdDimenticato