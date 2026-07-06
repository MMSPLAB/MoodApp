import React, { useEffect, useRef, useState } from "react";
import { Button, FormControl, FormControlLabel, TextField, Radio, RadioGroup } from "@mui/material";
import { useNavigate } from 'react-router'
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import safeStorage from "../../../safeStorage";

function Generality() {

    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [istruzione, setIstruzione] = useState("");
    const [altro, setAltro] = useState("");
    const [OS, setOS] = useState("");
    const [altroOS, setAltroOS] = useState("");
    const [dispositivo, setDispositivo] = useState("");

    const [error, setError] = useState("");
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [hasShownProceedWarning, setHasShownProceedWarning] = useState(false);
    const textContainerRef = useRef(null);


    useEffect(() => {
        const storedAge = safeStorage.getItem("Età");
        if (storedAge) {
            setAge(storedAge);
        }
    }, []);

    useEffect(() => {
        const storedGender = safeStorage.getItem("Genere");
        if (storedGender) {
            setGender(storedGender);
        }
    }, []);

    const istruzioneOptions = [
        "Diploma scuola secondaria di primo grado (medie)",
        "Diploma scuola secondaria di secondo grado (superiori)",
        "Laurea triennale",
        "Laurea magistrale",
        "Laurea a ciclo unico",
        "Master",
        "Dottorato"
    ];
    useEffect(() => {
        const storedIstruzione = safeStorage.getItem("Istruzione");
        if (storedIstruzione) {
            if (istruzioneOptions.includes(storedIstruzione)) {
                setIstruzione(storedIstruzione);
            } else {
                setIstruzione("Altro");
                setAltro(storedIstruzione);
            }
        }
    }, []);

    useEffect(() => {
        const storedDispositivo = safeStorage.getItem("Dispositivo");
        if (storedDispositivo) {
            setDispositivo(storedDispositivo);
        }
    }, []);

    useEffect(() => {
        const storedOS = safeStorage.getItem("os");
        if (storedOS) {
            if (storedOS === "Android" || storedOS === "iOS") {
                setOS(storedOS);
            } else {
                setOS("Altro");
                setAltroOS(storedOS);
            }
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
            setError("Inserisci un numero valido.");
        } else if (ageNumber < 18) {
            setError("Devi essere maggiorenne per partecipare all'esperimento");
        } else if (ageNumber > 115) {
            setError("Verifica l’età inserita.");
        } else {
            setError("");
        }
    };


    const handleIstruzioneChange = (event) => {
        const newIstruzione = event.currentTarget.value;
        setIstruzione(newIstruzione);
        if (newIstruzione !== "Altro") {
            setAltro("");
        }
    }

    const handleAltroChange = (event) => {
        const newAltro = event.currentTarget.value;
        setAltro(newAltro);
    }

    const handleOSChange = (event) => {
        const newOS = event.currentTarget.value;
        setOS(newOS);
        if (newOS !== "Altro") {
            setAltroOS("");
        }
    }

    const handleAltroOSChange = (event) => {
        setAltroOS(event.currentTarget.value);
    }

    const handleDispositivoChange = (event) => {
        const newDispositivo = event.currentTarget.value;
        setDispositivo(newDispositivo);
    }

    useEffect(() => {
        const thresholdPx = 2;

        const checkIfAtBottom = () => {
            const textContainer = textContainerRef.current;
            const hasScrollableTextContainer =
                textContainer && textContainer.scrollHeight > textContainer.clientHeight + 1;

            if (hasScrollableTextContainer) {
                const remainingInsideContainer =
                    textContainer.scrollHeight - textContainer.clientHeight - textContainer.scrollTop;
                setIsAtBottom(remainingInsideContainer <= thresholdPx);
                return;
            }

            const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const viewportHeight = window.innerHeight;
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );
            const remainingOnPage = documentHeight - (scrollTop + viewportHeight);
            setIsAtBottom(remainingOnPage <= thresholdPx);
        };

        checkIfAtBottom();
        window.addEventListener("scroll", checkIfAtBottom, { passive: true });
        window.addEventListener("resize", checkIfAtBottom);
        textContainerRef.current?.addEventListener("scroll", checkIfAtBottom, { passive: true });

        return () => {
            window.removeEventListener("scroll", checkIfAtBottom);
            window.removeEventListener("resize", checkIfAtBottom);
            textContainerRef.current?.removeEventListener("scroll", checkIfAtBottom);
        };
    }, []);

    const saveAll = (event) => {
        //event.preventDefault(); //esigenze di Safari: non usiamo componente form
        safeStorage.setItem("Genere", gender);
        setGender(gender);

        safeStorage.setItem("Età", age);
        setAge(age);

        const istruzioneToSave = istruzione === "Altro" ? altro.trim() : istruzione;
        safeStorage.setItem("Istruzione", istruzioneToSave);
        setIstruzione(istruzione);

        const osToSave = OS === "Altro" ? altroOS.trim() : OS;
        safeStorage.setItem("os", osToSave);
        setOS(OS);

        safeStorage.setItem("Dispositivo", dispositivo);
        setDispositivo(dispositivo);
    };

    const navigate = useNavigate();
    const isContinueDisabled = !gender || age === "" || isNaN(age) || age < 18 || age > 115 || !istruzione || (istruzione === "Altro" && !altro.trim()) || !OS || (OS === "Altro" && !altroOS.trim()) || !dispositivo;
    useEffect(() => {
        if (isAtBottom && isContinueDisabled) {
            setHasShownProceedWarning(true);
        }
    }, [isAtBottom, isContinueDisabled]);

    const handleProceedAttempt = () => {
        if (isContinueDisabled) {
            setHasShownProceedWarning(true);
        }
    };

    const showProceedWarning = hasShownProceedWarning && isContinueDisabled;

    return (
        <div className="content-box generalita-page">
            <div className="arrow-left arrow-left-content-aligned">
                <Button variant="outlined" onClick={() => navigate("/termini-e-condizioni")}>   <WestSharpIcon /> </Button>
            </div>
            <div className="contenitore-testo" ref={textContainerRef}>
                <div className="titolo-generalità">
                    <h1>Informazioni personali</h1>
                </div>
                <div className="form-generalità">
                    <form onSubmit={saveAll}>
                        <div className="gender">
                            <FormControl>
                                <h3>Qual è il tuo genere?</h3>
                                <RadioGroup aria-labelledby="demo-error-radios" name="gender" value={gender} onChange={handleGenderChange}>
                                    <FormControlLabel value="maschio" control={<Radio />} label="Uomo" />
                                    <FormControlLabel value="femmina" control={<Radio />} label=" Donna" />
                                    <FormControlLabel value="non-binario" control={<Radio />} label="Non binario" />
                                    <FormControlLabel value="preferisco-non-specificarlo" control={<Radio />} label="Preferisco non rispondere" />
                                </RadioGroup>
                            </FormControl>
                        </div>
                        <br />
                        <div className="age">
                            <h3>Quanti anni hai?</h3>
                            <TextField required variant="outlined" placeholder="Ad esempio: 34" value={age} name="Age" onChange={handleAgeChange} /> <br />
                            {error && (
                                <div style={{ color: "red", marginTop: "4px" }}>
                                    {error}
                                </div>
                            )}
                        </div>
                        <br />
                        <div className="istruzione">
                            <FormControl>
                                <h3>Qual è il tuo titolo di studio più alto?</h3>
                                <RadioGroup aria-labelledby="demo-error-radios" name="istruzione" value={istruzione} onChange={handleIstruzioneChange}>
                                    <FormControlLabel value="Diploma scuola secondaria di primo grado (medie)" control={<Radio />} label="Diploma scuola secondaria di primo grado (medie)" />
                                    <FormControlLabel value="Diploma scuola secondaria di secondo grado (superiori)" control={<Radio />} label="Diploma scuola secondaria di secondo grado (superiori)" />
                                    <FormControlLabel value="Laurea triennale" control={<Radio />} label="Laurea triennale" />
                                    <FormControlLabel value="Laurea magistrale" control={<Radio />} label="Laurea magistrale" />
                                    <FormControlLabel value="Laurea a ciclo unico" control={<Radio />} label="Laurea a ciclo unico" />
                                    <FormControlLabel value="Master" control={<Radio />} label="Master" />
                                    <FormControlLabel value="Dottorato" control={<Radio />} label="Dottorato" />
                                    <FormControlLabel value="Altro" control={<Radio />} label="Altro" />
                                </RadioGroup>
                                {istruzione === "Altro" && (
                                    <TextField
                                        required
                                        variant="outlined"
                                        placeholder="Altro (specifica)"
                                        value={altro}
                                        name="IstruzioneAltro"
                                        onChange={handleAltroChange}
                                    />
                                )}
                            </FormControl>
                        </div>
                        <br />
                        <div className="modello-telefono">
                            <h3>Quale dispositivo usi per l'esperimento?</h3>
                            <i>Indica il dispositivo da cui stai usando MoodApp (telefono, tablet o computer), non il dispositivo indossabile.</i>
                            <h4>Sistema operativo del dispositivo</h4>
                            <RadioGroup aria-labelledby="demo-error-radios" name="operative-system" value={OS} onChange={handleOSChange}>
                                <FormControlLabel value="Android" control={<Radio />} label="Android" />
                                <FormControlLabel value="iOS" control={<Radio />} label="iOS (iPhone)" />
                                <FormControlLabel value="Altro" control={<Radio />} label="Altro" />
                            </RadioGroup>
                            {OS === "Altro" && (
                                <TextField
                                    required
                                    variant="outlined"
                                    placeholder="Specifica il sistema operativo"
                                    value={altroOS}
                                    name="AltroOS"
                                    onChange={handleAltroOSChange}
                                />
                            )}
                            <h4>Modello del dispositivo</h4>
                            <TextField required variant="outlined" placeholder="Es. iPhone 13, Galaxy Tab S8, PC Windows" value={dispositivo} name="Dispositivo" onChange={handleDispositivoChange} /> <br />
                        </div>
                        <br />
                        {showProceedWarning && (
                            <div className="red bg-solid-color arrow-right-content-aligned">
                                <p className="warning-text">Per continuare, completa tutti i campi.</p>
                            </div>
                        )}
                        <div className="arrow-right arrow-right-content-aligned" onMouseDown={handleProceedAttempt} onTouchStart={handleProceedAttempt}>
                            <Button variant="contained" disabled={isContinueDisabled} type="submit" onClick={() => navigate("/scelta-avatar")}> <EastSharpIcon /></Button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    )
}

export default Generality