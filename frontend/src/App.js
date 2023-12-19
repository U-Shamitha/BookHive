import React, { Suspense } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { Container } from "@mui/material"
import { NotificationContainer } from "react-notifications"
import { AppLayout } from "./components/layout/app-layout"
import { UserProvider } from "./context/user-context"
import io from 'socket.io-client'
import { serverUrl } from "./urls/serverDetails"

export const socket = io(serverUrl);

export const App = () => (
  <UserProvider>
    <Suspense fallback={null}>
      <div height="100%" style={{backgroundImage:"url('/img1.jpg')", backgroundRepeat:'contain', backgroundSize: '100%', margin:'0px', padding:'0px', width:'100% !important', height:'100%', overflow:'hidden', minHeight:'97vh'}}>
      {/* <Container className="page-container"> */}
        <Router>
          <AppLayout />
          <NotificationContainer />
        </Router>
      {/* </Container> */}
      </div>
    </Suspense>
  </UserProvider>
)
