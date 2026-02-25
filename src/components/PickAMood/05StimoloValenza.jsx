import React, { useState, useEffect } from "react"
import { Button } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import EastSharpIcon from '@mui/icons-material/EastSharp';
import useQuestionarioTimer from "../../TimerQuestionario";
import IstruzioniStimoli from "../Condivisi/IstruzioniStimoli";
import { addDebugLog, addLog } from "../../logs";

// Per finestra info scala valence arousal
import { IconButton, Tooltip, } from "@mui/material";
import safeStorage from "../../../safeStorage";

//per reload immagine
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";

function StimoloValenza() {
  const { stimulusOrder } = useParams();
  const navigate = useNavigate();

  useQuestionarioTimer();

  const savedUserID = safeStorage.getItem("userID");
  const savedAvatar = safeStorage.getItem("selectedAvatar");
  const imageUrl = safeStorage.getItem(`stimulusURL${stimulusOrder}`);
  const stimulusFile = safeStorage.getItem(`stimulusFile${stimulusOrder}`);

  const [errore, setErrore] = useState(null);
  const [valence, setValence] = useState("");
  const [valutazione, setValutazione] = useState(""); //serve per la comparsa ritardata della valutazione dello stimolo
  const [startingTime, setStartingTime] = useState(null);

  const [imageError, setImageError] = useState(false); //Per quando viene visualizzato testo alt al posto dell'immagine
  const [retryCount, setRetryCount] = useState(0); // Conta tentativi di ricaricamento automatico
  const [finalImageUrl, setFinalImageUrl] = useState(null); // URL con cache-busting per visualizzazione
  const [blobObjectUrl, setBlobObjectUrl] = useState(null); // objectURL when blob fetched

  let imageFound = false;



  if (!savedUserID || !savedAvatar) {
    addLog(`Avatar o ID non trovati in valenza ${stimulusOrder} `, "error")
    navigate("/")
  }

  if (!(stimulusFile && imageUrl)) {
    setErrore("Immagine non trovata nella cache")
    addLog(`Immagine ${stimulusOrder} non caricata in cache`, "error")
  }

  useEffect(() => {
    if (!imageFound) {
      if (safeStorage.getItem(`stimulusDataURL${stimulusOrder}`)) {
        setFinalImageUrl(safeStorage.getItem(`stimulusDataURL${stimulusOrder}`))
        addDebugLog(`Immagine ${stimulusOrder} caricata dalla cache`)
        imageFound = true;
      }
      else {
        addLog(`Immagine ${stimulusOrder} non salvata in cache`, "warn")
        handleReloadImage()
      }
    }
  }, [stimulusOrder, imageFound])

  useEffect(() => {
    if (finalImageUrl) {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      setStartingTime(formattedTime)
      safeStorage.setItem(`startingTime${stimulusOrder}`, formattedTime);

      const timer = setTimeout(() => {
        setValutazione(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [finalImageUrl])

    useEffect(() => {
    if (!finalImageUrl) {
      const timer = setTimeout(() => {
        if (!imageFound) {
          addLog(`L'immagine ${stimulusOrder} non è stata trovata dopo 30s`, "error");
          setErrore("Impossibile caricare l'immagine")
        }
      }, 30 * 1000);
      return () => clearTimeout(timer);
    }
  }, [finalImageUrl])

  const onValenceSelection = (selected) => {
    const valence = selected.currentTarget.value;
    setValence(valence);
  }

  useEffect(() => {
    safeStorage.setItem(`valence${stimulusOrder}`, valence);
  }, [valence, stimulusOrder]);

  const handleNext = () => {
    // Naviga alla pagina di valutazione per questo stimolo
    navigate(`/stimolo-attivazione/${stimulusOrder}`);
  };

  //reload dell'immagine se viene mostrato testo alt
  const handleReloadImage = () => {
    if (imageUrl && stimulusFile) {
      setImageError(false);
      setRetryCount(prev => prev + 1);

      const separator = imageUrl.includes('?') ? '&' : '?';
      // Usa timestamp diverso per forzare reload completo
      const urlWithCacheBusting = `${imageUrl}${separator}t=${Date.now()}&retry=${retryCount}`;

      // Also try to fetch as blob and show - this avoids opening external browser
      const success = fetchImageAsBlob(urlWithCacheBusting);
      if (!success) {
        setErrore("Impossibile caricare l'immagine")
        addLog(`fetch blob failed for ${urlWithCacheBusting}`, "warn");
      }
      else
        imageFound = true;
    }
  };

  // Retry automatico fino a 2 tentativi quando immagine fallisce
  useEffect(() => {
    if (imageError && retryCount < 2) {
      addLog(`Immagine ${stimulusOrder} non trovata, retry automatico ${retryCount + 1}/2...`
        , "warn");
      const timer = setTimeout(() => {
        handleReloadImage;
      }, 1500); // Attendi 1.5s prima di ritentare
      return () => clearTimeout(timer);
    }
    else if (imageError && retryCount >= 2)
    {
      setErrore("Immagine non trovata");
      addLog(`Immagine ${stimulusOrder} non trovata`, "error")

    }
  }, [imageError, retryCount]);

  // Try fetch as blob and set object URL (useful when WebView cache or MIME cause issues)
  const fetchImageAsBlob = async (u) => {
    try {
      // revoke previous blob if any
      if (blobObjectUrl) {
        URL.revokeObjectURL(blobObjectUrl);
        setBlobObjectUrl(null);
      }

      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 13000);
      const res = await fetch(u, { signal: controller.signal, mode: 'cors', credentials: 'omit', redirect: 'follow' });
      clearTimeout(t);
      if (!res.ok) {
        addDebugLog(`Blob fetch HTTP ${res.status} ${u}`);
        return false;
      }

      // Check if response is a data URL (text) or blob
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/plain')) {
        // It's a data URL as text
        const dataUrl = await res.text();
        if (!dataUrl || !dataUrl.startsWith('data:')) {
          addLog(`Data URL non valido per valenza ${stimulusOrder}: ${dataUrl.substring(0, 50)}`, "error");
          return false;
        }
        // Use data URL directly, no need for createObjectURL
        setFinalImageUrl(dataUrl);
        addLog(`URL data ottenuto per valenza ${stimulusOrder}`);
        imageFound = true;
        return true;
      } else {
        // It's a blob
        const blob = await res.blob();
        if (!blob || blob.size === 0) { addLog(`Blob vuoto per valenza ${u}`); return false; }
        const obj = URL.createObjectURL(blob);
        setBlobObjectUrl(obj);
        setFinalImageUrl(obj);
        addDebugLog(`Fetch blob riuscito per valenza ${stimulusOrder}`);
        imageFound = true;
        return true;
      }
    } catch (e) {
      addLog(`Fetch data fallito per valenza ${stimulusOrder}: ${e?.message || e}, url ${u}, immagine ${stimulusFile}`, "error");
      setErrore("Impossibile caricare l'immagine")
      return false;
    }
  };

  return (
    <div className="stimolo-valutazione">

      <IstruzioniStimoli />

      {/* Contenuto principale della pagina */}
      < div className="stimolo-titolo-immagine" >
        <div className="stimolo-titolo">
          <h3>Immagine {stimulusOrder}/10</h3>
          {errore && <p style={{ color: "red" }}>⚠️ Errore: {errore}</p>}
        </div>
        <div className="image-container">
          {!imageError ? (
            <img
              src={
                finalImageUrl ||
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjN5MjF5OHB5ejRxOWs4dG5oc3hkYzV5NDBwNzdxenpsNzlmaWNiNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hWZBZjMMuMl7sWe0x8/giphy.gif"
              }
              alt={stimulusFile || "Stimolo"}
              className="image"
              onLoad={() => {
                setImageError(false);
                setRetryCount(0); // Reset contatore dopo successo
              }}
              onError={() => {
                addLog(`Errore caricamento valenza: ${finalImageUrl}`, "error");
                setImageError(true);
              }}
            />
          ) : (
            //se viene mostrato il testo alt viene mostrato il messaggio e l'icona per ricaricare l'immagine
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ marginBottom: "10px", color: "red" }}>
                {retryCount < 2
                  ? `Ricaricamento automatico in corso... (tentativo ${retryCount + 1}/2)`
                  : "Controlla la tua connessione e prova a ricaricare l'immagine premendo il pulsante qui sotto."}
              </p>
              {retryCount >= 2 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <Button variant="contained" size="small" onClick={handleReloadImage}>Ricarica</Button>
                  <Tooltip title="Prova a scaricare immagine">
                    <IconButton color="primary" onClick={() => {
                      const savedUrl = safeStorage.getItem(`stimulusURL${stimulusOrder}`);
                      if (savedUrl) {
                        const separator2 = savedUrl.includes('?') ? '&' : '?';
                        const url = `${savedUrl}${separator2}t=${Date.now()}`;
                        handleReloadImage; // will also call fetchImageAsBlob
                      }
                    }}>
                      <SyncOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>
          )}
        </div>
        {errore === "Immagine non trovata nella cache" && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <p style={{ color: "red", marginBottom: 8 }}>
              Le immagini non sono state caricate correttamente.
            </p>
            <Button variant="contained" size="small" onClick={() => navigate('/intro-stimoli')}>
              Ricarica immagini
            </Button>
          </div>
        )}
        {errore === "Impossibile caricare l'immagine" && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <p style={{ color: "red", marginBottom: 8 }}>
              Non è stato possibile cariare questa immagine
            </p>
            <Button variant="contained" size="small" onClick={() => {setErrore(null); handleReloadImage();}}>
              Ricarica immagine
            </Button>
            <br/>
            <Button variant="contained" size="small" onClick={() => {setValence(-1); handleNext()}}>
              Prossimo step
            </Button>
          </div>
        )}
      </div >
      {valutazione && (
        <div className="valutazione-blocco">
          <div className="valutazione-titolo">
            <h3 className="blue">L'immagine è</h3>
          </div>
          <div className="valenza">
            <h4 className="blue valutazione-h4">Valenza</h4>
            <div className="valutazione">
              {["Molto negativa", "Negativa", "Neutrale", "Positiva", "Molto positiva"].map((v) => (
                <Button
                  key={v}
                  variant={valence === v ? "contained" : "outlined"}
                  value={v}
                  onClick={onValenceSelection}
                  className="valutazione-buttons"
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>
          <div className="red">
            <p>*completa tutti i campi prima di procedere.</p>
          </div>
          <div className="arrow-right">
            <Button variant="contained" disabled={!valence} onClick={handleNext}>  <EastSharpIcon /></Button>
          </div>
        </div>
      )
      }
    </div >
  )
}

export default StimoloValenza