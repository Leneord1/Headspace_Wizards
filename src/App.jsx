import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./Components/HomeScreen.jsx";
import CalendarPage from "./Components/calenderPage.jsx";
import ImportEvents from "./Components/importEvents.jsx";
import ReportPage from "./Components/ReportPage.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/calendar-page" element={<CalendarPage />} />
        <Route path="/importEvents" element={<ImportEvents />} />
        <Route path="/reports" element={<ReportPage />} />
      </Routes>
    </Router>
  )
}