import GoalButton from "./GoalButton.jsx";
import Button from "@mui/material/Button";
import {useNavigate} from "react-router-dom";


export default function GoalPage() {
    const navigate = useNavigate();
    function handleReturn(){
        navigate(-1);
    }
    return(
        <>
            <Button onClick={handleReturn}>Return</Button>
            <GoalButton />
        </>
    )
}