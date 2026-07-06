import React, { useEffect, useRef, useState } from "react";
import { Button, FormControlLabel, Radio } from "@mui/material";
import { useNavigate, Link } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import safeStorage from "../../../safeStorage";

function InformativaPrivacy() {
    const navigate = useNavigate();
    const [privacyAccettata, setPrivacyAccettata] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [isConsentClearlyVisible, setIsConsentClearlyVisible] = useState(false);
    const [hasShownProceedWarning, setHasShownProceedWarning] = useState(false);
    const textContainerRef = useRef(null);
    const consentRef = useRef(null);

    const handleChange = (event) => {
        setPrivacyAccettata(event.target.checked);
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
                const thresholdPx = Math.max(120, Math.round(textContainer.clientHeight * 0.1));
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

    safeStorage.setItem("Informativa Privacy Accettata", privacyAccettata);
    const isContinueDisabled = !privacyAccettata;
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
                <Button variant="outlined" onClick={() => navigate("/user-ID")}>   <WestSharpIcon /> </Button>
            </div>
            <div className="contenitore-testo" ref={textContainerRef}>
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
                    Per domande relative ai presenti Termini e Condizioni, contattare  <Link variant="text" onClick={handleMailClick}>claudia.rabaioli@unimib.it</Link>.
                </p>
                <div className="blue-text" ref={consentRef}>
                    <FormControlLabel
                        value="privacy"
                        control={<Radio checked={privacyAccettata}
                            onChange={handleChange} />}
                        label="Ho letto e accetto l’informativa sulla privacy."
                        required
                    />
                </div>
            </div>
            {showProceedWarning && (
                <div className="red bg-solid-color arrow-right-content-aligned">
                    <p className="warning-text">*Per continuare, conferma di aver letto l’informativa.</p>
                </div>
            )}
            <div className="arrow-right arrow-right-content-aligned" onMouseDown={handleProceedAttempt} onTouchStart={handleProceedAttempt}>
                <Button variant="contained" disabled={isContinueDisabled} onClick={() => navigate("/termini-e-condizioni")}> <EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default InformativaPrivacy