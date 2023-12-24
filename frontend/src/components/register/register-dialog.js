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
import { NotificationManager } from "react-notifications"

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

export const RegisterDialog = ({ open, handleClose, handleSubmit }) => {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [role, setRole] = useState("")

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        return isValid
    }
    const onSubmit = (event) => {
        event.preventDefault()
        if(username=="" || email=="" || password=="" || confirmPassword=="" || role==""){
            NotificationManager.error("Enter all fields")
        }else{
            if(validateEmail(email)){
                if(password==confirmPassword){
                    handleSubmit(email, username, password, role)
                }else{
                    NotificationManager.error("Password did not match")
                }
            }else{
                NotificationManager.error("Enter valid email")
            } 
        }
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
                    autoFocus
                    margin="dense"
                    id="email"
                    label="Email"
                    type="email"
                    fullWidth
                    variant="standard"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <TextField
                    margin="dense"
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div style={{marginTop:"10px", display:'flex', justifyContent:'space-evenly'}}>
                    <span>
                        <input type="radio" id="admin" name="role" value="admin" style={{accentColor:"#0000FF"}} checked={role==="admin"} onChange={()=>setRole("admin")}/>
                        <label htmlFor="admin">Admin</label>
                    </span>
                    <span>
                        <input type="radio" id="user" name="role" value="guest" style={{accentColor:"#0000FF"}} checked={role==="guest"} onChange={()=>setRole("guest")}/>
                        <label htmlFor="user">User</label>
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
