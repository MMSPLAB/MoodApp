import React, { useState } from "react";
import { Button } from "@mui/material";
import { useLocation, useNavigate } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import CloseIcon from '@mui/icons-material/Close';

function IntroduzioneEsperimento() {
    const navigate = useNavigate();
    const location = useLocation();

    //se si arriva dalla home, allora passiamo uno state
    const fromHome = location.state?.fromHome === true;

    return (
        <div>
            {!fromHome ? (
                <>
                    <div className="arrow-left">
                        <Button variant="outlined" onClick={() => navigate("/user-ID")}>
                            <WestSharpIcon />
                        </Button>
                    </div>
                </>
            ) : (
                <div className="close-icon">
                    <Button variant="text" onClick={() => navigate("/")}>
                        <CloseIcon />
                    </Button>
                </div>
            )}

            <div className="contenitore-testo">
                <h1>Introduzione</h1>
                <p>
                    Ti diamo il benvenuto nell'applicazione per il monitoraggio dell'<span className="blue-text">Umore (mood)</span>!<br /><br />
                    Questa applicazione è uno strumento fondamentale per supportare la ricerca scientifica sul monitoraggio e l’analisi degli stati affettivi.
                    Attraverso il tuo contributo, aiuterai a raccogliere dati essenziali per comprendere meglio le dinamiche emotive e le interazioni tra mood, stimoli esterni e segnali fisiologici.<br /><br />
                    L’esperimento si articola in diverse fasi, a partire dalla tua profilazione iniziale, che include domande su caratteristiche personali e risposte a specifici questionari.<br /><br />
                    Successivamente, ti verranno proposti stimoli visivi ed esercizi giornalieri per monitorare il tuo stato d’animo in tempo reale, raccogliendo dati utili alla ricerca.<br /><br />
                    Grazie per aver aderito!
                </p>
            </div>

            {!fromHome && (
                <div className="arrow-right">
                    <Button variant="contained" onClick={() => navigate("/informativa-privacy")}>
                        <EastSharpIcon />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default IntroduzioneEsperimento