import React, { useState, useEffect } from "react";
import { Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { resetQuestionario } from "../../ResetQuestionario";

function UserID() {

    const navigate = useNavigate();
    resetQuestionario(true);

    return (
        <div className="user-id">
            <h1>Ciao.</h1>
            <p>Eccoti nell'applicazione pensata per l'esperimento di raccolta dati sul mood.</p>
            <p>Se ti sei registrato ma hai perso i dati, clicca su "Utente già registrato".</p>
            <p>Se sei un nuovo utente procedi cliccando su "Nuovo utente".</p>
            <div className="scelta-ID">
                <Button variant="contained" onClick={() => navigate("/user-ID-nuovo")}>Nuovo Utente</Button>
                <Button variant="outlined" onClick={() => navigate("/user-ID-esistente")}>Utente già registrato</Button>
            </div>
        </div>
    )
}

export default UserID;