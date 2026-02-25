import React, { useState, useEffect } from "react";
import { Button, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import config from "../../../environment";
import { addLog } from "../../logs";
import safeStorage from "../../../safeStorage";

function UserIDEsistente() {

    const [userID, setUserID] = useState("");
    const [savedUserID, setSavedUserID] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Snackbar states, snackbar = pop up in basso 
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'info' | 'success' | 'error' | 'warning'

    const [userNameErrato, setUserNameErrato] = useState(false);

    const navigate = useNavigate();

    //recuperare dal safeStorage il nome utente
    useEffect(() => {
        const storedID = safeStorage.getItem("userID");
        if (storedID) {
            setUserID(storedID);
            setSavedUserID(storedID);
        }
    }, []);

    // gestione chiusura Snackbar
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    //cercare il nome utente in fogli google + recupero dataRegistrazione e avatar, altrimenti salvare in locale il nome utente
    const saveUserID = async (e) => {
        e.preventDefault();

        if (!userID) return;
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
                +
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
        <div className="user-id">
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/user-ID")}>   <WestSharpIcon /> </Button>
            </div>
            <h1>Ciao.</h1>
            <p>Eccoti nell'applicazione pensata per l'esperimento di raccolta dati sul mood</p>
            <h5 className="blue">Inserisci il tuo ID univoco.</h5>
            <form onSubmit={saveUserID} >
                <TextField
                    required
                    variant="outlined"
                    name="userID"
                    placeholder="ID"
                    value={userID}
                    onChange={(e) => setUserID(e.target.value.toUpperCase())}
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
                    <Button fullWidth type="submit" variant="contained" disabled={!userID}>Continua</Button>
                </div>
            </form>

            <div className="user-id-red">
                {userNameErrato ?
                    <p style={{ justifyContent: "left" }}>ID non trovato, riprova o <Link onClick={registrazione}>procedi con la registrazione</Link></p>
                    : <p>*completa tutti i campi prima di procedere.</p>}
            </div>
            <div className="naviga-id-dimenticato">
                <Link to="/ID-dimenticato">Hai dimenticato il tuo ID univoco?</Link>
            </div>
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
                        p: "0 2px 38px 2px",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isSubmitting && <CircularProgress size={24} sx={{ mr: 2 }} />}
                    <span>{snackbarMessage}</span>
                </Alert>
            </Snackbar>
        </div>
    )
}

export default UserIDEsistente;