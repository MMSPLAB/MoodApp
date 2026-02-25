import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';

function IdDimenticato() {
    const navigate = useNavigate();
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/user-ID")}> {/* ← */}<WestSharpIcon /> </Button>
            </div>
            <h1>Hai dimenticato l'indirizzo mail?</h1>
            <p>
                In fase di configurazione ti è stato assegnato un ID univoco per proteggere il tuo anonimato.<br />
                Se non riesci a ricordarlo, non preoccuparti! Siamo a tua disposizione.<br />
                <br />
                Mandaci una mail e saremo pronti ad aiutarti
            </p>
            <Button variant="contained" className="bottone-userID-dimenticato">Scrivi una mail</Button>
        </div>
    )
}

export default IdDimenticato