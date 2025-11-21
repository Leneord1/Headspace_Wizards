const viteLogo = '/vite.svg';
import reactLogo from "../assets/react.svg";
import EventButton from "./EventButton.jsx";
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";

export default function HomeScreen(){
    const navigate = useNavigate();

    function handleCalender() {
        navigate('/calendar-page');
    }
    function handleImport() {
        navigate('/importEvents');
    }
    function handleReports() {
        navigate('/reports');
    }

    return(
        <>
            <div>
                <a href="https://vite.dev" target="_blank" rel="noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>What is going on?</h1>
            <div className="card">
                <EventButton />
                <Button onClick={handleCalender}>Calendar</Button>
                <Button onClick={handleImport}>Import Data</Button>
                <Button onClick={handleReports}>Reports</Button>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}