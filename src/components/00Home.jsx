import React, { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router'

function Home() {
    const [completatiOggi, setCompletatiOggi] = useState(0);
    const [completatiTotali, setCompletatiTotali] = useState(0);
    const [minutesToNext, setMinutesToNext] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [nextStartTime, setNextStartTime] = useState("");
    const [fasciaCorrenteIndex, setFasciaCorrenteIndex] = useState(null);

    const navigate = useNavigate();

    const getToday = () => new Date().toLocaleDateString('it-IT').slice(0, 10);

    const fasceAttive = [
        [9, 12],
        [15, 18],
        [20, 23]
    ];

    //calcolo in formato hh:mm la fascia oraria successiva da mostrare
    const prossimoOrario = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        let result = "";
        if (hours > 0) {
            result += `${hours} ${hours > 1 ? 'ore' : 'ora'}`;
            if (minutes > 0) {
                result += ` e ${minutes} min`;
            }
        } else if (minutes > 0) {
            const m = Number(minutes);  // forza cast di sicurezza
            const label = m === 1 ? "minuto" : "minuti";
            result += `${m} ${label}`;
        } else {
            result = "0 minuti";
        }
        return result;
    }

    useEffect(() => {
        function checkTime() {
            const now = new Date();
            const currentMinutes = now.getHours() + now.getMinutes() / 60;


            //controlla se l'ora corrente è all'interno di una delle tre fasce orarie
            let activeNow = false;
            let nextStart = null;
            let currentFasciaIndex = null;

            for (let i = 0; i < fasceAttive.length; i++) {
                const [start, end] = fasceAttive[i]
                if (currentMinutes >= start && currentMinutes < end) {
                    activeNow = true;
                    currentFasciaIndex = i;
                    break;
                }
                if (currentMinutes < start) {
                    //trova la prima fascia futura rispetto all'orario attuale
                    if (nextStart === null || start < nextStart) {
                        nextStart = start;
                    }
                }
            }
            //se non attivo e no fascia futura passo alla fascia del giorno successivo
            if (!activeNow && nextStart === null) {
                nextStart = fasceAttive[0][0] + 24;
            }

            if (activeNow) {
                setIsActive(true);
                setMinutesToNext(null);
                setNextStartTime("");
                setFasciaCorrenteIndex(currentFasciaIndex);
            } else {
                setIsActive(false);

                //calcola i minuti alla prossima fascia oraria
                const nowMinutes = now.getHours() * 60 + now.getMinutes();
                const nextMinutes = Math.floor(nextStart * 60);
                const differenzaMinuti = (nextMinutes >= nowMinutes ? nextMinutes : nextMinutes + 1440) - nowMinutes;
                setMinutesToNext(differenzaMinuti);

                const hour = Math.floor(nextStart % 24);
                const minute = Math.round((nextStart % 1) * 60);
                const orarioQuestionario = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                setNextStartTime(orarioQuestionario);
            }
        }
        checkTime();
        const intervalloMinuti = setInterval(checkTime, 60000); //aggiorna ogni minuto il countdown al prossimo questionario
        return () => clearInterval(intervalloMinuti);
    }, [fasceAttive])

    useEffect(() => {
        const savedDate = localStorage.getItem("dataQuestionariCompletati");
        const today = getToday();

        if (savedDate !== today) {
            localStorage.setItem("dataQuestionariCompletati", today);
            localStorage.setItem("completati", "0");
            setCompletatiOggi(0);
        } else {
            const savedCount = parseInt(localStorage.getItem("completati") || "0", 10);
            setCompletatiOggi(savedCount);
        }

        const totalCount = parseInt(localStorage.getItem("questionariCompletatiTotali") || "0", 10);
        setCompletatiTotali(totalCount);
    }, []);

    const handleQuestionarioClick = () => {
        if (isActive) {
            const now = new Date();
            const orario = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            localStorage.setItem("orarioInizioMood", orario);
            console.log("Questionario inizio alle:", orario);

            const getToday = () => new Date().toLocaleDateString('it-IT').slice(0, 10);
            const today = getToday();
            const day = localStorage.getItem("dataQuestionariCompletati");
            let session = parseInt(localStorage.getItem("session") || "0", 10);
            let completatiTotali = parseInt(localStorage.getItem("questionariCompletatiTotali") || "0", 10);

            if (day !== today) {
                localStorage.setItem("dataQuestionariCompletati", today);
                localStorage.setItem("session", "1");
                session = 1;
            } else if (session < 3) {
                session += 1;
                localStorage.setItem("session", session.toString());
            }

            localStorage.setItem("questionariCompletatiTotali", (completatiTotali + 1).toString());
            localStorage.setItem("completati", session.toString()); // aggiorna anche i completatiOggi

            setCompletatiOggi(session); // aggiorna stato a runtime
            setCompletatiTotali(completatiTotali + 1); // aggiorna stato a runtime
        }
        navigate("/pick-a-mood");
    }

    const completatiSessione = parseInt(localStorage.getItem("session") || "0", 10);
    const sessioneAttivaGiaCompletata = fasciaCorrenteIndex !== null && completatiSessione >= fasciaCorrenteIndex + 1;
    const bottoneDisabilitato = !isActive || sessioneAttivaGiaCompletata;

    return (
        <div>
            <div className='barra-info'>
                <div className='sessione'>
                    <span className='sottotitolo'>Oggi</span>
                    {completatiOggi}/3
                </div>
                <div className='completati'>
                    <span className='sottotitolo'>Completati</span>
                    {completatiTotali}
                </div>
            </div>
            <div className='bottone-home'>
                <Button variant='contained' disabled={bottoneDisabilitato} onClick={handleQuestionarioClick}>
                    {isActive
                        ? (sessioneAttivaGiaCompletata
                            ? "Sessione già completata"
                            : "VAI ORA!")
                        : <>Prossimo questionario tra {prossimoOrario(minutesToNext)} ({nextStartTime})</>
                    }
                </Button>
            </div>
        </div>
    )
}

export default Home