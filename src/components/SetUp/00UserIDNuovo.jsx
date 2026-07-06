import React, { useState, useEffect } from "react";
import { Button, TextField, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link, useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import { addLog } from "../../logs";
import safeStorage from "../../../safeStorage";

function UserIDNuovo() {
    const navigate = useNavigate();

    const [userID, setUserID] = useState("");
    const [validID, setValidID] = useState(false)
    const [hasStartedTyping, setHasStartedTyping] = useState(false)

    const partialIDRegexes = [
        /^(P|B)$/,
        /^(P|B)[0-3]$/,
        /^(P|B)([0-2][0-9]|3[0-1])$/,
        /^(P|B)([0-2][0-9]|3[0-1])[0-1]$/,
        /^(P|B)([0-2][0-9]|3[0-1])(0[1-9]|1[0-2])$/,
        /^(P|B)([0-2][0-9]|3[0-1])(0[1-9]|1[0-2])[A-Z]$/,
        /^(P|B)([0-2][0-9]|3[0-1])(0[1-9]|1[0-2])[A-Z]{2}$/,
        /^(P|B)([0-2][0-9]|3[0-1])(0[1-9]|1[0-2])[A-Z]{2}[0-9]$/,
        /^(P|B)([0-2][0-9]|3[0-1])(0[1-9]|1[0-2])[A-Z]{2}[0-9]{2}$/
    ];

    const isPotentiallyValidID = userID === "" || partialIDRegexes.some((pattern) => pattern.test(userID));
    const showIncompleteIDWarning = hasStartedTyping && userID !== "" && !validID && isPotentiallyValidID;
    const showInvalidIDError = hasStartedTyping && !validID && !isPotentiallyValidID;

    safeStorage.clear();

    //salvare in locale il nome utente
    const saveUserID = (e) => {
        e.preventDefault();
        safeStorage.setItem("userID", userID);
        addLog(`L'utente ${userID} ha iniziato la registrazione`)
        navigate("/introduzione-esperimento");
    };

    const handleMailClick = () => {
        window.location.href = "mailto:claudia.rabaioli@unimib.it";
    };

    const regex = new RegExp("^(P|B)([0-2][0-9]|3[0-1])(0[1-9]|1[0-2])[A-Z][A-Z][0-9][0-9]$")
    const validateInput = (e) => {
        const input = e.target.value.toUpperCase()

        if (!hasStartedTyping)
            setHasStartedTyping(true)

        if (regex.exec(input))
            setValidID(true)
        else
            setValidID(false)

        setUserID(input)
    }
    return (
        <div className="user-id content-box">
            <div className="arrow-left arrow-left-content-aligned">
                <Button variant="outlined" onClick={() => navigate("/user-ID")}>   <WestSharpIcon /> </Button>
            </div>
            <h1>Ti diamo il benvenuto su <span>MoodApp</span></h1>
            <p>Per iniziare, accedi all'applicazione inserendo l'ID univoco già usato nelle altre fasi di configurazione dell'esperimento.</p>
            <p>Se hai dubbi riguardo l'ID univoco, consulta le istruzioni qui sotto.</p>
            <br />
            
            <form onSubmit={saveUserID} >
                <TextField
                    id="IDinput"
                    fullWidth
                    required
                    variant="outlined"
                    name="userID"
                    placeholder="B0101AA00"
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
                    <Button fullWidth type="submit" variant="contained" disabled={!validID} size="large">Continua</Button>
                </div>
            </form>
            {showIncompleteIDWarning &&
                <div className="user-id-warning">
                    <h5>*Inserisci un ID completo</h5>
                </div>}

            {showInvalidIDError &&
                <div className="user-id-red">
                    <h5>*Inserisci un ID valido per continuare</h5>
                </div>}
            
            <br></br>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <b class="blue">Non mi ricordo come si compone l'ID univoco, come posso accedere?</b>
                </AccordionSummary>
                <AccordionDetails>
                    <p>L'ID serve per riconoscerti nello studio senza usare il tuo nome.</p>
                    <p>Formato: iniziale università + GGMM + iniziali madre + AA.</p>
                    <p>Il formato è sempre lo stesso, ma se non riesci a ricordarlo, ecco un esempio di come costruire il tuo ID univoco:</p>
                    <ul>
                        <li>Iniziale dell’università con cui stai facendo l’esperimento (P Politecnico, B Bicocca)</li>
                        <li>La tua data di nascita, solo i numeri del giorno e del mese (GGMM)</li>
                        <li>Le iniziali del primo nome e cognome di tua madre</li>
                        <li>Le ultime due cifre dell’anno di nascita di tua madre (AA)</li>
                    </ul>
                    <p>
                        Per esempio, se stai facendo l’esperimento con l’università Bicocca, il tuo compleanno è il 7 febbraio, tua madre si chiama Carla Rossi ed è nata nel 1971; il codice ID sarà B0702CR71.
                    </p>
                </AccordionDetails>
            </Accordion>
            <br></br>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <b class="blue">Il mio ID univoco non funziona, cosa posso fare?</b>
                </AccordionSummary>
                <AccordionDetails>
                    <p>Se non riesci a ricordarlo e la guida per ricreare l'ID non ti aiuta, non preoccuparti! Siamo a tua disposizione.<br />
                    <br />
                    Mandaci una mail e saremo pronti ad aiutarti:
                    </p>
                    <Button variant="contained" className="bottone-userID-dimenticato" onClick={handleMailClick} size="large">Contattaci</Button>
                    <br />
                </AccordionDetails>
            </Accordion>
            
            
        </div>
    )
}

export default UserIDNuovo;