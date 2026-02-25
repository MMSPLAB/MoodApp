import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';

function FineRegistrazione() {
    const navigate = useNavigate();
    const handleComplete = () => {
        localStorage.setItem('hasVisited', 'true');
        navigate("/");
    }

    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/hexaco/60")}> {/* ← */} <WestSharpIcon /></Button>
            </div>
            <h1 className="header-questionari">Hai completato la registrazione.</h1>
            <p>
                Grazie mille! <br /><br />
                Tra una settimana inizierà il periodo di compilazione giornaliero.
            </p>
            <div className="arrow-right">
                <Button variant="contained" onClick={handleComplete}>{/* → */}<EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default FineRegistrazione