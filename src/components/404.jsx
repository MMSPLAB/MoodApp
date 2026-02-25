import React, { useState } from "react";
import { Button } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import EastSharpIcon from '@mui/icons-material/EastSharp';
import singoliMood from '../assets/singoliMood.json'

function NotFound() {
    const mood = singoliMood["avatarRobot"]["n4"];
    const navigate = useNavigate();

    return (
        <div className="mood-intensity">
            <div>
                <h3 className="maiuscolo">Pagina non trovata</h3>
            </div>
            <div>
                <img src={mood.image} alt={mood.alt} className="mood-image" />
            </div>
            <p>Sembra che questa pagina non esista</p>
            <div className='bottone-home'>
                <Button variant='contained' onClick={() => { navigate("/") }}>
                    Torna alla home
                </Button>
            </div>
        </div>
    );
}

export default NotFound;