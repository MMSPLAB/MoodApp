import React, { useState, useEffect } from "react";
import { Button, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router';

function UserID() {

    const [userID, setUserID] = useState("");
    const [savedUserID, setSavedUserID] = useState("");
    const [dataRegistrazione, setDataRegistrazione] = useState("");


    //recuperare dal localstorage il nome utente
    useEffect(() => {
        const storedID = localStorage.getItem("userID");
        if (storedID) {
            setUserID(storedID);
            setSavedUserID(storedID);
        }
        const saveDataRegistrazione = localStorage.getItem("dataRegistrazione");
        if (!saveDataRegistrazione) {
            const oggi = new Date();
            const data = oggi.toLocaleDateString('it-IT');
            localStorage.setItem("dataRegistrazione", data);
            setDataRegistrazione(data);
        } else {
            setDataRegistrazione(saveDataRegistrazione);
        }
    }, []);

    //salva nello stato il nome utente
    const handleIdChange = (event) => {
        const newID = event.currentTarget.value;
        setUserID(newID);
        console.log(newID);
    };

    //salvare in locale il nome utente
    const saveUserID = (e) => {
        e.preventDefault();
        localStorage.setItem("userID", userID);
        setSavedUserID(userID);
        console.log("UserID confermato e salvato:", userID);
        navigate("/introduzione-esperimento");
    };

    const navigate = useNavigate();

    return (
        <div className="user-id">
            <h1>Ciao.</h1>
            <p>Eccoti nell'applicazione pensata per l'esperimento di raccolta dati sul mood</p>
            <h5 className="blue">Inserisci il tuo ID univoco.</h5>
            <form onSubmit={saveUserID} >
                <TextField required variant="outlined" name="userID" placeholder="ID" value={userID} onChange={handleIdChange} />
                <div className="bottone-userID">
                    <Button fullWidth type="submit" variant="contained" disabled={!userID}>Continua</Button>
                </div>
            </form>
            <div className="naviga-id-dimenticato">
                <Link to="/ID-dimenticato">Hai dimenticato il tuo ID univoco?</Link>
            </div>
        </div>
    )
}

export default UserID;