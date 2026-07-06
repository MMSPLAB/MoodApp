import React, { useState, useEffect } from "react"

// Per finestra info scala valence arousal
import { Dialog, DialogTitle, DialogContent, IconButton, Tooltip } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';

function IstruzioniStimoli() {
    const [infoOpen, setInfoOpen] = useState(false); // Per finestra info scala valence arousal


    return (
        <div>
            {/* Pulsante info in alto a destra */}
            <Tooltip title="Come compilare?" >
                <IconButton
                    onClick={() => setInfoOpen(true)}
                    sx={{ position: "absolute", top: 24, right: 8, zIndex: 1300 }}
                    color="primary"
                >
                    <InfoOutlinedIcon />
                </IconButton>
            </Tooltip >

            {/* Finestra delle informazioni scrollabile */}
            < Dialog
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
                scroll="paper"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    <h3>Come valutare le immagini</h3>
                    <IconButton
                        aria-label="close"
                        onClick={() => setInfoOpen(false)}
                        sx={{ position: 'absolute', right: -4, top: -4 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <p>Osserva ogni immagine e valuta sia il contenuto sia le sensazioni che ti suscitano.</p>
                    <b>Per ciascuna immagine indica se è:</b>
                    <p>
                        <b>spiacevole/negativa o piacevole/positiva</b>: <br />
                        usa la scala di valenza / <span className='blue'>valence</span>.
                    </p>
                    <p>
                        <b>rilassante/calmante o eccitante/emozionante</b>: <br />
                        usa la scala di attivazione / <span className='blue'>arousal</span>.
                    </p>
                    <p>Puoi riaprire queste istruzioni in qualsiasi momento durante la valutazione.</p>
                </DialogContent>
            </Dialog >
        </div>)

}

export default IstruzioniStimoli;