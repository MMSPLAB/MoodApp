import React, { useState, useEffect } from "react";
import { Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { resetQuestionario } from "../../ResetQuestionario";

function UserID() {

    const navigate = useNavigate();
    resetQuestionario(true);

    return (
        <div className="user-id content-box">
            <h1>Ciao!</h1>
            <h2>Benvenuto in MoodApp.</h2>
            <p>Questa applicazione è stata progettata per monitorare il tuo umore nel tempo. </p>
            <p>Con la tua partecipazione, ci aiuterai a migliorare la comprensione dell'umore e delle sue variazioni nel tempo.</p>
            <div className="scelta-ID">
                <Button variant="contained" onClick={() => navigate("/user-ID-nuovo")}>Non ho mai usato MoodApp</Button>
                <Button variant="outlined" onClick={() => navigate("/user-ID-esistente")}>Ho già usato MoodApp</Button>
            </div>
            <br />
            <br />
            <div>
                <i style={{ opacity: 0.6 }}>
                    MoodApp è parte di un progetto di ricerca del <a href="https://mmsp.unimib.it/" target="_blank" rel="noopener noreferrer">laboratorio MMSP</a> dell'Università di Milano-Bicocca, 
                    in collaborazione con il laboratorio Haptics and Virtual Prototyping del Politecnico di Milano.</i>
            </div>
        </div>
    )
}

export default UserID;