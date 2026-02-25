import React, { useState, useEffect } from "react";
import { Button, TextField, Grid, Dialog, DialogTitle, DialogContent, IconButton, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import { addLog } from "../../logs";
import safeStorage from "../../../safeStorage";

function UserIDNuovo() {
    const navigate = useNavigate();

    const [userID, setUserID] = useState("");
    const [showInstructions, setShowInstructions] = useState(false);
    const [validID, setValidID] = useState(false)

    safeStorage.clear();

    //salvare in locale il nome utente
    const saveUserID = (e) => {
        e.preventDefault();
        safeStorage.setItem("userID", userID);
        addLog(`L'utente ${userID} ha iniziato la registrazione`)
        navigate("/introduzione-esperimento");
    };

    const regex = new RegExp("^(P|B)([0-2][0-9]|3[0-1])(0[1-9]|1[0-2])[A-Z][A-Z][0-9][0-9]$")
    const validateInput = (e) => {
        const input = e.target.value.toUpperCase()

        if (regex.exec(input))
            setValidID(true)
        else
            setValidID(false)

        setUserID(input)
    }
    return (
        <div className="user-id">
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/user-ID")}>   <WestSharpIcon /> </Button>
            </div>
            <h1>Ciao.</h1>
            <p>Eccoti nell'applicazione pensata per l'esperimento di raccolta dati sul mood</p>

            <Grid container spacing={2}>
                <Grid>
                    <h5 className="blue">Inserisci il tuo ID univoco.</h5>
                </Grid>
                <Grid>
                    <div>
                        {/* Pulsante info in alto a destra */}
                        <Tooltip title="Username" >
                            <IconButton
                                onClick={() => setShowInstructions(true)}
                                color="primary"
                            >
                                <InfoOutlinedIcon />
                            </IconButton>
                        </Tooltip >

                        {/* Finestra delle informazioni scrollabile */}
                        < Dialog
                            open={showInstructions}
                            onClose={() => setShowInstructions(false)}
                            scroll="paper"
                            fullWidth
                            maxWidth="sm"
                        >
                            <DialogTitle>
                                Come comporre l'ID
                                <IconButton
                                    aria-label="close"
                                    onClick={() => setShowInstructions(false)}
                                    sx={{ position: 'absolute', right: -4, top: -4 }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent dividers>
                                <p>Il tuo ID deve essere composto come segue:</p>
                                <ol>
                                    <li>Iniziale dell’università con cui stai facendo l’esperimento (P Politecnico, B Bicocca)</li>
                                    <li>La tua data di nascita, solo i numeri del giorno e del mese (GGMM)</li>
                                    <li>Le iniziali del primo nome e cognome di tua madre</li>
                                    <li>Le ultime due cifre dell’anno di nascita di tua madre (AA)</li>
                                </ol>
                            </DialogContent>
                        </Dialog >
                    </div>
                </Grid>
            </Grid>

            <form onSubmit={saveUserID} >
                <TextField
                    id="IDinput"
                    required
                    variant="outlined"
                    name="userID"
                    placeholder="ID"
                    value={userID}
                    onChange={(e) => validateInput(e)}
                    slotProps={{
                        input: {
                            style: {
                                textTransform: "uppercase",
                                WebkitUserSelect: "none", // disabilita selezione su iOS
                                userSelect: "none",       // disabilita selezione su browser moderni
                            },
                            onPaste: (e) => e.preventDefault(),  // blocca incolla
                            onCopy: (e) => e.preventDefault(),   // blocca copia
                            onCut: (e) => e.preventDefault(),    // blocca taglia
                            onContextMenu: (e) => e.preventDefault(), // blocca menu tap lungo
                        },
                    }}
                />
                <div className="bottone-userID">
                    <Button fullWidth type="submit" variant="contained" disabled={!validID}>Continua</Button>
                </div>
            </form>
            {!validID &&
                <div className="user-id-red">
                    <p>*inserisci un ID valido per procedere.</p>
                </div>}
            <div className="naviga-id-dimenticato">
                <Link to="/ID-dimenticato">Hai dimenticato il tuo ID univoco?</Link>
            </div>
        </div>
    )
}

export default UserIDNuovo;