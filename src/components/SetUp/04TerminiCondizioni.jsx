import React, { useEffect, useRef, useState } from "react";
import { Button, FormControlLabel, Radio } from "@mui/material";
import { useNavigate, Link } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import safeStorage from "../../../safeStorage";

function TerminiCondizioni() {
    const navigate = useNavigate();
    const [terminiCondizioniAccettati, setTerminiCondizioniAccettati] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [isConsentClearlyVisible, setIsConsentClearlyVisible] = useState(false);
    const [hasShownProceedWarning, setHasShownProceedWarning] = useState(false);
    const textContainerRef = useRef(null);
    const consentRef = useRef(null);

    const handleChange = (event) => {
        setTerminiCondizioniAccettati(event.target.checked);
    };

    const handleMailClick = () => {
        window.location.href = "mailto:claudia.rabaioli@unimib.it";
    };

    useEffect(() => {
        const checkIfAtBottom = () => {
            const textContainer = textContainerRef.current;
            const consentElement = consentRef.current;
            const hasScrollableTextContainer =
                textContainer && textContainer.scrollHeight > textContainer.clientHeight + 1;

            if (hasScrollableTextContainer) {
                const thresholdPx = Math.max(120, Math.round(textContainer.clientHeight * 0.4));
                const remainingInsideContainer =
                    textContainer.scrollHeight - textContainer.clientHeight - textContainer.scrollTop;
                setIsAtBottom(remainingInsideContainer <= thresholdPx);

                if (consentElement) {
                    const consentTop = consentElement.offsetTop;
                    const consentBottom = consentTop + consentElement.offsetHeight;
                    const viewportTop = textContainer.scrollTop;
                    const viewportBottom = viewportTop + textContainer.clientHeight;
                    const visiblePx = Math.max(0, Math.min(consentBottom, viewportBottom) - Math.max(consentTop, viewportTop));
                    const visibleRatio = consentElement.offsetHeight > 0 ? visiblePx / consentElement.offsetHeight : 0;
                    setIsConsentClearlyVisible(visibleRatio >= 0.8);
                }
                return;
            }

            const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const viewportHeight = window.innerHeight;
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );
            const remainingOnPage = documentHeight - (scrollTop + viewportHeight);
            const thresholdPx = Math.max(120, Math.round(viewportHeight * 0.2));
            setIsAtBottom(remainingOnPage <= thresholdPx);

            if (consentElement) {
                const rect = consentElement.getBoundingClientRect();
                const visiblePx = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
                const visibleRatio = rect.height > 0 ? visiblePx / rect.height : 0;
                setIsConsentClearlyVisible(visibleRatio >= 0.8);
            }
        };

        checkIfAtBottom();
        window.addEventListener("scroll", checkIfAtBottom, { passive: true });
        window.addEventListener("resize", checkIfAtBottom);
        textContainerRef.current?.addEventListener("scroll", checkIfAtBottom, { passive: true });

        return () => {
            window.removeEventListener("scroll", checkIfAtBottom);
            window.removeEventListener("resize", checkIfAtBottom);
            textContainerRef.current?.removeEventListener("scroll", checkIfAtBottom);
        };
    }, []);

    safeStorage.setItem("Termini e Condizioni Accettati", terminiCondizioniAccettati);
    const isContinueDisabled = !terminiCondizioniAccettati;
    useEffect(() => {
        if (isAtBottom && isConsentClearlyVisible && isContinueDisabled) {
            setHasShownProceedWarning(true);
        }
    }, [isAtBottom, isConsentClearlyVisible, isContinueDisabled]);

    const handleProceedAttempt = () => {
        if (isContinueDisabled) {
            setHasShownProceedWarning(true);
        }
    };

    const showProceedWarning = hasShownProceedWarning && isContinueDisabled;

    return (
        <div className="content-box">
            <div className="arrow-left arrow-left-content-aligned">
                <Button variant="outlined" onClick={() => navigate("/informativa-privacy")}>   <WestSharpIcon /> </Button>
            </div>
            <div className="contenitore-testo" ref={textContainerRef}>
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
                    Per esercitare i propri diritti o per ulteriori informazioni sulla gestione dei dati, è possibile contattare: <Link variant="text" onClick={handleMailClick}>claudia.rabaioli@unimib.it</Link>.
                </p>
                <div className="blue-text" ref={consentRef}>
                    <FormControlLabel
                        value="termini"
                        control={<Radio checked={terminiCondizioniAccettati} onChange={handleChange}/>}
                        label="Ho letto e accetto i termini e le condizioni."
                        required
                    />
                </div>
            </div>
            {showProceedWarning && (
                <div className="red bg-solid-color arrow-right-content-aligned">
                    <p className="warning-text">*Per continuare, conferma di aver letto i termini e le condizioni.</p>
                </div>
            )}
            <div className="arrow-right arrow-right-content-aligned" onMouseDown={handleProceedAttempt} onTouchStart={handleProceedAttempt}>
                <Button variant="contained" disabled={isContinueDisabled} onClick={() => navigate("/generalità")}> <EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default TerminiCondizioni