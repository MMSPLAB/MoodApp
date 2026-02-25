import { useNavigate } from "react-router";
import { Button, FormControl, Grid } from "@mui/material";
import { RadioGroup, FormControlLabel, TextField, Radio } from "@mui/material";
import { Select, MenuItem, InputLabel } from "@mui/material";
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import safeStorage from "../../../safeStorage";
import { useEffect, useState } from "react";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useQuestionarioTimer from "../../TimerQuestionario";




function EsercizioFisico() {
    const navigate = useNavigate();

    useQuestionarioTimer();

    const userID = safeStorage.getItem("userID");
    const avatar = safeStorage.getItem("selectedAvatar");
    const mood = safeStorage.getItem("selectedMood");

    if (!userID || !avatar || !mood) {
        navigate("/");
    }

    const [esercizioFisico, setEsercizioFisico] = useState(null);
    const [inizio, setInizio] = useState(dayjs((new Date()).setHours((new Date()).getHours() - 3, 0, 0, 0)));
    const [fine, setFine] = useState(dayjs((new Date()).setHours((new Date()).getHours() - 2, 0, 0, 0)));
    const [descrizione, setDescrizione] = useState("");
    const [descrizioneAltro, setDescrizioneAltro] = useState("");

    const [erroreDataFine, setErroreDataFine] = useState("");

    useEffect(() => {
        const cachedEsercizioFisico = safeStorage.getItem("attività");
        const cachedInizio = safeStorage.getItem("inizioAttività");
        const cachedFine = safeStorage.getItem("fineAttività");
        const cachedDescrizione = safeStorage.getItem("tipoAttività");

        if (cachedEsercizioFisico) setEsercizioFisico(cachedEsercizioFisico);
        if (cachedInizio) setInizio(dayjs(cachedInizio));
        if (cachedFine) setFine(dayjs(cachedFine));
        if (cachedDescrizione) {
            if (["corsa", "palestra", "camminata", "sport di squadra", "ciclismo", "nuoto"].includes(cachedDescrizione)) {
                setDescrizione(cachedDescrizione);
            } else {
                setDescrizione("altro");
                setDescrizioneAltro(cachedDescrizione);
            }
        }
    }, []);

    const handleStartChange = (newValue) => {
        const diff = newValue.diff(inizio, 'minute');
        console.log("Diff in minuti:", diff);
        setInizio(newValue);
        setFine(fine.add(diff, 'minute'));
    }

    const handleEndChange = (newValue) => {
        if (newValue.isBefore(inizio)) {
            setErroreDataFine("L'orario di fine deve essere successivo a quello di inizio.");
            return;
        }
        setErroreDataFine("");
        setFine(newValue);

    }

    const handleNext = () => {
        safeStorage.setItem("attività", esercizioFisico);
        if (esercizioFisico === "true") {
            safeStorage.setItem("inizioAttività", inizio);
            safeStorage.setItem("fineAttività", fine);

            if (descrizione === "altro")
                safeStorage.setItem("tipoAttività", descrizioneAltro);
            else
                safeStorage.setItem("tipoAttività", descrizione);
        }

        navigate("/intro-stimoli");
    }

    return (
        <div>
            <div className="arrow-left">
                <Button variant="outlined" onClick={() => navigate("/pick-a-mood")}>
                    <WestSharpIcon sx={{ color: '#005DD3' }} />
                </Button>
            </div>
            <div>
                <h3 className="blu-maiuscolo">Hai fatto attività fisica dall'ultimo questionario?</h3>
                <FormControl>
                    <RadioGroup aria-labelledby="demo-error-radios" name="gender" value={esercizioFisico}
                        onChange={(e) => { setEsercizioFisico(e.target.value) }}>
                        <FormControlLabel value="true" control={<Radio />} label="Sì" />
                        <FormControlLabel value="false" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>
            </div>

            {esercizioFisico === "true" &&
                <div className="form-generalità">
                    <p className="testo">Inserisci l'orario indicativo in cui hai fatto attività fisica</p>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={1}>
                            <Grid size={6}>
                                <TimePicker
                                    label="Inizio"
                                    value={inizio}
                                    onChange={handleStartChange}
                                />
                            </Grid>
                            <Grid size={6}>
                                <TimePicker
                                    label="Fine"
                                    value={fine}
                                    onChange={handleEndChange}
                                />
                            </Grid>
                            {erroreDataFine && <div style={{ color: "red", marginTop: "4px" }}>
                                {erroreDataFine}
                            </div>}
                        </Grid>
                    </LocalizationProvider>
                    <p className="testo">Come descriveresti l'attività svolta?</p>
                    <FormControl fullWidth>
                        <InputLabel>Attività</InputLabel>
                        <Select
                            value={descrizione}
                            label="Attività"
                            onChange={(e) => setDescrizione(e.target.value)}
                        >
                            <MenuItem value="corsa">Corsa</MenuItem>
                            <MenuItem value="palestra">Palestra</MenuItem>
                            <MenuItem value="camminata">Camminata</MenuItem>
                            <MenuItem value="sport di squadra">Sport di Squadra</MenuItem>
                            <MenuItem value="ciclismo">Ciclismo</MenuItem>
                            <MenuItem value="nuoto">Nuoto</MenuItem>
                            <MenuItem value="altro">Altro</MenuItem>
                        </Select>
                    </FormControl>
                    {descrizione === "altro" &&
                        <div>
                            <br />
                            <FormControl fullWidth>
                                <TextField required variant="outlined" placeholder="Specifica..." value={descrizioneAltro} name="DescrizioneAltro" onChange={(e) => setDescrizioneAltro(e.target.value)} /> <br />
                            </FormControl>
                        </div>
                    }
                </div>
            }

            <div className="red">
                <p>*completa tutti i campi prima di procedere.</p>
            </div>
            <div className="arrow-right">
                <Button variant="contained" disabled={esercizioFisico === null ||
                    (esercizioFisico === "true" && (descrizione === "" || erroreDataFine != "" || (descrizione === "altro" && descrizioneAltro === "")))}
                    onClick={() => handleNext()}> <EastSharpIcon /> </Button>
            </div>
        </div>
    )
}

export default EsercizioFisico;