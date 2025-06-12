import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';

function IntroduzioneEsperimento() {
    const navigate = useNavigate();
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/user-ID")}> {/* ← */}<WestSharpIcon/> </Button>
            </div>
            <h1>Introduzione</h1>
            <p>
                Ti diamo il benvenuto nell'applicazione per il monitoraggio dell'<span className="blue-text">Umore (mood)</span>!<br /><br />
                Questa applicazione è uno strumento fondamentale per supportare la ricerca scientifica sul monitoraggio e l’analisi degli stati affettivi.
                Attraverso il tuo contributo, aiuterai a raccogliere dati essenziali per comprendere meglio le dinamiche emotive e le interazioni tra mood, stimoli esterni e segnali fisiologici.<br /><br />
                L’esperimento si articola in diverse fasi, a partire dalla tua profilazione iniziale, che include domande su caratteristiche personali e risposte a specifici questionari.<br /><br />
                Successivamente, ti verranno proposti stimoli visivi ed esercizi giornalieri per monitorare il tuo stato d’animo in tempo reale, raccogliendo dati utili alla ricerca.<br /><br />
                Grazie per aver aderito!
            </p>
            <div className="arrow-right">
                <Button variant="contained" onClick={() => navigate("/informativa-privacy")}>{/* → */}<EastSharpIcon/></Button>
            </div>
        </div>
    )
}

export default IntroduzioneEsperimento