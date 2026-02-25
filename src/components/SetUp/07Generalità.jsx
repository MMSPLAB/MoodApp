import React, { useEffect, useState } from "react";
import { Button, FormControl, FormControlLabel, TextField, Radio, RadioGroup } from "@mui/material";
import { useNavigate } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import safeStorage from "../../../safeStorage";

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

    const [error, setError] = useState("");


    useEffect(() => {
        const storedAge = safeStorage.getItem("Età");
        if (storedAge) {
            setAge(storedAge);
            setSavedAge(storedAge);
        }
    }, []);

    useEffect(() => {
        const storedGender = safeStorage.getItem("Genere");
        if (storedGender) {
            setGender(storedGender);
            setSavedGender(storedGender);
        }
    }, []);

    useEffect(() => {
        const storedIstruzione = safeStorage.getItem("Istruzione");
        if (storedIstruzione) {
            setIstruzione(storedIstruzione);
            setSavedIstruzione(storedIstruzione);
        }
    }, []);

    useEffect(() => {
        const storedDispositivo = safeStorage.getItem("Dispositivo");
        if (storedDispositivo) {
            setDispositivo(storedDispositivo);
            setSavedDispositivo(storedDispositivo);
        }
    }, []);

    const handleGenderChange = (event) => {
        const selectedGender = event.target.value;
        setGender(selectedGender);
    };

    const handleAgeChange = (event) => {
        const input = event.currentTarget.value;
        setAge(input);

        if (input === "") {
            setError("");
            return;
        }

        const ageNumber = parseInt(input, 10);
        if (isNaN(ageNumber)) {
            setError("L'età deve essere un numero valido");
        } else if (ageNumber < 18) {
            setError("Devi essere amggiorenne per partecipare all'esperimento");
        } else if (ageNumber > 115) {
            setError("L'età inserita sembra essere troppo alta");
        } else {
            setError("");
        }
    };


    const handleIstruzioneChange = (event) => {
        const newIstruzione = event.currentTarget.value;
        setIstruzione(newIstruzione);
    }

    const handleAltroChange = (event) => {
        const newAltro = event.currentTarget.value;
        setAltro(newAltro);
        const newIstruzione = event.currentTarget.value;
        setIstruzione(newIstruzione);
    }

    const handleDispositivoChange = (event) => {
        const newDispositivo = event.currentTarget.value;
        setDispositivo(newDispositivo);
    }

    const saveAll = (event) => {
        //event.preventDefault(); //esigenze di Safari: non usiamo componente form
        safeStorage.setItem("Genere", gender);
        setSavedGender(gender);

        safeStorage.setItem("Età", age);
        setSavedAge(age);

        safeStorage.setItem("Istruzione", istruzione);
        setIstruzione(istruzione);

        safeStorage.setItem("Dispositivo", dispositivo);
        setDispositivo(dispositivo);
    };

    const navigate = useNavigate();
    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/termini-e-condizioni")}>   <WestSharpIcon /> </Button>
            </div>
            <div className="contenitore-testo">
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
                        <br />
                        <div className="age">
                            <h3>Età</h3>
                            <TextField required variant="outlined" placeholder="Age" value={age} name="Age" onChange={handleAgeChange} /> <br />
                            {error && (
                                <div style={{ color: "red", marginTop: "4px" }}>
                                    {error}
                                </div>
                            )}
                        </div>
                        <br />
                        <div className="istruzione">
                            <FormControl>
                                <h3>Istruzione</h3>
                                <RadioGroup aria-labelledby="demo-error-radios" name="istruzione" value={istruzione} onChange={handleIstruzioneChange}>
                                    <FormControlLabel value="Diploma scuola secondaria di primo grado (medie)" control={<Radio />} label="Diploma scuola secondaria di primo grado (medie)" />
                                    <FormControlLabel value="Diploma scuola secondaria di secondo grado (superiori)" control={<Radio />} label="Diploma scuola secondaria di secondo grado (superiori)" />
                                    <FormControlLabel value="Laurea triennale" control={<Radio />} label="Laurea triennale" />
                                    <FormControlLabel value="Laurea magistrale" control={<Radio />} label="Laurea magistrale" />
                                    <FormControlLabel value="Laurea a ciclo unico" control={<Radio />} label="Laurea a ciclo unico" />
                                    <FormControlLabel value="Master" control={<Radio />} label="Master" />
                                    <FormControlLabel value="Dottorato" control={<Radio />} label="Dottorato" />
                                    {/* L'opzione non risulta selezionata fino a quando non viene scritto qualcosa all'interno del campo */}
                                    <FormControlLabel control={<Radio checked={istruzione === altro && altro !== ""} onChange={() => setIstruzione(altro)} />} label={<input className="input-istruzione" type="text" label="Altro..." value={altro ?? ""} placeholder="Altro..." onChange={handleAltroChange} />} />
                                </RadioGroup>
                            </FormControl>
                        </div>
                        <br />
                        <div className="modello-telefono">
                            <h3>Dispositivo</h3>
                            <p>Quale dispositivo stai utilizzando?</p>
                            <p><i>Specifica da quale dispositivo stai compilando questo questionario (ad esempio, scrivi la marca del tuo telefono).</i></p>

                            <TextField required variant="outlined" placeholder="Marca dispositivo" value={dispositivo} name="Dispositivo" onChange={handleDispositivoChange} /> <br />
                        </div>
                        <br />
                    </form>
                    <div className="red">
                        <p>*completa tutti i campi prima di procedere.</p>
                    </div>
                    <div className="arrow-right">
                        <Button variant="contained" disabled={!gender || age === "" || isNaN(age) || age < 18 || age > 115 || !istruzione || !dispositivo} type="submit" onClick={() => navigate("/scelta-avatar")}> <EastSharpIcon /></Button>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Generality