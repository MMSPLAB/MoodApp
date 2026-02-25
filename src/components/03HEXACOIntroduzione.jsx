import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';

function HEXACOIntro() {
    const navigate = useNavigate();
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/panas/iniziale/20")}><WestSharpIcon/></Button>
            </div>
            <h1 className="header-questionari">Rispondi alle seguenti domande</h1>
            <p>Nei prossimi passaggi ti presenteremo diverse frasi. Per ciascuna delle affermazioni, riporta il numero che ritieni rappresenti meglio il tuo grado di accordo.<br /><br />
                Non esistono risposte giuste o sbagliate. Quello che ci interessa è la sua personale opinione ed esperienza.<br />
                <br />Dovrai usare la seguente scala:</p>
            <ol className="custom-list">
                <li>Completamente in disaccordo</li>
                <li>Molto in disaccordo</li>
                <li>Nè d'accordo nè in disaccordo</li>
                <li>Molto d'accordo</li>
                <li>Completamente d'accordo</li>
            </ol>
            <p>Non preoccuparti, la scala sarà presente anche nelle prossime schermate!</p>
            <div className="arrow-right">
                <Button variant="contained" onClick={() => navigate("/hexaco/1")}>{/* → */}<EastSharpIcon/></Button>
            </div>
        </div>
    )
}

export default HEXACOIntro