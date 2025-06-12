import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router'

function AttivazioneNotifiche() {
    const navigate = useNavigate();
    return (
        <div>
            <Button variant="text" onClick={() => navigate("/termini-e-condizioni")}> ← </Button>
            <h1>Attivazione Notifiche</h1>
            <Button variant="contained" onClick={() => navigate("/selezione-orario-notifiche")}>→</Button>
        </div>
    )
}

export default AttivazioneNotifiche