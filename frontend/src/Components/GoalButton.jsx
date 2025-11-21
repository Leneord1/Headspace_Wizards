import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import './EventButton.css';
import TextField from '@mui/material/TextField';
import {useState} from "react";
import {FormControl, FormControlLabel, FormLabel, Input, Radio, RadioGroup} from "@mui/material";


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 5,
};

export default function GoalButton(){

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [currentDate, setCurrentDate] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(1);
    const [trigger, setTrigger] = useState('');
    //const [currTime, setCurrentTime] = useState<Dayjs | null>(dayjs('2025-04-17T15:30'))




    function handleSubmit(){

            const submission = {
                "name": name,
                "date": currentDate,
                "description": description,
                "duration": duration,
                "trigger": trigger,

            }


        if (typeof submission.date !== "undefined") {
            console.log('works' + submission.date);
        } else console.log('broke');
    }


    return (
        <div>
            <Button onClick={handleOpen} variant="contained">
                Add Goal
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description">

                <Box sx={style}>
                    <Button onClick={handleClose} size="small" variant="outlined" >Close</Button>


                    <br/>
                    <TextField
                        required
                        size="small"
                        id="outlined-required"
                        label="Name"
                        defaultValue={name}
                        placeholder="Name"
                        className="inputbuttons"

                    />
                    <TextField
                        type="number"
                        size="small"
                        label="Duration(mins)"
                        className="inputbuttons"
                        value={duration}
                        onChange={((e) => setDuration(e.target.value))}
                    />
                    <TextField

                        size="small"
                        id="outlined-required"
                        label="Why?"
                        value={trigger}
                        onChange={((e) => setTrigger(e.target.value))}
                        placeholder="Why"
                        className="inputbuttons"

                    />
                    <TextField
                        type="date"

                        value={currentDate}
                        onChange={((e) => setCurrentDate(e.target.value))}

                    />


                    <TextField

                        variant="outlined"
                        id="description"
                        fullWidth
                        placeholder="Description"
                        value={description}
                        onChange={((e) => setDescription(e.target.value))}

                    />
                    <Button onClick={handleSubmit}>Submit</Button>
                </Box>

            </Modal>
        </div>
    );
}