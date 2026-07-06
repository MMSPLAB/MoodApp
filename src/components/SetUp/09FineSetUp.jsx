import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';

function FineSetUp() {
    const navigate = useNavigate();
    localStorage.setItem("setupDate", new Date().toLocaleDateString('it-IT'));    

    return (
        <div className="content-box">
            <div className="arrow-left arrow-left-content-aligned">
                <Button variant="outlined" onClick={() => navigate("/scelta-avatar")}>   <WestSharpIcon /> </Button>
            </div>
            <div className="contenitore-testo">
                <h1 className="blue-text">Hai completato la prima parte della registrazione.</h1>
                <p>
                    Nei prossimi passaggi, ti presenteremo due questionari approfonditi per conoscerti meglio. Non ti preoccupare, non dovrai rifarli ogni giorno!<br /><br />
                    <b>Rispondi in modo spontaneo</b>: non ci sono risposte giuste o sbagliate. Quello che ci interessa è la tua personale opinione ed esperienza.
                </p>
            </div>
            <div className="arrow-right arrow-right-content-aligned">
                <Button variant="contained" onClick={() => navigate("/panas-introduzione")}> <EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default FineSetUp