import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from "react-router";
import { HashRouter} from "react-router";

import ScrollToTop from './ScrollToTop.jsx';

import UserID from './components/SetUp/00UserID.jsx';
import UserIDEsistente from './components/SetUp/00UserIDEsistente.jsx';
import UserIDNuovo from './components/SetUp/00UserIDNuovo.jsx';
import IdDimenticato from './components/SetUp/01DimenticatoID.jsx';
import IntroduzioneEsperimento from './components/SetUp/02IntroduzioneEsperimento.jsx';
import InformativaPrivacy from './components/SetUp/03InformativaPrivacy.jsx';
import TerminiCondizioni from './components/SetUp/04TerminiCondizioni.jsx';
import AttivazioneNotifiche from './components/SetUp/05AttivazioneNotifiche.jsx';
import SelezioneOrarioNotifiche from './components/SetUp/06SelezioneOrarioNotifiche.jsx';
import Generality from './components/SetUp/07Generalità.jsx';
import SceltaAvatar from "./components/SetUp/08Avatar.jsx";
import FineSetUp from './components/SetUp/09FineSetUp.jsx';
import PANASIntro from './components/01PANASIntroduzione.jsx';
import PANAS from './components/02PANAS.jsx';
import HEXACOIntro from './components/03HEXACOIntroduzione.jsx';
import HEXACO from './components/04HEXACO.jsx';
import FineRegistrazione from './components/05FineRegistrazione.jsx';

import PickAMood from './components/PickAMood/00PickAMood.jsx';
import MoodIntensity from './components/PickAMood/02MoodIntensity.jsx';
import EsercizioFisico from './components/PickAMood/03EsercizioFisico.jsx';
import IntroduzionePickAMood from './components/PickAMood/04IntroduzioneStimoli.jsx';
import StimoloValenza from './components/PickAMood/05StimoloValenza.jsx';
import StimoloAttivazione from './components/PickAMood/06StimoloAttivazione.jsx';
import FinePickAMood from './components/PickAMood/07FineQuestionario.jsx';
import NotFound from './components/404.jsx';

import FineEsperimento from './components/06FineEsperimento.jsx';

createRoot(document.getElementById('root')).render(
  <>
    <StrictMode>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="user-ID" element={<UserID />} />
          <Route path='user-ID-esistente' element={<UserIDEsistente />} />
          <Route path='user-ID-nuovo' element={<UserIDNuovo />} />
          <Route path="ID-dimenticato" element={<IdDimenticato />} />
          <Route path="introduzione-esperimento" element={<IntroduzioneEsperimento />} />
          <Route path="informativa-privacy" element={<InformativaPrivacy />} />
          <Route path="termini-e-condizioni" element={<TerminiCondizioni />} />
          <Route path="attivazione-notifiche" element={<AttivazioneNotifiche />} />
          <Route path="selezione-orario-notifiche" element={<SelezioneOrarioNotifiche />} />
          <Route path="generalità" element={<Generality />} />
          <Route path="scelta-avatar" element={<SceltaAvatar />} />
          <Route path="fine-prima-parte-registrazione" element={<FineSetUp />} />
          <Route path="panas-introduzione" element={<PANASIntro />} />
          <Route path="panas/:type/:questionNumber" element={<PANAS />} />
          <Route path="hexaco-introduzione" element={<HEXACOIntro />} />
          <Route path="hexaco/:questionNumber" element={<HEXACO />} />
          <Route path="fine-seconda-parte-registrazione" element={<FineRegistrazione />} />

          <Route path="pick-a-mood" element={<PickAMood />} />
          <Route path="mood/:avatar/:moodId" element={<MoodIntensity />} />
          <Route path="esercizio-fisico" element={<EsercizioFisico />} />
          <Route path="intro-stimoli" element={<IntroduzionePickAMood />} />
          <Route path="stimolo-valenza/:stimulusOrder" element={<StimoloValenza />} />
          <Route path="stimolo-attivazione/:stimulusOrder" element={<StimoloAttivazione />} />
          <Route path="fine-pick-a-mood" element={<FinePickAMood />} />

          <Route path="/" element={<App />} />

          <Route path="fine-esperimento" element={<FineEsperimento />} />

          <Route path='*' element={<NotFound />} />
        </Routes>
      </HashRouter>
    </StrictMode>
  </>,
)
