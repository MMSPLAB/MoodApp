import React, { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import { addLog } from "../logs";

function HEXACOIntro() {
    const navigate = useNavigate();
    const [canGoNext, setCanGoNext] = useState(false);
    const textContainerRef = useRef(null);
    addLog("HEXACO iniziato")

    useEffect(() => {
        // On wider screens, don't gate the button - content fits without scrolling
        if (window.innerWidth >= 800) {
            setCanGoNext(true);
            return;
        }

        const requiredScrollProgress = 0.006;
        const requiredViewportFraction = 0.006;

        const checkIfAtBottom = () => {
            const textContainer = textContainerRef.current;
            if (textContainer) {
                const maxScrollableDistance = textContainer.scrollHeight - textContainer.clientHeight;
                if (maxScrollableDistance > 1) {
                    const progress = textContainer.scrollTop / maxScrollableDistance;
                    const viewportBasedThreshold = textContainer.clientHeight * requiredViewportFraction;
                    const shouldUnlock =
                        progress >= requiredScrollProgress ||
                        textContainer.scrollTop >= viewportBasedThreshold;
                    setCanGoNext((prev) => prev || shouldUnlock);
                    return;
                }
            }

            const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const viewportHeight = window.innerHeight;
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );
            const maxScrollableDistance = documentHeight - viewportHeight;

            if (maxScrollableDistance > 1) {
                const progress = scrollTop / maxScrollableDistance;
                const viewportBasedThreshold = viewportHeight * requiredViewportFraction;
                const shouldUnlock =
                    progress >= requiredScrollProgress ||
                    scrollTop >= viewportBasedThreshold;
                setCanGoNext((prev) => prev || shouldUnlock);
                return;
            }

            // No scrollable area detected: allow proceeding to avoid deadlock.
            setCanGoNext((prev) => prev || true);
        };

        checkIfAtBottom();
        const rafId = window.requestAnimationFrame(checkIfAtBottom);
        const textContainer = textContainerRef.current;
        window.addEventListener("scroll", checkIfAtBottom, { passive: true });
        window.addEventListener("resize", checkIfAtBottom);
        textContainer?.addEventListener("scroll", checkIfAtBottom, { passive: true });

        return () => {
            window.cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", checkIfAtBottom);
            window.removeEventListener("resize", checkIfAtBottom);
            textContainer?.removeEventListener("scroll", checkIfAtBottom);
        };
    }, []);

    return (
        <div className="content-box">
            <div className="arrow-left arrow-left-content-aligned">
                <Button variant="outlined" onClick={() => navigate("/panas/iniziale/20")}><WestSharpIcon /></Button>
            </div>
            <div className="contenitore-testo" ref={textContainerRef}>
                <h1>Valuta le prossime affermazioni</h1>
                <p>Nei prossimi passaggi troverai alcune frasi. Per ciascuna di esse, indica il numero che descrive meglio quanto sei d&apos;accordo in questo momento.<br /><br />
                    Non esistono risposte giuste o sbagliate: ci interessa la tua esperienza personale.<br />
                    <br />Dovrai usare questa scala:</p>
                <ol className="custom-list">
                    <li>Completamente in disaccordo</li>
                    <li>Molto in disaccordo</li>
                    <li>Né d&apos;accordo né in disaccordo</li>
                    <li>Molto d'accordo</li>
                    <li>Completamente d'accordo</li>
                </ol>
                <p>La scala sarà visibile anche nelle schermate successive.</p>
            </div>
            <div className="arrow-right arrow-right-content-aligned">
                <Button variant="contained" onClick={() => navigate("/hexaco/1")} disabled={!canGoNext}> <EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default HEXACOIntro