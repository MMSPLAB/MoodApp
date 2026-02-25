import React, { useState, useEffect } from 'react'
import './App.css'
import Home from "./components/00Home"
import UserID from './components/SetUp/00UserID'

function App() {
  const [isFirstVisit, setIsFirstVisit] = useState(null)

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited')
    setIsFirstVisit(!hasVisited)
  }, [])

  const handleRegistrationComplete = () => {
    localStorage.setItem('hasVisited', 'true')
    setIsFirstVisit(false)
  }

  if (isFirstVisit === null) {
    return <div>Caricamento...</div>
  }

  return (
    <div className='App'>
      {isFirstVisit ? (
        <UserID onRegistrationComplete={handleRegistrationComplete} />
      ) : (
        <Home />
      )}
    </div>
  )
}

export default App
