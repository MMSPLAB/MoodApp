import React, { useState } from "react";
import { Button, FormControlLabel, Radio } from "@mui/material";
import { useNavigate } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';

function TerminiCondizioni() {
    const navigate = useNavigate();
    const [terminiCondizioniAccettata, setTerminiCondizioniAccettata] = useState(false);

    const handleChange = (event) => {
        setTerminiCondizioniAccettata(event.target.checked);
    };
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/informativa-privacy")}> {/* ← */}<WestSharpIcon /> </Button>
            </div>
            <h1>Termini e Condizioni</h1>
            <p>
                <b>1. Introduzione</b><br />
                La protezione dei dati personali è una priorità per noi. Questa Informativa descrive come raccogliamo, utilizziamo, conserviamo e proteggiamo i dati forniti dagli utenti dell’applicazione.<br /><br />
                <b>2. Dati Raccolti</b><br />
                Durante l’utilizzo dell’applicazione, possono essere raccolti i seguenti dati:
            </p>
            <ul>
                <li>Dati personali: età, genere, preferenze e risposte ai questionari.</li>
                <li>Dati comportamentali: interazioni con l’app, risposte agli stimoli emotivi e risultati delle valutazioni.</li>
                <li>Dati da dispositivi: parametri fisiologici (es. frequenza cardiaca) e dati ambientali (es. posizione GPS).</li>
            </ul>
            <p>
                <b>3. Finalità della Raccolta</b><br />
                I dati raccolti sono utilizzati per:
            </p>
            <ul>
                <li>Personalizzare l’esperienza dell’utente.</li>
                <li>Analizzare i modelli emotivi per migliorare le funzionalità dell’applicazione.</li>
                <li>Generare report anonimi per scopi di ricerca scientifica.</li>
            </ul>
            <p>
                <b>4. Base Giuridica per il Trattamento</b><br />
                I dati vengono raccolti e trattati solo previo consenso esplicito dell’utente, in conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR).<br /><br />
                <b>5. Conservazione dei Dati</b><br />
                I dati personali saranno conservati per il tempo necessario al raggiungimento delle finalità descritte, dopodiché saranno eliminati o anonimizzati.<br /><br />
                <b>6. Condivisione dei Dati</b><br />
                I dati personali non saranno condivisi con terze parti, salvo nei seguenti casi:
            </p>
            <ul>
                <li>Con partner di ricerca scientifica, ma solo in forma anonima.</li>
                <li>Quando richiesto dalla legge o da un ordine dell’autorità giudiziaria.</li>
            </ul>
            <p>
                <b>7. Sicurezza dei Dati</b><br />
                Adottiamo misure tecniche e organizzative per proteggere i dati da accessi non autorizzati, perdite accidentali o usi impropri.<br /><br />
                <b>8. Diritti dell’Utente</b><br />
                Gli utenti hanno il diritto di:
            </p>
            <ul>
                <li>Accedere ai propri dati e richiederne una copia.</li>
                <li>Rettificare o aggiornare i dati forniti.</li>
                <li>Richiedere la cancellazione dei dati personali.</li>
                <li>Ritirare il consenso al trattamento in qualsiasi momento.</li>
            </ul>
            <p>
                <b>9. Contatti</b><br />
                Per esercitare i propri diritti o per ulteriori informazioni sulla gestione dei dati, è possibile contattare: [Email di contatto].
            </p>
            <div>
                <FormControlLabel value="female" control={<Radio checked={terminiCondizioniAccettata} onChange={handleChange} />} label="Accetta i termini e condizioni" required />
            </div>
            <div className="arrow-right">
                <Button variant="contained" disabled={!terminiCondizioniAccettata} onClick={() => navigate("/generalità")}>{/* → */}<EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default TerminiCondizioni