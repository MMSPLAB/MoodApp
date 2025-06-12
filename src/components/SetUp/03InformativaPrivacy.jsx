import React, { useState } from "react";
import { Button, FormControlLabel, Radio } from "@mui/material";
import { useNavigate } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';

function InformativaPrivacy() {
    const navigate = useNavigate();
    const [privacyAccettata, setPrivacyAccettata] = useState(false);

    const handleChange = (event) => {
        setPrivacyAccettata(event.target.checked);
    };
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/user-ID")}> {/* ← */}<WestSharpIcon/> </Button>
            </div>
            <h1>Informativa sulla Privacy</h1>
            <p>
                <b>1. Accettazione dei Termini</b><br />
                L'utilizzo di questa applicazione implica l'accettazione completa dei presenti Termini e Condizioni. Qualora non si accettino integralmente tali termini, si invita a non installare o utilizzare l'applicazione. L'accesso e l'uso continuativo dell'applicazione costituiscono accettazione implicita dei Termini aggiornati.<br /><br />
                <b>2. Scopo dell'Applicazione</b><br />
                Questa applicazione è progettata per supportare il monitoraggio del mood, fornendo strumenti per la profilazione personale, l’analisi delle risposte emotive e l’interazione con contenuti personalizzati. Non è destinata a diagnosi mediche o trattamenti terapeutici e non sostituisce la consulenza di un professionista qualificato.<br /><br />
                <b>3. Uso Consentito</b><br />
                L’utente accetta di utilizzare l’applicazione esclusivamente per scopi personali e non commerciali. È vietato:
                Alterare, copiare, distribuire o vendere i contenuti o le funzionalità dell’applicazione.
                Utilizzare l’applicazione per attività illecite o dannose.
                Tentare di accedere senza autorizzazione a sistemi, dati o server associati all’applicazione.<br /><br />
                <b>4. Registrazione e Profilazione Utente</b><br />
                Per un utilizzo completo dell’applicazione, può essere richiesto di fornire informazioni personali come età, genere, e tratti della personalità. L’utente garantisce che tutte le informazioni fornite sono accurate e aggiornate.<br /><br />
                <b>5. Raccolta e Uso dei Dati</b><br />
                L’applicazione raccoglie dati relativi al mood tramite questionari, risposte agli stimoli e dati forniti da sensori esterni (ad esempio, smartwatch). L’uso di questi dati è dettagliato nell’Informativa sulla Privacy.<br /><br />
                <b>6. Limitazioni di Responsabilità</b><br />
                L’applicazione è fornita “così com’è”, senza garanzie esplicite o implicite. Non siamo responsabili di eventuali danni derivanti dall’utilizzo o dall’incapacità di utilizzare l’applicazione, inclusa la perdita di dati o informazioni personali.<br /><br />
                <b>7. Modifiche ai Termini</b><br />
                Ci riserviamo il diritto di modificare i presenti Termini in qualsiasi momento. Gli aggiornamenti saranno comunicati attraverso l’applicazione e saranno effettivi dalla data di pubblicazione.<br /><br />
                <b>8. Contatti</b><br />
                Per domande relative ai presenti Termini e Condizioni, contattare:
            </p>
            <div>
                <FormControlLabel value="female" control={<Radio checked={privacyAccettata} onChange={handleChange} />} label="Accetta i termini di Privacy" required />
            </div>
            <div className="arrow-right">
                <Button variant="contained" disabled={!privacyAccettata} onClick={() => navigate("/termini-e-condizioni")}>{/* → */}<EastSharpIcon/></Button>
            </div>
        </div>
    )
}

export default InformativaPrivacy