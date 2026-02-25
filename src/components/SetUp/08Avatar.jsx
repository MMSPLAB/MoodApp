import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router';
import WestSharpIcon from '@mui/icons-material/WestSharp';
import EastSharpIcon from '@mui/icons-material/EastSharp';
import safeStorage from "../../../safeStorage";

const avatars = [
  { id: 'female', value: 'avatarFemale', source: "/immaginiAvatar/singleimages_female-0-CHOOSE.png" },
  { id: 'robot', value: 'avatarRobot', source: "/immaginiAvatar/singleimages_robot-0-CHOOSE.png" },
  { id: 'male', value: 'avatarMale', source: "/immaginiAvatar/singleimages_male-0-CHOOSE.png" }
]

function SceltaAvatar() {
  //gestire l'avatar scelto
  const [selectedAvatar, setSelectedAvatar] = useState(""); //creo uno stato momentaneamente vuoto in formato stringa

  //recuperare dal locale l'avatar salvato
  //ho spostato lo useEffect qui sopra perché ricaricando la pagina l'avatar non rimaneva in memoria nel safeStorage se il recupero dell'avatar era dopo il salvataggio in locale
  useEffect(() => {
    const savedAvatar = safeStorage.getItem("selectedAvatar");
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar);
    }
  }, []);

  //salvataggio temporaneo nello useState dell'avatar scelto
  const onAvatarSelection = (selected) => {
    selected.preventDefault();
    const selectedAvatar = selected.currentTarget.value;
    setSelectedAvatar(selectedAvatar); //qui invece dell'evento di per sé (selected), prendiamo solo il contenuto della variabile
    console.log(selectedAvatar);
  }

  //salvare in locale l'avatar scelto
  useEffect(() => {
    safeStorage.setItem("selectedAvatar", selectedAvatar); //stringify non può salvare oggetti circolari come eventi
  }, [selectedAvatar]);


  //array delle diverse opzioni di avatar, usando map per renderizzarle in maniera reiterativa
  const myList = avatars.map((avatar) =>
    <Button variant="text" key={avatar.id} value={avatar.value} name="avatar" onClick={onAvatarSelection} >
      <img src={avatar.source} alt={avatar.value} className={`avatar ${selectedAvatar === avatar.value ? "selected" : ""}`} />
    </Button>
  )

  const navigate = useNavigate();

  return (
    <div>
      <div className="arrow-left">
        <Button variant="outlined" onClick={() => navigate("/generalità")}>   <WestSharpIcon /> </Button>
      </div>
      <div>
        <div className="avatar-titolo">
          <h1>Seleziona il tuo avatar</h1>
        </div>
        <div className="avatar-scroll-wrapper">
          <div className="avatar-scroll-container">
            {myList}
          </div>
        </div>
      </div>
      <div className="red">
        <p>*completa tutti i campi prima di procedere.</p>
      </div>
      <div className="arrow-right">
        <Button variant="contained" disabled={!selectedAvatar} onClick={() => navigate("/fine-prima-parte-registrazione")} > <EastSharpIcon /></Button>
      </div>
    </div>
  )
}

export default SceltaAvatar;