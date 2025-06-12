import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';

function FineSetUp() {
    const navigate = useNavigate();
    localStorage.setItem("setupDate", new Date().toLocaleDateString('it-IT'));
    
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/scelta-avatar")}> {/* ← */}<WestSharpIcon /> </Button>
            </div>
            <h1>Hai completato la prima parte della registrazione.</h1>
            <p>
                Nei prossimi passaggi, ti presenteremo due diversi questionari. Non ti preoccupare, non dovrai rifarli ogni giorno!<br /><br />
                Non esistono risposte giuste o sbagliate. Quello che ci interessa è la tua personale opinione ed esperienza.
            </p>
            <div className="arrow-right">
                <Button variant="contained" onClick={() => navigate("/panas-introduzione")}>{/* → */}<EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default FineSetUp