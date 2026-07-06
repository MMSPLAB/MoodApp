import React, { useState, useEffect } from "react";
import { Button, TextField, Accordion, AccordionSummary, AccordionDetails} from '@mui/material';
import { Link, useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import config from "../../../environment";
import { addLog } from "../../logs";
import safeStorage from "../../../safeStorage";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


function UserIDEsistente() {

    const [userID, setUserID] = useState("");
    const [savedUserID, setSavedUserID] = useState("");
    const [validID, setValidID] = useState(false);
    const [hasStartedTyping, setHasStartedTyping] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Snackbar states, snackbar = pop up in basso 
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'info' | 'success' | 'error' | 'warning'

    const [userNameErrato, setUserNameErrato] = useState(false);

    const navigate = useNavigate();
    const handleMailClick = () => {
        window.location.href = "mailto:claudia.rabaioli@unimib.it";
    };
    const regex = new RegExp("^(P|B)([0-2][0-9]|3[0-1])(0[1-9]|1[0-2])[A-Z][A-Z][0-9][0-9]$");

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

    //recuperare dal safeStorage il nome utente
    useEffect(() => {
        const storedID = safeStorage.getItem("userID");
        if (storedID) {
            setUserID(storedID);
            setSavedUserID(storedID);
            setValidID(regex.test(storedID));
        }
    }, []);

    const validateInput = (inputValue) => {
        const input = inputValue.toUpperCase();

        if (!hasStartedTyping)
            setHasStartedTyping(true);

        setUserNameErrato(false);
        setUserID(input);
        setValidID(regex.test(input));
    };

    // gestione chiusura Snackbar
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    //cercare il nome utente in fogli google + recupero dataRegistrazione e avatar, altrimenti salvare in locale il nome utente
    const saveUserID = async (e) => {
        e.preventDefault();

        if (!validID) return;
        setIsSubmitting(true);

        // Apri snackbar di info con spinner
        setSnackbarMessage('Recupero dati in corso…');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);

        const baseURL = config.recupero_id;
        const url = `${baseURL}?UserID=${encodeURIComponent(userID)}`;
        console.log("Fetching:", url);

        // timeout: 30s
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const contentType = (response.headers.get('content-type') || '').toLowerCase();
            let data;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch (err) {
                    console.warn('Response non JSON:', text);
                    throw new Error('Risposta non JSON dal server');
                }
            }

            if (data && data.profiled) {
                safeStorage.setItem("userID", userID);
                if (data.date)
                    safeStorage.setItem("dataRegistrazione", data.date);
                if (data.avatar)
                    safeStorage.setItem("selectedAvatar", data.avatar);
                if (data.numeroQuestionari)
                    safeStorage.setItem("questionariCompletatiTotali",
                        data.numeroQuestionari || "0");
                if (data.ultimoQuestionario)
                    safeStorage.setItem("dataQuestionariCompletati",
                        (new Date(data.ultimoQuestionario) || new Date())
                            .toLocaleDateString('it-IT').slice(0, 10));
                if (data.fasce) {
                    safeStorage.setItem("fasceCompletate", data.fasce || "[false, false, false]")
                    var count = (data.fasce.match(/true/g) || []).length;
                    safeStorage.setItem("completati", count.toString())
                }
                if (data.panas && data.panas == "Completato")
                    safeStorage.setItem("panasFinaleCompletato", "true");

                safeStorage.setItem('hasVisited', 'true');

                // snackbar success breve, poi navigate
                setSnackbarMessage('Dati trovati. Reindirizzamento…');
                setSnackbarSeverity('success');
                addLog(`L'utente ${userID} ha effettuato l'accesso`)

                // lascia vedere lo snackbar un attimo, poi naviga
                setTimeout(() => {
                    setSnackbarOpen(false);
                    navigate("/");
                }, 900);
            } else {
                setUserNameErrato(true);
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                addLog("Timeout, server non disponibile", "error")
                setSnackbarMessage('Timeout: impossibile contattare il server. Riprova.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            } else {
                addLog("Errore di rete o risposta non valida", "error")
                setSnackbarMessage('Errore di rete o risposta non valida. Controlla la connessione.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        } finally {
            clearTimeout(timeoutId);
            setIsSubmitting(false);
        }
    };

    const registrazione = () => {
        safeStorage.setItem("userID", userID);
        console.log("Nuovo utente, avvio profilazione.");

        setSnackbarMessage('ID salvato. Procedo alla profilazione...');
        setSnackbarSeverity('success');

        setTimeout(() => {
            setSnackbarOpen(false);
            navigate("/introduzione-esperimento");
        }, 900);
    }

    return (
        <div className="user-id content-box">
            <div className="arrow-left arrow-left-content-aligned">
                <Button variant="outlined" onClick={() => navigate("/user-ID")}>   <WestSharpIcon /> </Button>
            </div>
            <h1>È bello rivederti su <span>MoodApp</span></h1>
            <p>Per continuare l'esperimento, accedi all'applicazione inserendo il tuo ID univoco.</p>
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
                    onChange={(e) => validateInput(e.target.value)}
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

            <div className="user-id-red">
                {userNameErrato ?
                    <p style={{ justifyContent: "left" }}>ID non trovato, riprova o <Link onClick={registrazione}>procedi con la registrazione</Link></p>
                    : null}
            </div>

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
            {/* Snackbar recupero dati */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                sx={{
                    width: "100%",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: "none",
                }}
            >
                <Alert
                    icon={false}
                    severity={snackbarSeverity}
                    onClose={handleCloseSnackbar}
                    sx={{
                        width: "100%",
                        textAlign: "center",
                        p: "16px",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& .MuiAlert-message': {
                            width: '100%',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                        },
                    }}
                >
                    {isSubmitting && <CircularProgress size={24} />}
                    <span>{snackbarMessage}</span>
                </Alert>
            </Snackbar>
        </div>
    )
}

export default UserIDEsistente;