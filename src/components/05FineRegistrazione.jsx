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
        <div className="content-box">
            <div className="arrow-left arrow-left-content-aligned">
                <Button variant="outlined" onClick={() => navigate("/hexaco/60")}>    <WestSharpIcon /></Button>
            </div>
            <div className="contenitore-testo">
                <h1>Hai completato la registrazione.</h1>
                <p>
                    Tra una settimana inizieranno i questionari giornalieri. <br /><br />
                    Riceverai una notifica per ogni nuovo questionario secondo l'orario da te scelto.<br /><br />
                    <i>Le notifiche arriveranno tramite l'applicazione Fitrockr Sync, ma la compilazione avverrà qui, all'interno di MoodApp. Ti avvertiremo il giorno prima dell'inizio della settimana dei questionari giornalieri.</i>
                </p>
            </div>
            <div className="arrow-right arrow-right-content-aligned">
                <Button variant="contained" onClick={handleComplete}> <EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default FineRegistrazione