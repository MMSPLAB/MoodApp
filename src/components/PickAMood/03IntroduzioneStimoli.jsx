import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import EastSharpIcon from '@mui/icons-material/EastSharp';
import WestSharpIcon from '@mui/icons-material/WestSharp';

function IntroduzionePickAMood() {
    const navigate = useNavigate();

    return (
        <div>
            <div className="arrow-left">
                <Button variant="text" onClick={() => navigate("/pick-a-mood")}> {/* ← */} <WestSharpIcon sx= {{ color: '#005DD3'}} /> </Button>
            </div>
            <div className="intro-stimoli">
                <h3 className="blu-maiuscolo">HAI COMPLETATO LA PRIMA PARTE DEL QUESTIONARIO</h3>
                <p className="testo">Adesso ti chiederemo di valutare&nbsp;<span className='blue'>dieci immagini</span>&nbsp;in base al loro contenuto e alle sensazioni che esse suscitano.</p>
                <p>Il tuo compito consiste nel guardare ogni immagine per indicare se per te l'immagine è: </p>
                <ul>
                    <li>
                        <b>spiacevole/negativa o piacevole/ negativa</b>
                        , secondo le seguenti opzioni della scala di valenza (<span className='blue'>valence</span>)
                        <ol>
                            <li>molto negativa</li>
                            <li>negativa</li>
                            <li>neutrale</li>
                            <li>positiva</li>
                            <li>molto positiva</li>
                        </ol>
                    </li>
                    <br/>
                    <li>
                        <b>rilassante/calmante o eccitante/ emozionante</b>
                        , secondo le seguenti opzioni della scala di attivazione (<span className='blue'>arousal</span>)
                        <ol>
                            <li>molto calmante</li>
                            <li>calmante</li>
                            <li>neutrale</li>
                            <li>attivante</li>
                            <li>molto attivante</li>
                        </ol>
                    </li>
                </ul>
                <p>Non ti preoccupare, potrai accedere a queste informazioni da ogni schermata di valutazione.</p>
            </div>
            <div className="arrow-right">
                <Button variant="contained" onClick={() => navigate("/stimolo-valenza/1")}>{/* → */} <EastSharpIcon /></Button>
            </div>
        </div>
    )
}

export default IntroduzionePickAMood;