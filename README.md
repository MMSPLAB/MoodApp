# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Procedura per effettuare modifiche e visualizzarle:
- Compilare l'app React per il web: npm run build
- Tramite Vite, avviare l'applicazione su server di sviluppo: npm run dev (poi q + enter per continuare a fare altro)
- Sincronizzare i file web con Capacitor: npx cap sync
- Aprire Android Studio: npx cap open android
- Avviare emulatore tramite Android Studio o con: npx cap run android

(reimportare material npm install @mui/material @emotion/react @emotion/styled @mui/x-date-pickers)

npm install @mui/icons-material


Aggiornare github:
(npm install gh-pages)
1. git init
2. git add .
3. git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/MMSPLAB/MMSP-MoodApp.git
git push -u origin main
