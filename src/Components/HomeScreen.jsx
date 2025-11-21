import GoodButton from "./GoodButton.jsx";

const viteLogo = '/vite.svg';
import reactLogo from "../assets/react.svg";
import EventButton from "./EventButton.jsx";
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import BadButton from "./BadButton.jsx";

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

    function handleGoalNav(){
        navigate("/goals");
    }

    /*
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
        <img src={viteLogo} className="logo" alt="Vite logo" />
    </a>
    <a href="https://react.dev" target="_blank" rel="noreferrer">
        <img src={reactLogo} className="logo react" alt="React logo" />
    </a>

     */
    return(
        <>
            <div>
                <Button onClick={handleGoalNav}>Goals</Button>
            </div>
            <h1>What is going on?</h1>
            <div className="card">

                <GoodButton eventName="Eat" className="HomepageButtons"/>
                <GoodButton eventName="Exercise" className="HomepageButtons"/>
                <GoodButton eventName="Socialize" className="HomepageButtons"/>

                <br/>

                <BadButton eventName="Substance" className="HomepageButtons"/>
                <BadButton eventName="Doom Scroll" className="HomepageButtons"/>
                <BadButton eventName="Smoke" className="HomepageButtons"/>
                <br/>
                <EventButton eventName="+" className="HomepageButtons">+</EventButton>
                <Button onClick={handleCalender}>Calendar</Button>
                <Button onClick={handleImport}>Import Data</Button>
                <Button onClick={handleReports}>Reports</Button>
            </div>
        </>
    )
}