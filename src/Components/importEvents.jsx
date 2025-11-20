import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";

export default function ImportEvents() {
    const navigate = useNavigate();

    function handleReturn() {
        navigate('/');
    }
    return (
        <div className="importEvents">
            <Button onClick={handleReturn}>Return</Button>
            <h1>Import Events Page</h1>
        </div>
    )
}