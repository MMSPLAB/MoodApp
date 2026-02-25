import React, { useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import safeStorage from "../../safeStorage";

function FineRegistrazione() {
    const navigate = useNavigate();

    useEffect(() => {
        // Pulizia payload dopo invio riuscito (siamo nella pagina "Fine" quindi HEXACO+PANAS salvati con successo)
        const userID = safeStorage.getItem("userID");
        const dataRegistrazione = safeStorage.getItem("dataRegistrazione");
        const selectedAvatar = safeStorage.getItem("selectedAvatar");
        safeStorage.clear();

        safeStorage.setItem("userID", userID);
        safeStorage.setItem("dataRegistrazione", dataRegistrazione);
        safeStorage.setItem("selectedAvatar", selectedAvatar);
    })

    const handleComplete = () => {
        safeStorage.setItem('hasVisited', 'true');
        navigate("/");
    }

    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/hexaco/60")}>    <WestSharpIcon /></Button>
            </div>
            <div className="contenitore-testo">
                <h1 className="header-questionari">Hai completato la registrazione.</h1>
                <p>
                    Grazie mille! <br /><br />
                    Tra una settimana inizierà il periodo di compilazione giornaliero.
                </p>
            </div>
            <div className="arrow-right">
                <Button variant="contained" onClick={handleComplete}> <EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default FineRegistrazione