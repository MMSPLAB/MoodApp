import { useEffect } from "react";
import { useNavigate } from "react-router";
import { resetQuestionario } from "./ResetQuestionario";
import { addLog } from "./logs";

function useQuestionarioTimer() {
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            const startTimeString = localStorage.getItem("questionarioStartTime");
            if (!startTimeString) return;

            const [hour, minute] = startTimeString.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hour, minute, 0, 0);

            const elapsedMinutes = (Date.now() - startDate.getTime()) / (1000 * 60);

            // se viene superato il tempo massimo di 20 minuti viene chiuso il questionario
            if (elapsedMinutes >= 20) {
                addLog("Tempo massimo superato, questionario chiuso");
                resetQuestionario();
                navigate("/");
            }
        }, 15000); // ogni 15 secondi

        return () => clearInterval(interval);
    }, [navigate, resetQuestionario]);
}

export default useQuestionarioTimer;