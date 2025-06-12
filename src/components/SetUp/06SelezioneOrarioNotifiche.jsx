import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router'

function SelezioneOrarioNotifiche() {
    const navigate = useNavigate();
    return (
        <div>
            <Button variant="text" onClick={() => navigate("/attivazione-notifiche")}> ← </Button>
            <h1>Selezione Orario Notifiche</h1>
            <Button variant="contained" onClick={() => navigate("/generalità")}>→</Button>
        </div>
    )
}

export default SelezioneOrarioNotifiche