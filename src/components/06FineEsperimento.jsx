import React, { useEffect } from "react";
import { Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { Capacitor } from '@capacitor/core';

function FineEsperimento() {
    const navigate = useNavigate();

    useEffect(() => {
        // Pulizia payload dopo invio riuscito (siamo nella pagina "Fine" quindi PANAS finale salvato con successo)
        localStorage.removeItem("dataPanas-finale");
    }, []);
    const openExternal = async (url) => {
            if (Capacitor.isNativePlatform()) {
                // Import dinamico solo su device nativi
                // Usa require per evitare che Vite faccia bundle
                const { Browser } = require("@capacitor/browser");
                await Browser.open({ url });
            } else {
                // Su web apre una nuova scheda
                window.open(url, "_blank", "noopener,noreferrer");
            }
        };

    return (
        <div>
            <div className="contenitore-testo">
                <h1 className="blue">Grazie per la tua partecipazione.</h1>
                <p>Sei giunto alla conclusione dell'esperimento di raccolta dati sul mood.<br/>
                Grazie per aver partecipato.</p>

                <p>Per aiutarci a migliorare ulteriormente il nostro esperimento,<br />
                    compila il <b>questionario di opinione generale</b>. Grazie!</p>
            </div>
            <div className='links'>
                <div className='external-link'>
                    <Button variant="contained" onClick={() => openExternal(config.form_finale)}>
                        Compila il questionario di opinione generale
                    </Button>
                </div>
            </div>
            <div className="button-fullwidth">
                <Button fullWidth variant="outlined" onClick={() => navigate("/")}>Torna alla home</Button>
            </div>
        </div>
    )
}

export default FineEsperimento