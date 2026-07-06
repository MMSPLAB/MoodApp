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
import { itIT } from '@mui/x-date-pickers/locales';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import useQuestionarioTimer from "../../TimerQuestionario";

const italianPickerLocaleText = {
    ...itIT.components.MuiLocalizationProvider.defaultProps.localeText,
    cancelButtonLabel: 'Indietro',
    clearButtonLabel: 'Indietro',
    timePickerToolbarTitle: 'Seleziona orario attività',
};




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
    const [inizio, setInizio] = useState(null);
    const [fine, setFine] = useState(null);
    const [descrizione, setDescrizione] = useState("");
    const [descrizioneAltro, setDescrizioneAltro] = useState("");
    const [hasTriedProceed, setHasTriedProceed] = useState(false);

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
        setHasTriedProceed(false);
        if (inizio && fine) {
            const diff = newValue.diff(inizio, 'minute');
            console.log("Diff in minuti:", diff);
            setInizio(newValue);
            setFine(fine.add(diff, 'minute'));
        } else {
            setInizio(newValue);
        }
    }

    const handleEndChange = (newValue) => {
        setHasTriedProceed(false);
        if (inizio && newValue.isBefore(inizio)) {
            setErroreDataFine("L'orario di fine deve essere successivo a quello di inizio.");
            return;
        }
        setErroreDataFine("");
        setFine(newValue);

    }

    const getTimePickerSlotProps = (placeholder) => ({
        textField: {
            placeholder,
            sx: {
                '& .MuiInputLabel-root': {
                    color: 'var(--muted)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--input-fg)',
                },
                '& .MuiInputBase-input': {
                    color: 'var(--input-fg)',
                },
                '& .MuiOutlinedInput-root': {
                    backgroundColor: 'var(--input-bg)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--input-border)',
                },
                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--input-border)',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--input-fg)',
                },
                '& .MuiIconButton-root': {
                    color: 'var(--muted)',
                },
                '& input::placeholder': {
                    color: 'var(--muted)',
                    opacity: 0.6,
                },
            },
        },
        desktopPaper: {
            sx: {
                backgroundColor: 'var(--input-bg)',
                color: 'var(--input-fg)',
                border: '1px solid var(--input-border)',
                '& .MuiTypography-root, & .MuiButtonBase-root, & .MuiSvgIcon-root': {
                    color: 'var(--input-fg) !important',
                },
            },
        },
        mobilePaper: {
            sx: {
                backgroundColor: 'var(--input-bg)',
                color: 'var(--input-fg)',
                border: '1px solid var(--input-border)',
                '& .MuiTypography-root, & .MuiButtonBase-root, & .MuiSvgIcon-root': {
                    color: 'var(--input-fg) !important',
                },
            },
        },
        popper: {
            sx: {
                '& .MuiPaper-root': {
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-fg)',
                    border: '1px solid var(--input-border)',
                },
                '& .MuiTypography-root, & .MuiButtonBase-root, & .MuiSvgIcon-root': {
                    color: 'var(--input-fg) !important',
                },
            },
        },
        layout: {
            sx: {
                '& .MuiPickersToolbar-root': {
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-fg) !important',
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '10px',
                    paddingBottom: '8px',
                },
                '& .MuiPickersToolbar-content': {
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                },
                '& .MuiTimePickerToolbar-hourMinuteLabel': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '2px',
                },
                '& .MuiTimePickerToolbar-hourMinuteLabel .MuiTypography-root': {
                    lineHeight: 1,
                },
                '& .MuiTimePickerToolbar-separator': {
                    lineHeight: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    alignSelf: 'center',
                },
                '& .MuiPickersToolbarText-root': {
                    color: 'var(--input-fg) !important',
                },
                '& .MuiPickersToolbarText-root.Mui-selected': {
                    color: 'var(--input-fg) !important',
                },
                '& .MuiPickersClock-root': {
                    backgroundColor: 'var(--input-border)',
                },
                '& .MuiPickersLayout-contentWrapper': {
                    paddingBottom: '26px',
                },
                '& .MuiTimeClock-root': {
                    width: '100%',
                    minWidth: 320,
                    minHeight: 380,
                    margin: '10px auto 24px',
                    display: 'grid',
                    gridTemplateRows: 'auto auto 1fr',
                    justifyItems: 'center',
                },
                '& .MuiTimeClock-arrowSwitcher': {
                    position: 'static !important',
                    gridRow: 2,
                    margin: '6px auto 20px',
                },
                '& .MuiTimeClock-arrowSwitcher .MuiPickersArrowSwitcher-root': {
                    position: 'static !important',
                },
                '& .MuiTimeClock-root .MuiClock-root': {
                    gridRow: 3,
                },
                '& .MuiClock-root': {
                    transform: 'scale(1.12)',
                    transformOrigin: 'center',
                    marginTop: '6px',
                    marginBottom: '18px',
                },
                '& .MuiClock-clock': {
                    backgroundColor: 'var(--input-border)',
                },
                '& .MuiClockNumber-root': {
                    color: 'var(--input-fg) !important',
                },
                '& .MuiClockNumber-root.Mui-selected': {
                    color: 'var(--btn-fg) !important',
                },
                '& .MuiClock-pin, & .MuiClockPointer-root, & .MuiClockPointer-thumb': {
                    backgroundColor: 'var(--btn-bg)',
                },
                '& .MuiMultiSectionDigitalClockSection-root': {
                    backgroundColor: 'var(--input-bg)',
                },
                '& .MuiMultiSectionDigitalClockSection-item': {
                    color: 'var(--input-fg) !important',
                },
                '& .MuiMultiSectionDigitalClockSection-item.Mui-selected': {
                    backgroundColor: 'var(--btn-bg)',
                    color: 'var(--btn-fg) !important',
                },
                '& .MuiButtonBase-root': {
                    color: 'var(--input-fg) !important',
                },
                '& .MuiPickersLayout-actionBar .MuiButton-root': {
                    color: 'var(--input-fg) !important',
                    borderRadius: '8px',
                    padding: '4px 10px',
                },
                '& .MuiPickersLayout-actionBar': {
                    paddingTop: '14px',
                },
                '& .MuiPickersLayout-actionBar .MuiButton-root:hover': {
                    backgroundColor: 'var(--bg)',
                },
            },
        },
    });

    const getTimePickerLocaleText = (timePickerToolbarTitle) => ({
        ...italianPickerLocaleText,
        timePickerToolbarTitle,
    });

    const handleEsercizioFisicoChange = (value) => {
        setHasTriedProceed(false);
        setEsercizioFisico(value);
    };

    const handleDescrizioneChange = (value) => {
        setHasTriedProceed(false);
        setDescrizione(value);
    };

    const handleDescrizioneAltroChange = (value) => {
        setHasTriedProceed(false);
        setDescrizioneAltro(value);
    };

    const isFormIncomplete = () => {
        if (esercizioFisico === null) return true;
        if (esercizioFisico !== "true") return false;

        return (
            descrizione === "" ||
            erroreDataFine !== "" ||
            (descrizione === "Altro" && descrizioneAltro.trim() === "") ||
            !inizio ||
            !fine
        );
    };

    const handleProceedAttempt = () => {
        if (isFormIncomplete()) {
            setHasTriedProceed(true);
        }
    };

    const handleNext = () => {
        if (isFormIncomplete()) return;

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
        <div className="content-box">
            <div className="arrow-left arrow-left-content-aligned">
                <Button variant="outlined" onClick={() => navigate("/pick-a-mood")}>
                    <WestSharpIcon sx={{ color: '#005DD3' }} />
                </Button>
            </div>
            <div>
                <h3 className="blu-maiuscolo">Hai svolto attività fisica nelle ultime ore?</h3>
                <p>Considera il periodo di tempo precedente alla compilazione di questo questionario, dopo aver completato l'ultimo questionario.</p>
                <FormControl>
                    <RadioGroup aria-labelledby="demo-error-radios" name="gender" value={esercizioFisico}
                        onChange={(e) => handleEsercizioFisicoChange(e.target.value)}>
                        <FormControlLabel value="true" control={<Radio />} label="Sì, ho svolto attività fisica" />
                        <FormControlLabel value="false" control={<Radio />} label="No, non ho svolto attività fisica" />
                    </RadioGroup>
                </FormControl>
            </div>

            {esercizioFisico === "true" &&
                <div className="form-generalità">
                    <br></br>
                    <p className="testo">Inserisci l’orario indicativo dell’attività svolta.</p>
                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale="it"
                        localeText={italianPickerLocaleText}
                    >
                        <Grid container spacing={1}>
                            <Grid size={6}>
                                <TimePicker
                                    label=""
                                    value={inizio}
                                    onChange={handleStartChange}
                                    localeText={getTimePickerLocaleText('Seleziona orario inizio attività')}
                                    slotProps={getTimePickerSlotProps("Inizio - 00:00")}
                                />
                            </Grid>
                            <Grid size={6}>
                                <TimePicker
                                    label=""
                                    value={fine}
                                    onChange={handleEndChange}
                                    localeText={getTimePickerLocaleText('Seleziona orario fine attività')}
                                    slotProps={getTimePickerSlotProps("Fine - 00:00")}
                                />
                            </Grid>
                            {erroreDataFine && <div style={{ color: "red", marginTop: "4px" }}>
                                {erroreDataFine}
                            </div>}
                        </Grid>
                    </LocalizationProvider>
                    <br></br>
                    <p className="testo">Come descriveresti l'attività svolta?</p>
                    <FormControl fullWidth>
                        <InputLabel
                            shrink={true}
                            sx={{
                                color: 'var(--muted)',
                                '&.Mui-focused': {
                                    color: 'var(--input-fg)',
                                },
                            }}
                        >
                            Attività
                        </InputLabel>
                        <Select
                            value={descrizione}
                            label="Attività"
                            displayEmpty
                            MenuProps={{
                                disablePortal: true,
                                anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                },
                                transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                },
                            }}
                            onChange={(e) => handleDescrizioneChange(e.target.value)}
                            renderValue={(selected) => {
                                if (!selected) {
                                    return <span style={{ color: 'var(--muted)', opacity: 0.65 }}>Seleziona attività</span>;
                                }
                                return selected;
                            }}
                            sx={{
                                color: 'var(--input-fg)',
                                backgroundColor: 'var(--input-bg)',
                                '& .MuiSelect-icon': {
                                    color: 'var(--muted)',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--input-border)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--input-border)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'var(--input-fg)',
                                },
                            }}
                        >
                            <MenuItem value="Corsa">Corsa</MenuItem>
                            <MenuItem value="Palestra">Palestra</MenuItem>
                            <MenuItem value="Camminata">Camminata</MenuItem>
                            <MenuItem value="Sport di Squadra">Sport di Squadra</MenuItem>
                            <MenuItem value="Ciclismo">Ciclismo</MenuItem>
                            <MenuItem value="Nuoto">Nuoto</MenuItem>
                            <MenuItem value="Altro">Altro</MenuItem>
                        </Select>
                    </FormControl>
                    {descrizione === "Altro" &&
                        <>
                            <br />
                            <TextField 
                                required 
                                fullWidth
                                variant="outlined" 
                                placeholder="Specifica il tipo di attività" 
                                value={descrizioneAltro} 
                                name="DescrizioneAltro" 
                                onChange={(e) => handleDescrizioneAltroChange(e.target.value)}
                                sx={{
                                    width: '100%',
                                    maxWidth: 'none',
                                    margin: 0,
                                    boxSizing: 'border-box',
                                    color: 'var(--input-fg)',
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'var(--input-bg)',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--input-border)',
                                    },
                                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--input-border)',
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--input-fg)',
                                    },
                                    '& input::placeholder': {
                                        color: 'var(--fg)',
                                        opacity: 0.5,
                                    },
                                }}
                            />
                        </>
                    }
                </div>
            }

            {hasTriedProceed && isFormIncomplete() && (
                <div className="red bg-solid-color arrow-right-content-aligned">
                    <p className="warning-text">Per continuare, completa prima i campi richiesti.</p>
                </div>
            )}
            <div className="arrow-right arrow-right-content-aligned">
                <div onMouseDown={handleProceedAttempt} onTouchStart={handleProceedAttempt}>
                    <Button variant="contained" disabled={isFormIncomplete()}
                        onClick={() => handleNext()}> <EastSharpIcon /> </Button>
                </div>
            </div>
        </div>
    )
}

export default EsercizioFisico;