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
            <Tooltip title="Come valutare?" >
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
                    Come valutare le immagini
                    <IconButton
                        aria-label="close"
                        onClick={() => setInfoOpen(false)}
                        sx={{ position: 'absolute', right: -4, top: -4 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <p>Nel guardare ogni immagine, valuta il loro contenuto e le sensazioni che esse suscitano.</p>
                    <b>Per me l'immagine è:</b>
                    <ul>
                        <li>
                            <b>spiacevole/negativa o piacevole/positiva</b>: <br />
                            utilizza gli elementi della scala di valenza <span className='blue'>valence</span>.
                        </li>
                        <li>
                            <b>rilassante/calmante o eccitante/emozionante</b>: <br />
                            utilizza gli elementi della scala di attivazione <span className='blue'>arousal</span>.
                        </li>
                    </ul>
                    <p>Puoi riaprire questa finestra in qualsiasi momento durante la valutazione.</p>
                </DialogContent>
            </Dialog >
        </div>)

}

export default IstruzioniStimoli;