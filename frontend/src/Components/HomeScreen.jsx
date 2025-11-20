import viteLogo from "../../public/vite.svg";
import reactLogo from "../assets/react.svg";
import EventButton from "./EventButton.jsx";


export default function HomeScreen(){

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
                <EventButton></EventButton>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )

}