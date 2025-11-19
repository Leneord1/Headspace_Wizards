import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import EventButton from "./Components/EventButton.jsx";

function App() {

    /*
    Navigation Documentation Page
    https://react.dev/learn/react-compiler/installation
     */
  const [count, setCount] = useState(0)

  return (
    <>
    <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>What is going on?</h1>
      <div className="card">
        <EventButton/>
          <EventButton/>
          <br/>
          <EventButton/>
          <EventButton/>
          <br/>
          <EventButton/>
          <EventButton/>

      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
