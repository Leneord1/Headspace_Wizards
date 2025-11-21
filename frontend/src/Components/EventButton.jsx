import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import './EventButton.css';
import TextField from '@mui/material/TextField';
import NumberSpinner from './NumberSpinner.jsx'
import {useState} from "react";
import {FormControl, FormControlLabel, FormLabel, Input, Radio, RadioGroup} from "@mui/material";
import Calendar from "./Calendar.jsx";
import {MobileTimePicker} from "@mui/x-date-pickers/MobileTimePicker";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, {Dayjs} from "dayjs";
import {MobileDateTimePicker} from "@mui/x-date-pickers";


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

export default function EventButton(props){

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [radioValue, setValue] = useState('good');
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(1);
    //const [currTime, setCurrentTime] = useState<Dayjs | null>(dayjs('2025-04-17T15:30'))

    const name = props.eventName;



    function handleSubmit(){
        const submission = {
            "name": name,
            "date": currentDate,
            "description": description,
            "radioValue": radioValue,
            "duration": duration,

        }

        if (typeof submission.date !== undefined) {
        console.log('works');
        } else console.log('broke');
    }



    return (
        <div>
            <Button onClick={handleOpen} variant="contained">
                {name}
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description">

                <Box sx={style}>
                    <Button onClick={handleClose} size="small" variant="outlined" >Close</Button>

                    <FormControl >
                        <RadioGroup
                            className="radio"
                            row
                            aria-setsize="small"
                            aria-labelledby="demo-radio-buttons-group-label"
                            name="radio-buttons-group"
                            value={radioValue}
                            onChange={((e) => setValue(e.target.value))}
                        >
                            <FormControlLabel value="good" control={<Radio />} label="Good" />
                            <FormControlLabel value="bad" control={<Radio />} label="Bad" />
                        </RadioGroup>
                    </FormControl>

                    <br/>
                    <TextField
                        disabled
                        size="small"
                        id="outlined-required"
                        label="Name"
                        defaultValue={name}
                        placeholder="Name"
                        className="inputbuttons"

                    />
                    <TextField
                        type="number"
                        label="Duration"
                        defaultValue={60}
                        className="inputbuttons"
                        value={duration}
                        onChange={((e) => setDuration(e.target.value))}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['TimePicker']}>
                            <MobileDateTimePicker
                                inputFormat={"YYYY-MM-DD HH:mm"}
                                value={currentDate}
                                onChange={(date) => setCurrentDate((date.target.value))}
                            />
                        </DemoContainer>
                    </LocalizationProvider>


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