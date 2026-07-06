import React, { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { useLocation, useNavigate } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import CloseIcon from '@mui/icons-material/Close';

function IntroduzioneEsperimento() {
    const navigate = useNavigate();
    const location = useLocation();
    const [canGoNext, setCanGoNext] = useState(false);
    const textContainerRef = useRef(null);

    //se si arriva dalla home, allora passiamo uno state
    const fromHome = location.state?.fromHome === true;

    useEffect(() => {
        if (fromHome) return;

        const bottomTolerancePx = 60;

        const checkIfAtBottom = () => {
            const textContainer = textContainerRef.current;
            const hasScrollableTextContainer =
                textContainer && textContainer.scrollHeight > textContainer.clientHeight + 1;

            if (hasScrollableTextContainer) {
                const remainingInsideContainer =
                    textContainer.scrollHeight - textContainer.clientHeight - textContainer.scrollTop;
                const reachedBottom = remainingInsideContainer <= bottomTolerancePx;
                setCanGoNext(prev => prev || reachedBottom);
                return;
            }

            const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const viewportHeight = window.innerHeight;
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );
            const remainingOnPage = documentHeight - (scrollTop + viewportHeight);

            const reachedBottom = remainingOnPage <= bottomTolerancePx;
            setCanGoNext(prev => prev || reachedBottom);
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
    }, [fromHome]);

    return (
        <div className="content-box">
            {!fromHome ? (
                <>
                    <div className="arrow-left arrow-left-content-aligned">
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

            <div className="contenitore-testo" ref={textContainerRef}>
                <h1>Introduzione</h1>
                <p>
                    Ti diamo il benvenuto nell'applicazione per il monitoraggio dell'<b className="blue-text">Umore (mood)</b>!<br /><br />
                    Questa applicazione è uno strumento fondamentale per supportare la ricerca scientifica sul monitoraggio e l’analisi degli stati affettivi.
                    Attraverso il tuo contributo, aiuterai a raccogliere dati essenziali per comprendere meglio le dinamiche emotive e le interazioni tra mood, stimoli esterni e segnali fisiologici.<br /><br />
                    L’esperimento si articola in diverse fasi, a partire dalla tua profilazione iniziale, che include domande su caratteristiche personali e risposte a specifici questionari.<br /><br />
                    Successivamente, ti verranno proposti stimoli visivi e compiti giornalieri per monitorare il tuo stato d’animo in tempo reale, raccogliendo dati utili alla ricerca.<br /><br />
                    Grazie per aver aderito!
                </p>
            </div>

            {!fromHome && (
                <div className="arrow-right arrow-right-content-aligned">
                    <Button variant="contained" onClick={() => navigate("/informativa-privacy")} disabled={!canGoNext}>
                        <EastSharpIcon />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default IntroduzioneEsperimento