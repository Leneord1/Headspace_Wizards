import viteLogo from "../assets/vite.svg";
import reactLogo from "../assets/react.svg";
import EventButton from "./EventButton.jsx";
import Calendar from "./Calendar.jsx";
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import dayjs from "dayjs";
import {useNavigate} from "react-router-dom";
import GoodButton from "./GoodButton.jsx";
import BadButton from "./BadButton.jsx";



export default function HomeScreen(){
    const navigate = useNavigate();

    return(
        <>
            <div>

            </div>
            <h1>What is going on?</h1>
            <div className="container">
                <GoodButton eventName="Eat" className="HomepageButtons"/>
                <GoodButton eventName="Exercise" className="HomepageButtons"/>
                <GoodButton eventName="Socialize" className="HomepageButtons"/>

                <br/>

                <BadButton eventName="Substance" className="HomepageButtons"/>
                <BadButton eventName="Doom Scroll" className="HomepageButtons"/>
                <BadButton eventName="Smoke" className="HomepageButtons"/>
                <br/>
                <EventButton eventName="+" className="HomepageButtons"/>


            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )

}