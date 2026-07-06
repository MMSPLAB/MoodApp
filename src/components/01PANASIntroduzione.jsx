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
        <div className="content-box">
            <div className="arrow-left arrow-left-content-aligned">
                <PulsanteIndietro  finale = {hasVisited}/>
            </div>
            <div className="contenitore-testo">
                <h1>Situazione generale del tuo umore</h1>
                <p>
                    Nei prossimi passaggi troverai una serie di aggettivi che descrivono diversi stati affettivi.</p>
                <p>
                    Per ciascuno di essi, dovrai <b>indicare quanto l'aggettivo descrive il tuo umore nelle ultime settimane</b>, usando la seguente scala:
                </p>
                <ol className="custom-list">
                    <li>Per nulla</li>
                    <li>Poco</li>
                    <li>Moderatamente</li>
                    <li>Abbastanza</li>
                    <li>Molto</li>
                </ol>
                <p>Non preoccuparti: la scala resterà visibile anche nelle schermate successive.</p>
            </div>
            <div className="arrow-right arrow-right-content-aligned">
                <Button variant="contained" onClick={handleNextClick}> <EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default PANASIntro