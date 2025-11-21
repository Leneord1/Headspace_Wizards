
import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import HomeScreen from "./Components/HomeScreen.jsx";

/*
    Navigation Documentation Page
    https://reactnavigation.org/docs/getting-started/
     */



export default function App() {


  return (
      <Router>
          <Routes>
              <Route path="/" element={<HomeScreen />} />


          </Routes>
      </Router>
  )
}
