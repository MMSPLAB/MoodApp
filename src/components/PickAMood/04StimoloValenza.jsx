import React, { useState, useEffect } from "react"
import { Button } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import EastSharpIcon from '@mui/icons-material/EastSharp';

function StimoloValenza() {
  const { stimulusOrder } = useParams();
  const navigate = useNavigate();

  const [savedUserID, setSavedUserID] = useState(localStorage.getItem("userID"));
  const [savedAvatar, setSavedAvatar] = useState(localStorage.getItem("selectedAvatar"));

  const [imageUrl, setImageUrl] = useState(null);
  const [stimulusFile, setStimulusFile] = useState(null);
  const [errore, setErrore] = useState(null);
  const [valence, setValence] = useState("");
  const [valutazione, setValutazione] = useState(""); //serve per la comparsa ritardata della valutazione dello stimolo
  const [startingTime, setStartingTime] = useState(null);

  //fa comparire la valenza dopo 1 secondo dalla comparsa dell'immagine
  useEffect(() => {
    if (imageUrl) {
      setValutazione(false);
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      setStartingTime(formattedTime)
      localStorage.setItem(`startingTime${stimulusOrder}`, formattedTime);
      console.log("Evaluation è iniziato alle:", formattedTime);

      const timer = setTimeout(() => {
        setValutazione(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [imageUrl]);

  //utilizzo useEffect per mandari i dati ad App Script senza dover compiere un'azione
  //invio dati con metodo GET
  useEffect(() => {
    if (!savedUserID || !savedAvatar) {
      console.warn("UserID o Avatar mancanti");
      return;
    }

    const savedValence = localStorage.getItem(`valence${stimulusOrder}`);
    if (savedValence) {
      setValence(savedValence);
    }

    const inviaDati = async () => {
      const baseUrl = "https://script.google.com/macros/s/AKfycbwLs-8Srd3BPEF6s9avgjQMqU6Ln1CS5xzghE-pcoD104g7TYp23vVfEPbUvVGqiwTwzw/exec"; //Script Somministrazione Stimoli
      const queryString = `?UserID=${savedUserID}&Avatar=${savedAvatar}&Stimolo=${stimulusOrder}`;
      const url = baseUrl + queryString;

      try {
        const response = await fetch(url);
        const json = await response.json();
        console.log("Risposta da Apps Script:", json);

        if (json.imageUrl) {
          setImageUrl(json.imageUrl);
          setStimulusFile(json.imageName);
          localStorage.setItem(`stimulusFile${stimulusOrder}`, json.imageName); //Questo poi le servirà anche per salvare la valutazione
          localStorage.setItem("stimulusOrder", stimulusOrder);
          localStorage.setItem(`stimulusURL${stimulusOrder}`, json.imageUrl)
          console.log("Nome immagine mostrata:", json.imageName);
          console.log("URL immagine:", json.imageUrl);
        } else {
          setErrore(json.error || "Risposta non valida dal server");
          console.error("Errore dal server:", json.error || json);
        }
      } catch (err) {
        setErrore("Errore di rete o parsing");
        console.error("Errore di rete:", err);
      }
    };

    inviaDati();
  }, [savedUserID, savedAvatar, stimulusOrder]);

  const onValenceSelection = (selected) => {
    const valence = selected.currentTarget.value;
    setValence(valence);
    console.log(valence);
  }

  useEffect(() => {
    localStorage.setItem(`valence${stimulusOrder}`, valence);
  }, [valence, stimulusOrder]);

  const handleNext = () => {
    // Naviga alla pagina di valutazione per questo stimolo
    navigate(`/stimolo-attivazione/${stimulusOrder}`);
  };

  return (
    <div className="stimolo-valutazione">
      <div className="stimolo-titolo-immagine">
        <div className="stimolo-titolo">
          <h3>Immagine {stimulusOrder}/10</h3>
          {errore && <p style={{ color: "red" }}>⚠️ Errore: {errore}</p>}
        </div>
        <div className="image-container">
          <img
            src={
              imageUrl ||
              "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjN5MjF5OHB5ejRxOWs4dG5oc3hkYzV5NDBwNzdxenpsNzlmaWNiNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hWZBZjMMuMl7sWe0x8/giphy.gif"
            }
            alt={imageUrl ? "Stimolo" : "Loading"}
            className="image"
          />
        </div>
      </div>
      {valutazione && (
        <div className="valutazione-blocco">
          <div className="valutazione-titolo">
            <h3 className="blue">L'immagine è</h3>
          </div>
          <div className="valenza">
            <h4 className="blue">Valenza</h4>
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
          <div className="arrow-right">
            <Button variant="contained" disabled={!valence} onClick={handleNext}>{/* → */} <EastSharpIcon /></Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StimoloValenza