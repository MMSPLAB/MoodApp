import safeStorage from "../safeStorage";
import { clearDB } from "./imageDB";

export function resetQuestionario(all = false) {
    // Reset dati di valutazione stimoli
    safeStorage.removeItem("valutazioni");
    safeStorage.removeItem("selectedMood");
    safeStorage.removeItem("endingTimeGlobal");
    safeStorage.removeItem("questionarioStartTime");
    safeStorage.removeItem("orarioInizioMood");

    safeStorage.removeItem("attività");
    safeStorage.removeItem("inizioAttività");
    safeStorage.removeItem("fineAttività");
    safeStorage.removeItem("tipoAttività");


    if (all) {
        safeStorage.removeItem('preloadSessionKey');
        safeStorage.removeItem("stimulusOrder");
        safeStorage.removeItem("dataPickAMood-finale");
        safeStorage.removeItem("preloadDone");
        safeStorage.removeItem("preloadAlreadyLaunched");
        safeStorage.removeItem("preloadStartedAt")

        clearDB();
    }

    for (let i = 1; i <= 10; i++) {
        safeStorage.removeItem(`valence${i}`);
        safeStorage.removeItem(`arousal${i}`);
        safeStorage.removeItem(`startingTime${i}`);
        safeStorage.removeItem(`endingTime${i}`);
        if (all) {
            safeStorage.removeItem(`stimulusFile${i}`);
            safeStorage.removeItem(`stimulusURL${i}`);
        }
    }
    // Reset intensità
    const storageKey = safeStorage.getItem("storageKey");
    if (storageKey) {
        safeStorage.removeItem(storageKey);
        safeStorage.removeItem("storageKey");
    }
}