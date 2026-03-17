import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import { resetQuestionario } from "../../ResetQuestionario";
import safeStorage from "../../../safeStorage";

function FinePickAMood() {
    const navigate = useNavigate();

    useEffect(() => {

        resetQuestionario(true);
    }, []);

    return (
        <div>
            <div className="fine-questionario-testo">
                <h3 className="blu-maiuscolo">Hai completato il questionario!</h3>
                <p>Torna alla home per vedere quando sarà disponibile il prossimo questionario</p>
            </div>
            <div className="bottom-button">
                <Button variant="contained" className="button-fine-questionario" onClick={() => navigate("/")}>Torna alla home</Button>
            </div>
        </div>
    )
}

export default FinePickAMood;