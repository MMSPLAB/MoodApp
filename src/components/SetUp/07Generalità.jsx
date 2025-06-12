import React, { useEffect, useState } from "react";
import { Button, FormControl, FormControlLabel, TextField, Radio, RadioGroup } from "@mui/material";
import { useNavigate } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';

function Generality() {

    const [gender, setGender] = useState("");
    const [savedGender, setSavedGender] = useState("");
    const [age, setAge] = useState("");
    const [savedAge, setSavedAge] = useState("");
    const [istruzione, setIstruzione] = useState("");
    const [savedIstruzione, setSavedIstruzione] = useState("");
    const [altro, setAltro] = useState("");
    const [dispositivo, setDispositivo] = useState("");
    const [savedDispositivo, setSavedDispositivo] = useState("");


    useEffect(() => {
        const storedAge = localStorage.getItem("Età");
        if (storedAge) {
            setAge(storedAge);
            setSavedAge(storedAge);
        }
    }, []);

    useEffect(() => {
        const storedGender = localStorage.getItem("Genere");
        if (storedGender) {
            setGender(storedGender);
            setSavedGender(storedGender);
        }
    }, []);

    useEffect(() => {
        const storedIstruzione = localStorage.getItem("Istruzione");
        if (storedIstruzione) {
            setIstruzione(storedIstruzione);
            setSavedIstruzione(storedIstruzione);
        }
    }, []);

    useEffect(() => {
        const storedDispositivo = localStorage.getItem("Dispositivo");
        if (storedDispositivo) {
            setDispositivo(storedDispositivo);
            setSavedDispositivo(storedDispositivo);
        }
    }, []);

    const handleGenderChange = (event) => {
        const selectedGender = event.target.value;
        setGender(selectedGender);
        console.log(selectedGender);
    };

    const handleAgeChange = (event) => {
        const newAge = event.currentTarget.value;
        setAge(newAge);
        console.log(newAge);
    };

    const handleIstruzioneChange = (event) => {
        const newIstruzione = event.currentTarget.value;
        setIstruzione(newIstruzione);
        console.log(newIstruzione);
    }

    const handleAltroChange = (event) => {
        const newAltro = event.currentTarget.value;
        setAltro(newAltro);
        console.log(newAltro);
        const newIstruzione = event.currentTarget.value;
        setIstruzione(newIstruzione);
        console.log(newIstruzione);
    }

    const handleDispositivoChange = (event) => {
        const newDispositivo = event.currentTarget.value;
        setDispositivo(newDispositivo);
        console.log(newDispositivo);
    }

    const saveAll = (event) => {
        event.preventDefault();
        localStorage.setItem("Genere", gender);
        setSavedGender(gender);
        console.log("Genere confermato e salvato:", gender);
        localStorage.setItem("Età", age);
        setSavedAge(age);
        console.log("Età confermata e salvata:", age);
        localStorage.setItem("Istruzione", istruzione);
        setIstruzione(istruzione);
        console.log("Istruzione confermata e salvata:", istruzione);
        localStorage.setItem("Dispositivo", dispositivo);
        setDispositivo(dispositivo);
        console.log("Dispositivo confermato e salvato:", dispositivo);
    };

    const navigate = useNavigate();
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/selezione-orario-notifiche")}> {/* ← */}<WestSharpIcon /> </Button>
            </div>
            <div className="titolo-generalità">
                <h1>Generalità</h1>
            </div>
            <div className="form-generalità">
                <form onSubmit={saveAll}>
                    <div className="gender">
                        <FormControl>
                            <h3>Genere</h3>
                            <RadioGroup aria-labelledby="demo-error-radios" name="gender" value={gender} onChange={handleGenderChange}>
                                <FormControlLabel value="maschio" control={<Radio />} label="Maschio" />
                                <FormControlLabel value="femmina" control={<Radio />} label="Femmina" />
                                <FormControlLabel value="non-binario" control={<Radio />} label="Non binario" />
                                <FormControlLabel value="preferisco-non-specificarlo" control={<Radio />} label="Preferisco non specificarlo" />
                            </RadioGroup>
                        </FormControl>
                    </div>
                    <div className="age">
                        <h3>Età</h3>
                        <TextField required variant="outlined" placeholder="Age" value={age} name="Age" onChange={handleAgeChange} /> <br />
                    </div>
                    <div className="istruzione">
                        <FormControl>
                            <h3>Istruzione</h3>
                            <RadioGroup aria-labelledby="demo-error-radios" name="istruzione" value={istruzione} onChange={handleIstruzioneChange}>
                                <FormControlLabel value="Diploma scuola secondaria di secondo grado (medie)" control={<Radio />} label="Diploma scuola secondaria di secondo grado (medie)" />
                                <FormControlLabel value="Diploma scuola secondaria di primo grado (liceo)" control={<Radio />} label="Diploma scuola secondaria di primo grado (liceo)" />
                                <FormControlLabel value="Laurea triennale" control={<Radio />} label="Laurea triennale" />
                                <FormControlLabel value="Laurea magistrale" control={<Radio />} label="Laurea magistrale" />
                                <FormControlLabel value="Laurea a ciclo unico" control={<Radio />} label="Laurea a ciclo unico" />
                                <FormControlLabel value="Master" control={<Radio />} label="Master" />
                                <FormControlLabel value="Dottorato" control={<Radio />} label="Dottorato" />
                                {/* L'opzione non risulta selezionata fino a quando non viene scritto qualcosa all'interno del campo */}
                                <FormControlLabel control={<Radio checked={istruzione === altro && altro !== ""} onChange={() => setIstruzione(altro)} />} label={<input className="input-istruzione" type="text" label="Altro..." value={altro ?? ""} placeholder="Altro..." onChange={handleAltroChange}/>} />
                            </RadioGroup>
                        </FormControl>
                    </div>
                    <div className="modello-telefono">
                        <h3>Dispositivo</h3>
                        <p>Quale dispositivo stai utilizzando? Scrivi la marca.</p>
                        <TextField required variant="outlined" placeholder="Marca dispositivo" value={dispositivo} name="Dispositivo" onChange={handleDispositivoChange} /> <br />
                    </div>
                    <div className="arrow-right">
                        <Button variant="contained" disabled={!gender || !age || !istruzione || !dispositivo} type="submit" onClick={() => navigate("/scelta-avatar")}>{/* → */}<EastSharpIcon /></Button>
                    </div>
                </form>
            </div>
        </div >
    )
}

export default Generality