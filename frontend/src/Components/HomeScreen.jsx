import viteLogo from "../assets/vite.svg";
import reactLogo from "../assets/react.svg";
import EventButton from "./EventButton.jsx";
import Calendar from "./Calendar.jsx";
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";



export default function HomeScreen(){
    const navigate = useNavigate();

    return(
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
                <EventButton eventName="Eat"></EventButton>


            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )

}