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
import { blue } from "@mui/material/colors"

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

export const RegisterDialog = ({ open, handleClose, handleSubmit }) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("")

    const onSubmit = (event) => {
        event.preventDefault()
        handleSubmit(username, password, role)
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
            <DialogTitle>Register</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="username"
                    label="Username"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="password"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div style={{marginTop:"10px", display:'flex', justifyContent:'space-evenly'}}>
                    <span>
                        <input type="radio" id="admin" name="role" value="admin" style={{accentColor:"#0000FF"}} checked={role==="admin"} onChange={()=>setRole("admin")}/>
                        <label for="admin">Admin</label>
                    </span>
                    <span>
                        <input type="radio" id="user" name="role" value="guest" style={{accentColor:"#0000FF"}} checked={role==="guest"} onChange={()=>setRole("guest")}/>
                        <label for="user">User</label>
                    </span>
                </div>

            </DialogContent>
            <DialogActions sx={{margin:'10px'}}>
                <Button variant="text" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="contained" type="submit" onClick={onSubmit}>
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    )
}
