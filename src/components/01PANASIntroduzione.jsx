import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import { addLog } from "../logs";

function PulsanteIndietro({finale}){
    const navigate = useNavigate();

    if(finale)
        return <Button variant="outlined" onClick={() => navigate("/")}> <WestSharpIcon /></Button>
    else 
        return <Button variant="outlined" onClick={() => navigate("/fine-prima-parte-registrazione")}> <WestSharpIcon /></Button>
}

function PANASIntro() {
    const navigate = useNavigate();
    const hasVisited = localStorage.getItem("hasVisited") === "true";
    const handleNextClick = () => {
        if (hasVisited) {
            navigate("/panas/finale/1");
            addLog("PANAS finale iniziato")
        } else {
            navigate("/panas/iniziale/1");
            addLog("PANAS iniziale iniziato")
        }
    };
    return (
        <div>
            <div className="arrow-left">
                <PulsanteIndietro  finale = {hasVisited}/>
            </div>
            <div className="contenitore-testo">
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
            </div>
            <div className="arrow-right">
                <Button variant="contained" onClick={handleNextClick}> <EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default PANASIntro