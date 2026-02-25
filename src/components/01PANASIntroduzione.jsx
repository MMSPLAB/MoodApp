import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import { East } from "@mui/icons-material";

function PANASIntro() {
    const navigate = useNavigate();
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/fine-prima-parte-registrazione")}>{/* ← */}<WestSharpIcon /></Button>
            </div>
            <h1 className="header-questionari">Situazione generale del tuo umore</h1>
            <p>
                Nei prossimi passaggi ti saranno presentati diversi aggettivi che indicano diversi stati affettivi.<br /><br />
                Dovrai indicare con quale livello l'aggettivo rappresenta il tuo umore nell'ultimo periodo.&nbsp;
                <b>Quanto l'aggettivo descrive ciò che hai provato nelle ultime settimane?</b><br />
                <br />Dovrai usare la seguente scala:
            </p>
            <ol className="custom-list">
                <li>Per nulla</li>
                <li>Poco</li>
                <li>Moderatamente</li>
                <li>Abbastanza</li>
                <li>Molto</li>
            </ol>
            <p>Non preoccuparti, la scala sarà presente anche nelle prossime schermate!</p>
            <div className="arrow-right">
                <Button variant="contained" onClick={() => navigate("/panas/iniziale/1")}>{/* → */}<EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default PANASIntro