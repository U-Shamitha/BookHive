import { useState, forwardRef } from "react"
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slide,
} from "@mui/material"

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

export const BorrowReqForm = ({ open, handleClose, handleSubmit, isbn, userId, borrowReqId  }) => {
    const [dueDate, setDueDate] = useState("")

    const onSubmit = (event) => {
        event.preventDefault()
        handleSubmit(isbn, userId, borrowReqId, new Date(dueDate).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' } ))
    }

    const handleEnterKeyDown = (event) => {
        if (event.key === "Enter") {
            onSubmit(event)
        }
    }

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            onKeyDown={handleEnterKeyDown}
        >
            <DialogTitle>Edit Borrow Request</DialogTitle>
            <DialogContent>
                <p>Enter Due Date</p>
                <TextField
                    autoFocus
                    margin="dense"
                    id="dueDate"
                    type="datetime-local"
                    fullWidth
                    variant="standard"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{margin:'10px'}}>
                <Button variant="text" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="contained" type="submit" onClick={onSubmit}>
                    Edit
                </Button>
            </DialogActions>
        </Dialog>
    )
}
