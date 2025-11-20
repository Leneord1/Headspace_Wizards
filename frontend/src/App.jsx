
import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import HomeScreen from "./Components/HomeScreen.jsx";

/*
    Navigation Documentation Page
    https://reactnavigation.org/docs/getting-started/
     */



  return (
    <>
    <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
      <Router>
          <Routes>
              <Route path="/" element={<HomeScreen />} />

          </Routes>
      </Router>
  )
}
